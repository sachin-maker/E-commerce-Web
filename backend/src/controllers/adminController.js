const mongoose = require("mongoose");

const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const {
  indexProduct,
  deleteProductFromIndex,
} = require("../services/productSearchService");

const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];


const ORDER_STATUS_TRANSITIONS = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};




const PRODUCT_FIELDS = [
  "title",
  "description",
  "price",
  "discountPercentage",
  "rating",
  "stock",
  "brand",
  "category",
  "thumbnail",
  "images",
  "isActive",
];

/**
 * Pagination helper
 */
const getPagination = (query) => {
  const parsedLimit = Number(query.limit);
  const parsedPage = Number(query.page);

  const limit = Math.min(
    Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 20, 1),
    100
  );

  const page = Math.max(
    Number.isFinite(parsedPage) ? parsedPage : 1,
    1
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

/**
 * Pagination response
 */
const paginationResponse = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});

/**
 * Pick only allowed product fields from request body.
 */
const pickProductFields = (body = {}) =>
  Object.fromEntries(
    PRODUCT_FIELDS
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
  );

/**
 * GET /admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const search = String(req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: paginationResponse(page, limit, total),
    });
  } catch (error) {
    console.error("Admin getAllUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/**
 * GET /admin/orders
 */
const getAllOrders = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const search = String(req.query.search || "").trim();

    const status = String(req.query.status || "")
      .trim()
      .toUpperCase();

    const filter = {};

    if (ORDER_STATUSES.includes(status)) {
      filter.orderStatus = status;
    }

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).distinct("_id");

      const searchConditions = [
        {
          user: {
            $in: matchingUsers,
          },
        },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({
          _id: search,
        });
      }

      filter.$or = searchConditions;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: paginationResponse(page, limit, total),
    });
  } catch (error) {
    console.error("Admin getAllOrders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/**
 * GET /admin/orders/:id
 */
const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id)
      .populate("user", "name email role")
      .populate("items.product");

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
    console.error("Admin getAdminOrderById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

/**
 * GET /admin/products
 */
const getAdminProducts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const search = String(req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: paginationResponse(page, limit, total),
    });
  } catch (error) {
    console.error("Admin getAdminProducts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/**
 * PATCH /admin/orders/:id/status
 */


/**
 * PATCH /admin/orders/:id/status
 *
 * Handles valid order status transitions.
 *
 * Cancellation rules:
 * - PLACED -> CANCELLED
 * - CONFIRMED -> CANCELLED
 * - SHIPPED cannot be cancelled
 *
 * When an order is cancelled before shipment:
 * - Product stock is restored.
 * - Order status is changed to CANCELLED.
 * - MongoDB transaction keeps both operations consistent.
 * - Elasticsearch is synchronized after the transaction commits.
 */
const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    const orderStatus = String(req.body.orderStatus || "")
      .trim()
      .toUpperCase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    let updatedOrder;
    const affectedProductIds = [];
    let wasCancelled = false;

    await session.withTransaction(async () => {
      /*
       * Fetch the latest order state inside the transaction.
       * This prevents using stale order information.
       */
      const existingOrder = await Order.findById(id).session(session);

      if (!existingOrder) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      /*
       * Prevent unnecessary updates.
       */
      if (existingOrder.orderStatus === orderStatus) {
        const error = new Error(`Order is already ${orderStatus}`);
        error.statusCode = 400;
        throw error;
      }

      /*
       * Validate the requested state transition.
       */
      const allowedTransitions =
        ORDER_STATUS_TRANSITIONS[existingOrder.orderStatus] || [];

      if (!allowedTransitions.includes(orderStatus)) {
        const error = new Error(
          `Cannot change order status from ${existingOrder.orderStatus} to ${orderStatus}`
        );

        error.statusCode = 400;
        throw error;
      }

      /*
       * Handle cancellation.
       *
       * Stock is restored only when the order is cancelled
       * before shipment.
       */
      if (orderStatus === "CANCELLED") {
        wasCancelled = true;

        for (const item of existingOrder.items) {
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
      }

      /*
       * Update the order status inside the same transaction.
       */
      updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
          orderStatus,
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      if (!updatedOrder) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }
    });

    /*
     * MongoDB transaction has committed successfully.
     *
     * Elasticsearch is updated afterwards because MongoDB
     * remains our source of truth.
     */
    let searchSync = {
      success: true,
      message: "Search index synchronized",
    };

    if (wasCancelled && affectedProductIds.length > 0) {
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
          affectedProducts.map((product) => indexProduct(product))
        );
      } catch (searchError) {
        console.error(
          "Elasticsearch synchronization failed after order cancellation:",
          searchError
        );

        searchSync = {
          success: false,
          message:
            "Order cancelled successfully, but search stock synchronization is pending",
        };
      }
    }

    /*
     * Populate user after the transaction.
     */
    await updatedOrder.populate("user", "name email");

    return res.status(200).json({
      success: true,
      message:
        orderStatus === "CANCELLED"
          ? "Order cancelled successfully"
          : "Order status updated successfully",
      order: updatedOrder,
      searchSync,
    });
  } catch (error) {
    console.error("Admin updateOrderStatus error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Failed to update order status"
          : error.message,
    });
  } finally {
    await session.endSession();
  }
};





