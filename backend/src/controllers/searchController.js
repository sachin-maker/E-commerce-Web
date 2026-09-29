const {
  searchProducts,
  getSearchSuggestions,
} = require("../services/productSearchService");

const parsePositiveInteger = (value, fallback, maximum) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, maximum);
};

const searchProductsController = async (req, res) => {
  try {
    const {
      q = "",
      category,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      page = 1,
      limit = 20,
      sort = "relevance",
    } = req.query;

    const query = typeof q === "string" ? q.trim() : "";

    const parsedPage = parsePositiveInteger(
      page,
      1,
      Number.MAX_SAFE_INTEGER
    );

    const parsedLimit = parsePositiveInteger(
      limit,
      20,
      50
    );

    let parsedInStock;

    if (inStock === undefined || inStock === "") {
      parsedInStock = false;
    } else if (inStock === "true") {
      parsedInStock = true;
    } else if (inStock === "false") {
      parsedInStock = false;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid inStock value",
      });
    }

    const result = await searchProducts({
      query,
      category:
        typeof category === "string"
          ? category.trim()
          : undefined,
      minPrice,
      maxPrice,
      minRating,
      inStock: parsedInStock,
      page: parsedPage,
      limit: parsedLimit,
      sort:
        typeof sort === "string"
          ? sort
          : "relevance",
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Search products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search products",
    });
  }
};

const getSearchSuggestionsController = async (req, res) => {
  try {
    const {
      q = "",
      limit = 8,
    } = req.query;

    const query =
      typeof q === "string"
        ? q.trim()
        : "";

    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: [],
      });
    }

    const parsedLimit = parsePositiveInteger(
      limit,
      8,
      20
    );

    const suggestions =
      await getSearchSuggestions({
        query,
        limit: parsedLimit,
      });

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error(
      "Search suggestions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch search suggestions",
    });
  }
};

module.exports = {
  searchProductsController,
  getSearchSuggestionsController,
};