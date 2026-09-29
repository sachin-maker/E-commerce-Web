
const mongoose = require("mongoose");

const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const { indexProduct } = require("../services/productSearchService");

const PAYMENT_METHODS = ["COD"];

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "COD" } = req.body || {};

    /*
     * Validate shipping address before starting a database session.
     */
    if (
      !shippingAddress ||
      typeof shippingAddress.fullName !== "string" ||
      typeof shippingAddress.phone !== "string" ||
      typeof shippingAddress.addressLine !== "string" ||
      typeof shippingAddress.city !== "string" ||
      typeof shippingAddress.state !== "string" ||
      typeof shippingAddress.postalCode !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    const normalizedShippingAddress = {
      fullName: shippingAddress.fullName.trim(),
      phone: shippingAddress.phone.trim(),
      addressLine: shippingAddress.addressLine.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      postalCode: shippingAddress.postalCode.trim(),
    };

    const hasEmptyAddressField = Object.values(
      normalizedShippingAddress
    ).some((value) => !value);

    if (hasEmptyAddressField) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    const normalizedPaymentMethod = String(paymentMethod)
      .trim()
      .toUpperCase();

    if (!PAYMENT_METHODS.includes(normalizedPaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    /*
     * Start the MongoDB transaction only after
     * request validation has completed.
     */
    const session = await mongoose.startSession();

    /*
     * Store the product IDs whose stock was changed.
     * These products will be synchronized with Elasticsearch
     * only after the MongoDB transaction successfully commits.
     */
    const affectedProductIds = [];

    try {
      let populatedOrder;

      await session.withTransaction(async () => {
        /*
         * Load the user's cart inside the transaction.
         */
        const cart = await Cart.findOne({
          user: req.user.userId,
        })
          .populate("items.product")
          .session(session);

        if (!cart || cart.items.length === 0) {
          const error = new Error("Your cart is empty");
          error.statusCode = 400;
          throw error;
        }

        let totalAmount = 0;
        const orderItems = [];

        /*
         * Validate products and atomically decrement stock.
         */
        for (const item of cart.items) {
          const product = item.product;

          if (!product || !product.isActive) {
            const error = new Error(
              "One or more products are unavailable"
            );

            error.statusCode = 400;
            throw error;
          }

          if (
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
          ) {
            const error = new Error(
              `Invalid quantity for ${product.title}`
            );

            error.statusCode = 400;
            throw error;
          }

          /*
           * Atomic stock check + decrement.
           *
           * The update succeeds only when enough stock exists.
           */
          const stockUpdate = await Product.findOneAndUpdate(
            {
              _id: product._id,
              isActive: true,
              stock: {
                $gte: item.quantity,
              },
            },
            {
              $inc: {
                stock: -item.quantity,
              },
            },
            {
              new: true,
              session,
            }
          );

          if (!stockUpdate) {
            const error = new Error(
              `Insufficient stock for ${product.title}`
            );

            error.statusCode = 400;
            throw error;
          }

          /*
           * Record this product so Elasticsearch can be
           * synchronized after the transaction commits.
           */
          affectedProductIds.push(product._id);

          /*
           * Always calculate price from MongoDB.
           * Never trust a price sent by the frontend.
           */
          const itemTotal = product.price * item.quantity;

          totalAmount += itemTotal;

          orderItems.push({
            product: product._id,
            title: product.title,
            thumbnail: product.thumbnail,
            price: product.price,
            quantity: item.quantity,
          });
        }

        /*
         * Create the order inside the same transaction.
         */
        const [createdOrder] = await Order.create(
          [
            {
              user: req.user.userId,
              items: orderItems,
              totalAmount,
              shippingAddress: normalizedShippingAddress,
              paymentMethod: normalizedPaymentMethod,
              paymentStatus: "PENDING",
              orderStatus: "PLACED",
            },
          ],
          {
            session,
          }
        );

        /*
         * Clear the cart inside the same transaction.
         */
        cart.items = [];

        await cart.save({
          session,
        });

        /*
         * Populate the final order before returning it.
         */
        populatedOrder = await Order.findById(createdOrder._id)
          .populate("items.product")
          .session(session);
      });

      /*
       * The MongoDB transaction has successfully committed.
       *
       * Elasticsearch is intentionally updated AFTER the
       * transaction. MongoDB remains the source of truth.
       */
      let searchSync = {
        success: true,
        message: "Search index synchronized",
      };

      try {
        /*
         * Remove duplicate IDs in case the same product
         * somehow appears more than once in the cart.
         */
        const uniqueProductIds = [
          ...new Set(
            affectedProductIds.map((id) => id.toString())
          ),
        ];

        /*
         * Read the latest committed product state from MongoDB.
         */
        const affectedProducts = await Product.find({
          _id: {
            $in: uniqueProductIds,
          },
        });

        /*
         * Synchronize all affected products.
         */
        await Promise.all(
          affectedProducts.map((product) =>
            indexProduct(product)
          )
        );
      } catch (searchError) {
        /*
         * The order is already committed in MongoDB.
         * Never roll back a successful order because
         * Elasticsearch is temporarily unavailable.
         */
        console.error(
          "Elasticsearch stock synchronization failed after order creation:",
          searchError
        );

        searchSync = {
          success: false,
          message:
            "Order placed successfully, but search stock synchronization is pending",
        };
      }

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order: populatedOrder,
        searchSync,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Create order error:", error);

    const statusCode = error?.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode >= 500
          ? "Failed to place order"
          : error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const requestedPage = Number.parseInt(
      req.query.page,
      10
    );

    const requestedLimit = Number.parseInt(
      req.query.limit,
      10
    );

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(requestedLimit, 20)
        : 10;

    const skip = (page - 1) * limit;

    const filter = {
      user: req.user.userId,
    };

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate("items.product")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(
      totalOrders / limit
    );

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
      pagination: {
        currentPage: page,
        limit,
        totalOrders,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    /*
     * The user ID is part of the query.
     * This prevents one customer from accessing
     * another customer's order.
     */
    const order = await Order.findOne({
      _id: id,
      user: req.user.userId,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};


const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    let cancelledOrder;
    const affectedProductIds = [];

    await session.withTransaction(async () => {
      /*
       * Find the order belonging to the authenticated user.
       *
       * Including the user ID here prevents a customer from
       * cancelling another customer's order.
       */
      const order = await Order.findOne({
        _id: id,
        user: req.user.userId,
      }).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      /*
       * Only orders that have not shipped yet can be cancelled.
       */
      if (
        order.orderStatus !== "PLACED" &&
        order.orderStatus !== "CONFIRMED"
      ) {
        const error = new Error(
          `Order cannot be cancelled because its current status is ${order.orderStatus}`
        );

        error.statusCode = 400;
        throw error;
      }

      /*
       * Restore stock for every product in the order.
       */
      for (const item of order.items) {
        if (!mongoose.Types.ObjectId.isValid(item.product)) {
          const error = new Error(
            `Invalid product reference in order item: ${item.title}`
          );

          error.statusCode = 400;
          throw error;
        }

        const stockUpdate = await Product.updateOne(
          {
            _id: item.product,
          },
          {
            $inc: {
              stock: item.quantity,
            },
          },
          {
            session,
          }
        );

        if (stockUpdate.matchedCount !== 1) {
          const error = new Error(
            `Product not found while restoring stock: ${item.title}`
          );

          error.statusCode = 409;
          throw error;
        }

        affectedProductIds.push(item.product.toString());
      }

      /*
       * Change the order status only after all stock
       * restoration operations have succeeded.
       */
      order.orderStatus = "CANCELLED";

      await order.save({
        session,
      });

      cancelledOrder = order;
    });

    /*
     * MongoDB transaction has committed successfully.
     *
     * Synchronize the restored stock with Elasticsearch.
     */
    let searchSync = {
      success: true,
      message: "Search index synchronized",
    };

    try {
      const uniqueProductIds = [
        ...new Set(affectedProductIds),
      ];

      const affectedProducts = await Product.find({
        _id: {
          $in: uniqueProductIds,
        },
      });

      await Promise.all(
        affectedProducts.map((product) =>
          indexProduct(product)
        )
      );
    } catch (searchError) {
      /*
       * Cancellation is already committed in MongoDB.
       * Elasticsearch failure must not undo the cancellation.
       */
      console.error(
        "Elasticsearch stock synchronization failed after order cancellation:",
        searchError
      );

      searchSync = {
        success: false,
        message:
          "Order cancelled successfully, but search stock synchronization is pending",
      };
    }

    await cancelledOrder.populate("items.product");

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: cancelledOrder,
      searchSync,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    const statusCode = error?.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode >= 500
          ? "Failed to cancel order"
          : error.message,
    });
  } finally {
    await session.endSession();
  }
};




module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};

