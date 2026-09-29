const express = require("express");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getAllUsers,
  getAllOrders,
  getAdminOrderById,
  getAdminProducts,
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

router.get("/orders/:id", getAdminOrderById);

router.patch("/orders/:id/status", updateOrderStatus);
router.get("/products", getAdminProducts);


router.post("/products", createProduct);

router.patch("/products/:id", updateProduct);

router.delete("/products/:id", deleteProduct);

module.exports = router;
