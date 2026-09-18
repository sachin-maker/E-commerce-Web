const express = require("express");

const {
  getProducts,
  getProductById,
  getCategories,
} = require("../controllers/productController");

const {
  searchProducts,
} = require("../controllers/productSearchController");

const router = express.Router();

// Get all products
router.get("/", getProducts);

// Get all categories
router.get("/categories", getCategories);

// Get products by category
router.get("/category/:category", (req, res) => {
  req.query.category = req.params.category;
  return getProducts(req, res);
});

router.get("/search", searchProducts);
router.get("/:id", getProductById);

module.exports = router;