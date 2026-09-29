const mongoose = require("mongoose");
const Product = require("../models/productModel");
const { getSearchTerms } = require("../utils/searchSynonyms");

const MAX_PRODUCTS_PER_PAGE = 50;
const DEFAULT_PRODUCTS_PER_PAGE = 12;

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parsePositiveInteger = (value, fallback, maximum) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, maximum);
};

const parseNonNegativeInteger = (value, fallback) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

// Calculate search relevance
const calculateSearchScore = (product, searchTerms) => {
  const title = product.title?.toLowerCase() || "";
  const description = product.description?.toLowerCase() || "";
  const brand = product.brand?.toLowerCase() || "";
  const category = product.category?.toLowerCase() || "";

  let score = 0;

  searchTerms.forEach((term) => {
    const normalizedTerm = term.toLowerCase();

    // Highest priority: exact title match
    if (title === normalizedTerm) {
      score += 100;
    }

    // Title starts with search term
    if (title.startsWith(normalizedTerm)) {
      score += 80;
    }

    // Title contains search term
    if (title.includes(normalizedTerm)) {
      score += 60;
    }

    // Brand match
    if (brand.includes(normalizedTerm)) {
      score += 40;
    }

    // Category match
    if (category.includes(normalizedTerm)) {
      score += 30;
    }

    // Description match
    if (description.includes(normalizedTerm)) {
      score += 20;
    }
  });

  // Small rating bonus
  score += Number(product.rating || 0) * 2;

  return score;
};

