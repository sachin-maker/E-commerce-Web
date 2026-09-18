const Product = require("../models/productModel");
const { getSearchTerms } = require("../utils/searchSynonyms");


// Get all products / search products / category products
const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      page,
      skip,
      limit = 12,
      sort = "relevance",
    } = req.query;

    const productsLimit = Math.min(
      Math.max(Number(limit) || 12, 1),
      50
    );

    const productsSkip =
      skip !== undefined
        ? Math.max(Number(skip) || 0, 0)
        : Math.max(Number(page ?? 1) - 1, 0) *
          productsLimit;

    const currentPage =
      Math.floor(productsSkip / productsLimit) + 1;

    const filter = {
      isActive: true,
    };

    // Category filter
    if (category.trim()) {
      filter.category = category.trim().toLowerCase();
    }

    let searchTerms = [];
    let searchRegexes = [];

    if (search.trim()) {
      searchTerms = getSearchTerms(search);

      searchRegexes = searchTerms.map(
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

    let productsQuery = Product.find(filter);

    // Amazon-style relevance sorting
    if (search.trim() && sort === "relevance") {
      const products = await Product.find(filter)
        .lean()
        .skip(productsSkip)
        .limit(productsLimit);

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

      const totalProducts = await Product.countDocuments(
        filter
      );

      return res.status(200).json({
        success: true,
        products: rankedProducts,
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

    // Normal sorting
    if (sort === "price-low") {
      productsQuery = productsQuery.sort({
        price: 1,
      });
    } else if (sort === "price-high") {
      productsQuery = productsQuery.sort({
        price: -1,
      });
    } else if (sort === "rating-high") {
      productsQuery = productsQuery.sort({
        rating: -1,
      });
    } else {
      productsQuery = productsQuery.sort({
        createdAt: -1,
      });
    }

    const [products, totalProducts] = await Promise.all([
      productsQuery
        .skip(productsSkip)
        .limit(productsLimit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    res.status(200).json({
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

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Escape special regex characters
const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// Calculate search relevance
const calculateSearchScore = (
  product,
  searchTerms
) => {
  const title = product.title?.toLowerCase() || "";
  const description =
    product.description?.toLowerCase() || "";
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

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", {
      isActive: true,
    });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
};