
const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const isValidObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

const getUserCart = async (userId, populate = false) => {
  const query = Cart.findOne({
    user: userId,
  });

  if (populate) {
    query.populate("items.product");
  }

  return query;
};

const createUserCart = async (userId) => {
  try {
    return await Cart.create({
      user: userId,
      items: [],
    });
  } catch (error) {
    if (error?.code === 11000) {
      return getUserCart(userId);
    }

    throw error;
  }
};

const getOrCreateUserCart = async (userId) => {
  const existingCart = await getUserCart(userId);

  if (existingCart) {
    return existingCart;
  }

  return createUserCart(userId);
};

const validateQuantity = (quantity) => {
  const parsedQuantity = Number(quantity);

  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity < 1
  ) {
    return null;
  }

  return parsedQuantity;
};

const validateProductId = (productId) => {
  return isValidObjectId(productId);
};

const getActiveProduct = async (productId) => {
  return Product.findOne({
    _id: productId,
    isActive: true,
  });
};

const populateCart = async (cart) => {
  await cart.populate("items.product");
  return cart;
};

const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateUserCart(req.user.userId);

    await populateCart(cart);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body || {};

    if (!validateProductId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    const requestedQuantity = validateQuantity(quantity);

    if (!requestedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const product = await getActiveProduct(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cart = await getOrCreateUserCart(req.user.userId);

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    const newQuantity = existingItem
      ? existingItem.quantity + requestedQuantity
      : requestedQuantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items are available`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity: requestedQuantity,
      });
    }

    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body || {};

    if (!validateProductId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    const updatedQuantity = validateQuantity(quantity);

    if (!updatedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const product = await getActiveProduct(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (updatedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items are available`,
      });
    }

    const cart = await getUserCart(req.user.userId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (cartItem) => cartItem.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product is not in the cart",
      });
    }

    item.quantity = updatedQuantity;

    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!validateProductId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    const cart = await getUserCart(req.user.userId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Product is not in the cart",
      });
    }

    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await getUserCart(req.user.userId);

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
      });
    }

    if (cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
        cart,
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

