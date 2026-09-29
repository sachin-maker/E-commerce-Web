const express = require("express");

const {
  searchProductsController,
  getSearchSuggestionsController,
} = require("../controllers/searchController");

const router = express.Router();

router.get("/", searchProductsController);

router.get(
  "/suggestions",
  getSearchSuggestionsController
);

module.exports = router;