/**
 * POST /admin/products
 *
 * MongoDB is the source of truth.
 * Elasticsearch is updated after the MongoDB product is created.
 */
const createProduct = async (req, res) => {
  try {
    const productData = pickProductFields(req.body);

    const product = await Product.create(productData);

    try {
      await indexProduct(product);

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
      });
    } catch (searchError) {
      console.error(
        "Elasticsearch indexing failed after product creation:",
        searchError
      );

      return res.status(201).json({
        success: true,
        message:
          "Product created successfully, but search indexing is pending",
        product,
        searchSync: {
          success: false,
          message: "Product was not indexed in search",
        },
      });
    }
  } catch (error) {
    console.error("Admin createProduct error:", error);

    return res.status(400).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

/**
 * PATCH /admin/products/:id
 *
 * MongoDB is updated first.
 * Elasticsearch receives the complete updated product.
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const updates = pickProductFields(req.body);

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "No valid product fields supplied",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    try {
      if (product.isActive) {
        await indexProduct(product);
      } else {
        await deleteProductFromIndex(product._id);
      }

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product,
      });
    } catch (searchError) {
      console.error(
        "Elasticsearch synchronization failed after product update:",
        searchError
      );

      return res.status(200).json({
        success: true,
        message:
          "Product updated successfully, but search indexing is pending",
        product,
        searchSync: {
          success: false,
          message: "Search index synchronization failed",
        },
      });
    }
  } catch (error) {
    console.error("Admin updateProduct error:", error);

    return res.status(400).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

/**
 * DELETE /admin/products/:id
 *
 * This is a soft delete.
 * MongoDB marks the product inactive and Elasticsearch removes it
 * from the search index.
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    try {
      await deleteProductFromIndex(product._id);

      return res.status(200).json({
        success: true,
        message: "Product deactivated successfully",
        product,
      });
    } catch (searchError) {
      console.error(
        "Elasticsearch deletion failed after product deactivation:",
        searchError
      );

      return res.status(200).json({
        success: true,
        message:
          "Product deactivated successfully, but search index cleanup is pending",
        product,
        searchSync: {
          success: false,
          message: "Product could not be removed from search index",
        },
      });
    }
  } catch (error) {
    console.error("Admin deleteProduct error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate product",
    });
  }
};

/**
 * GET /admin/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      revenue,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments(),

      Product.countDocuments({
        isActive: true,
      }),

      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: {
          $in: ["PLACED", "CONFIRMED", "SHIPPED"],
        },
      }),

      Product.countDocuments({
        isActive: true,
        stock: {
          $lte: 5,
        },
      }),

      Order.aggregate([
        {
          $match: {
            orderStatus: {
              $ne: "CANCELLED",
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5),

      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const dashboard = {
      totalUsers,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders,
      recentUsers,
    };

    return res.status(200).json({
      success: true,
      dashboard,
      stats: dashboard,
    });
  } catch (error) {
    console.error("Admin getDashboardStats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  getAllUsers,
  getAllOrders,
  getAdminOrderById,
  getAdminProducts,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
};