// Get all products / search products / category products
const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      minPrice,
      maxPrice,
      page = 1,
      skip,
      limit = DEFAULT_PRODUCTS_PER_PAGE,
      sort = "relevance",
    } = req.query;

    const productsLimit = parsePositiveInteger(
      limit,
      DEFAULT_PRODUCTS_PER_PAGE,
      MAX_PRODUCTS_PER_PAGE
    );

    const hasExplicitSkip =
      skip !== undefined && skip !== "";

    const productsSkip = hasExplicitSkip
      ? parseNonNegativeInteger(skip, 0)
      : (parsePositiveInteger(page, 1, Number.MAX_SAFE_INTEGER) - 1) *
        productsLimit;

    const currentPage =
      Math.floor(productsSkip / productsLimit) + 1;

    const filter = {
      isActive: true,
    };

    // Category filter
    if (typeof category === "string" && category.trim()) {
      filter.category = category.trim().toLowerCase();
    }

    // Price filters
    const parsedMinPrice = Number(minPrice);
    const parsedMaxPrice = Number(maxPrice);

    const hasMinPrice =
      minPrice !== undefined &&
      minPrice !== "" &&
      Number.isFinite(parsedMinPrice) &&
      parsedMinPrice >= 0;

    const hasMaxPrice =
      maxPrice !== undefined &&
      maxPrice !== "" &&
      Number.isFinite(parsedMaxPrice) &&
      parsedMaxPrice >= 0;

    if (hasMinPrice && hasMaxPrice && parsedMinPrice > parsedMaxPrice) {
      return res.status(400).json({
        success: false,
        message: "Minimum price cannot exceed maximum price",
      });
    }

    if (hasMinPrice || hasMaxPrice) {
      filter.price = {};

      if (hasMinPrice) {
        filter.price.$gte = parsedMinPrice;
      }

      if (hasMaxPrice) {
        filter.price.$lte = parsedMaxPrice;
      }
    }

    // Search filters
    const normalizedSearch =
      typeof search === "string" ? search.trim() : "";

    let searchTerms = [];

    if (normalizedSearch) {
      searchTerms = getSearchTerms(normalizedSearch);

      const searchRegexes = searchTerms.map(
        (term) => new RegExp(escapeRegex(term), "i")
      );

      filter.$or = [
        ...searchRegexes.map((regex) => ({
          title: regex,
        })),
        ...searchRegexes.map((regex) => ({
          description: regex,
        })),
        ...searchRegexes.map((regex) => ({
          brand: regex,
        })),
        ...searchRegexes.map((regex) => ({
          category: regex,
        })),
      ];
    }

    const totalProducts = await Product.countDocuments(filter);

    /*
     * Relevance search
     *
     * Important:
     * Calculate relevance across all matching
     * products before pagination.
     */
    if (normalizedSearch && sort === "relevance") {
      const products = await Product.find(filter)
        .lean();

      const rankedProducts = products
        .map((product) => ({
          ...product,
          searchScore: calculateSearchScore(
            product,
            searchTerms
          ),
        }))
        .sort((a, b) => {
          if (b.searchScore !== a.searchScore) {
            return b.searchScore - a.searchScore;
          }

          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        });

      const paginatedProducts = rankedProducts.slice(
        productsSkip,
        productsSkip + productsLimit
      );

      return res.status(200).json({
        success: true,
        products: paginatedProducts,
        pagination: {
          currentPage,
          limit: productsLimit,
          totalProducts,
          totalPages: Math.ceil(
            totalProducts / productsLimit
          ),
        },
      });
    }

    // Server-side sorting
    let sortOption = {
      createdAt: -1,
      _id: 1,
    };

    switch (sort) {
      case "price-low":
        sortOption = {
          price: 1,
          _id: 1,
        };
        break;

      case "price-high":
        sortOption = {
          price: -1,
          _id: 1,
        };
        break;

      case "rating-high":
        sortOption = {
          rating: -1,
          _id: 1,
        };
        break;

      case "name-asc":
        sortOption = {
          title: 1,
          _id: 1,
        };
        break;

      case "name-desc":
        sortOption = {
          title: -1,
          _id: 1,
        };
        break;

      case "default":
      case "relevance":
      default:
        sortOption = {
          createdAt: -1,
          _id: 1,
        };
        break;
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(productsSkip)
      .limit(productsLimit)
      .lean();

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage,
        limit: productsLimit,
        totalProducts,
        totalPages: Math.ceil(
          totalProducts / productsLimit
        ),
      },
    });
  } catch (error) {
    console.error("Product search error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};



const getProductsByCategory = async (req, res) => {

  try {
    const { category } = req.params;

    const normalizedCategory = decodeURIComponent(category)
      .trim()
      .toLowerCase();

    const filter = {
      isActive: true,
      category: normalizedCategory,
    };

    

    const products = await Product.find(filter)
      .sort({
        createdAt: -1,
        _id: 1,
      })
      .skip(Number(req.query.skip) || 0)
      .limit(Number(req.query.limit) || 12)
      .lean();

    const totalProducts =
      await Product.countDocuments(filter);

    

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage:
          Math.floor(
            (Number(req.query.skip) || 0) /
              (Number(req.query.limit) || 12)
          ) + 1,
        limit: Number(req.query.limit) || 12,
        totalProducts,
        totalPages: Math.ceil(
          totalProducts /
            (Number(req.query.limit) || 12)
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get products by category error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category products",
    });
  }
};



// Get products by category

// const getProductsByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;

//     if (
//       typeof category !== "string" ||
//       !category.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Category is required",
//       });
//     }

//     const normalizedCategory =
//       decodeURIComponent(category)
//         .trim()
//         .toLowerCase();

//     /*
//      * Reuse the existing product listing logic.
//      *
//      * IMPORTANT:
//      * Explicitly create a new query object rather than
//      * relying on req.query mutation.
//      */
//     req.query = {
//       ...req.query,
//       category: normalizedCategory,
//     };

//     return getProducts(req, res);
//   } catch (error) {
//     console.error(
//       "Get products by category error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch category products",
//     });
//   }
// };



// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct(
      "category",
      {
        isActive: true,
      }
    );

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};


module.exports = {
  getProducts,
  getProductsByCategory,
  getProductById,
  getCategories,
};

