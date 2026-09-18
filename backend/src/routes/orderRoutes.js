const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");

const router = express.Router();

router.use(protect);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;