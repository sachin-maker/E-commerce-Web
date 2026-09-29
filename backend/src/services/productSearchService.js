const Product = require("../models/productModel");

/*
 * Elasticsearch compatibility functions
 *
 * Product indexing is temporarily disabled because production deployment
 * is using MongoDB only. These functions remain exported because
 * adminController and orderController currently call them.
 */

const indexProduct = async () => {
  return true;
};

const deleteProductFromIndex = async () => {
  return true;
};

/*
 * Build MongoDB filters
 */
const buildFilters = ({
  category,
  minPrice,
  maxPrice,
  minRating,
  inStock,
}) => {
  const filter = {
    isActive: true,
  };

  if (category) {
    filter.category = category.toLowerCase();
  }

  if (minPrice !== undefined && minPrice !== "") {
    filter.price = {
      ...(filter.price || {}),
      $gte: Number(minPrice),
    };
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    filter.price = {
      ...(filter.price || {}),
      $lte: Number(maxPrice),
    };
  }

  if (minRating !== undefined && minRating !== "") {
    filter.rating = {
      $gte: Number(minRating),
    };
  }

  if (inStock === true || inStock === "true") {
    filter.stock = {
      $gt: 0,
    };
  }

  return filter;
};

/*
 * Build text search conditions
 */
const buildSearchConditions = (query) => {
  if (!query || !query.trim()) {
    return null;
  }

  const searchTerm = query.trim();

  const regex = new RegExp(
    searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i"
  );

  return [
    { title: regex },
    { description: regex },
    { brand: regex },
    { category: regex },
  ];
};

/*
 * Search products using MongoDB
 */
const searchProducts = async ({
  query,
  category,
  minPrice,
  maxPrice,
  minRating,
  inStock,
  page = 1,
  limit = 20,
  sort = "relevance",
}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const filter = buildFilters({
    category,
    minPrice,
    maxPrice,
    minRating,
    inStock,
  });

  const searchConditions = buildSearchConditions(query);

  if (searchConditions) {
    filter.$or = searchConditions;
  }

  let sortOption = {};

  switch (sort) {
    case "price_asc":
    case "price-low-high":
      sortOption = { price: 1 };
      break;

    case "price_desc":
    case "price-high-low":
      sortOption = { price: -1 };
      break;

    case "rating":
      sortOption = { rating: -1, createdAt: -1 };
      break;

    case "newest":
      sortOption = { createdAt: -1 };
      break;

    case "relevance":
    default:
      /*
       * MongoDB does not provide the same relevance scoring that the
       * previous Elasticsearch implementation provided.
       *
       * We approximate relevance by prioritizing:
       * 1. Exact title match
       * 2. Title match
       * 3. Brand/category match
       * 4. Rating
       */
      if (query && query.trim()) {
        const searchTerm = query.trim();

        const escapedSearchTerm = searchTerm.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        const relevanceRegex = new RegExp(escapedSearchTerm, "i");

        sortOption = {
          rating: -1,
          createdAt: -1,
        };

        /*
         * Exact title matches are handled separately below.
         */
        const exactTitleFilter = {
          ...filter,
          title: {
            $regex: `^${escapedSearchTerm}$`,
            $options: "i",
          },
        };

        const exactTitleCount = await Product.countDocuments(
          exactTitleFilter
        );

        if (exactTitleCount > 0) {
          sortOption = {
            rating: -1,
            createdAt: -1,
          };
        }

        // Prevent unused-variable lint/build issues.
        void relevanceRegex;
      } else {
        sortOption = {
          createdAt: -1,
        };
      }

      break;
  }

  const skip = (safePage - 1) * safeLimit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
    hasNextPage: safePage < Math.ceil(total / safeLimit),
    hasPreviousPage: safePage > 1,
  };
};

/*
 * Search suggestions
 */
const getSearchSuggestions = async ({ query, limit = 8 }) => {
  if (!query || !query.trim()) {
    return [];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 20);

  const searchTerm = query.trim();

  const escapedSearchTerm = searchTerm.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const regex = new RegExp(escapedSearchTerm, "i");

  const products = await Product.find({
    isActive: true,
    $or: [
      { title: regex },
      { brand: regex },
      { category: regex },
    ],
  })
    .select("_id title brand category")
    .limit(safeLimit)
    .lean();

  return products.map((product) => ({
    id: product._id,
    title: product.title,
    brand: product.brand,
    category: product.category,
  }));
};

module.exports = {
  indexProduct,
  deleteProductFromIndex,
  searchProducts,
  getSearchSuggestions,
};