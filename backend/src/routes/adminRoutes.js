const express = require("express");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);

router.get("/orders", getAllOrders);

router.patch("/orders/:id/status", updateOrderStatus);

router.post("/products", createProduct);

router.patch("/products/:id", updateProduct);

router.delete("/products/:id", deleteProduct);

module.exports = router;