const elasticClient = require("../config/elasticsearch");

const PRODUCT_SEARCH_INDEX = "products_current";

/**
 * Index a product in Elasticsearch
 */
const indexProduct = async (product) => {
  await elasticClient.index({
    index: PRODUCT_SEARCH_INDEX,
    id: product._id.toString(),

    document: {
      title: product.title,
      description: product.description,
      brand: product.brand || null,
      category: product.category,
      thumbnail: product.thumbnail,
      images: product.images || [],

      price: product.price,
      discountPercentage: product.discountPercentage || 0,
      rating: product.rating || 0,
      stock: product.stock || 0,

      isActive: product.isActive,

      createdAt: product.createdAt,
      updatedAt: product.updatedAt,

      suggest: {
        input: [
          product.title,
          product.brand,
          product.category,
        ].filter(Boolean),
      },
    },

    refresh: "wait_for",
  });
};

/**
 * Delete a product from Elasticsearch
 */
const deleteProductFromIndex = async (productId) => {
  try {
    await elasticClient.delete({
      index: PRODUCT_SEARCH_INDEX,
      id: productId.toString(),
      refresh: "wait_for",
    });
  } catch (error) {
    if (error.meta?.statusCode !== 404) {
      throw error;
    }
  }
};

/**
 * Build Elasticsearch filters
 */
const buildFilters = ({
  category,
  minPrice,
  maxPrice,
  minRating,
  inStock,
}) => {
  const filters = [
    {
      term: {
        isActive: true,
      },
    },
  ];

  if (typeof category === "string" && category.trim()) {
    filters.push({
      term: {
        category: category.trim().toLowerCase(),
      },
    });
  }

  const parsedMinPrice = Number(minPrice);
  const parsedMaxPrice = Number(maxPrice);
  const parsedMinRating = Number(minRating);

  if (
    minPrice !== undefined &&
    minPrice !== "" &&
    Number.isFinite(parsedMinPrice) &&
    parsedMinPrice >= 0
  ) {
    filters.push({
      range: {
        price: {
          gte: parsedMinPrice,
        },
      },
    });
  }

  if (
    maxPrice !== undefined &&
    maxPrice !== "" &&
    Number.isFinite(parsedMaxPrice) &&
    parsedMaxPrice >= 0
  ) {
    filters.push({
      range: {
        price: {
          lte: parsedMaxPrice,
        },
      },
    });
  }

  if (
    minRating !== undefined &&
    minRating !== "" &&
    Number.isFinite(parsedMinRating) &&
    parsedMinRating >= 0 &&
    parsedMinRating <= 5
  ) {
    filters.push({
      range: {
        rating: {
          gte: parsedMinRating,
        },
      },
    });
  }

  if (inStock === true) {
    filters.push({
      range: {
        stock: {
          gt: 0,
        },
      },
    });
  }

  return filters;
};



/**
 * Search products using Elasticsearch
 */
const searchProducts = async ({

  query = "",
  category,
  minPrice,
  maxPrice,
  minRating,
  inStock,
  page = 1,
  limit = 20,
  sort = "relevance",
}) => {
  console.log("SEARCH SERVICE VERSION: FUZZY-V2");
  const normalizedQuery = query.trim().toLowerCase();

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const from = (safePage - 1) * safeLimit;

  const filters = buildFilters({
    category,
    minPrice,
    maxPrice,
    minRating,
    inStock,
  });

  let searchQuery;

  /*
   * ============================================================
   * NO SEARCH QUERY
   * ============================================================
   */

  if (!normalizedQuery) {
    searchQuery = {
      bool: {
        filter: filters,
      },
    };
  }

  /*
   * ============================================================
   * NORMAL SEARCH
   * ============================================================
   */

  else {
    searchQuery = {
      bool: {
        filter: filters,

        should: [
          // Exact phrase in title
          {
            match_phrase: {
              title: {
                query: normalizedQuery,
                boost: 15,
              },
            },
          },

          // Normal title match + synonyms
          {
            match: {
              title: {
                query: normalizedQuery,
                analyzer: "product_search_analyzer",
                boost: 8,
              },
            },
          },

          // Search-as-you-type
          {
            multi_match: {
              query: normalizedQuery,
              type: "bool_prefix",
              analyzer: "product_search_analyzer",
              fields: [
                "title",
                "title._2gram",
                "title._3gram",
              ],
              boost: 5,
            },
          },

          // Brand
          {
            match: {
              "brand.text": {
                query: normalizedQuery,
                analyzer: "product_search_analyzer",
                boost: 3,
              },
            },
          },

          // Category
          {
            match: {
              "category.text": {
                query: normalizedQuery,
                analyzer: "product_search_analyzer",
                boost: 1,
              },
            },
          },

          // Description
          {
            match: {
              description: {
                query: normalizedQuery,
                analyzer: "product_search_analyzer",
                boost: 0.5,
              },
            },
          },
        ],

        minimum_should_match: 1,
      },
    };
  }

  /*
   * ============================================================
   * SORT
   * ============================================================
   */

  let sortConfig;

  switch (sort) {
    case "price_asc":
      sortConfig = [{ price: "asc" }];
      break;

    case "price_desc":
      sortConfig = [{ price: "desc" }];
      break;

    case "rating":
      sortConfig = [{ rating: "desc" }];
      break;

    case "newest":
      sortConfig = [{ createdAt: "desc" }];
      break;

    default:
      sortConfig = normalizedQuery
        ? ["_score"]
        : [{ createdAt: "desc" }];
  }

  /*
   * ============================================================
   * NORMAL SEARCH
   * ============================================================
   */

  let response = await elasticClient.search({
    index: PRODUCT_SEARCH_INDEX,
    from,
    size: safeLimit,
    query: searchQuery,
    sort: sortConfig,
  });

  /*
   * ============================================================
   * FUZZY FALLBACK
   *
   * Only execute this when the normal search returns ZERO
   * results.
   * ============================================================
   */

if (
  normalizedQuery &&
  response.hits.total.value === 0
) {
  console.log(
    `No normal results for "${normalizedQuery}". Trying fuzzy search...`
  );

  response = await elasticClient.search({

    
    index: PRODUCT_SEARCH_INDEX,
    from,
    size: safeLimit,

    query: {
      bool: {
        filter: filters,

        should: [
          {
            match: {
              title: {
                query: normalizedQuery,
                fuzziness: 2,
                prefix_length: 0,
                max_expansions: 100,
              },
            },
          },

          {
            match: {
              "brand.text": {
                query: normalizedQuery,
                fuzziness: 2,
                prefix_length: 0,
                max_expansions: 100,
              },
            },
          },

          {
            match: {
              description: {
                query: normalizedQuery,
                fuzziness: 2,
                prefix_length: 0,
                max_expansions: 100,
              },
            },
          },
        ],

        minimum_should_match: 1,
      },
    },

    sort: ["_score"],
  });

  console.log(
    `Fuzzy search "${normalizedQuery}" returned:`,
    response.hits.total
  );
}

  /*
   * ============================================================
   * FORMAT RESULTS
   * ============================================================
   */

  const products = response.hits.hits.map((hit) => ({
    ...hit._source,
    _id: hit._id,
    score: hit._score,
  }));

  const total =
    typeof response.hits.total === "number"
      ? response.hits.total
      : response.hits.total.value;

  const totalPages =
    total === 0
      ? 0
      : Math.ceil(total / safeLimit);

  return {
    products,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
    },
  };
};

/**
 * Get autocomplete suggestions from Elasticsearch
 */
const getSearchSuggestions = async ({ query, limit = 8 }) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 8, 1),
    10
  );

  const response = await elasticClient.search({
    index: PRODUCT_SEARCH_INDEX,
    size: safeLimit,

    query: {
      bool: {
        filter: [
          {
            term: {
              isActive: true,
            },
          },
        ],

        must: [
          {
            multi_match: {
              query: normalizedQuery,
              type: "bool_prefix",
              fields: [
                "title",
                "title._2gram",
                "title._3gram",
              ],
            },
          },
        ],
      },
    },

    _source: [
      "title",
      "brand",
      "category",
    ],
  });

  return response.hits.hits.map((hit) => ({
    id: hit._id,
    title: hit._source.title,
    brand: hit._source.brand,
    category: hit._source.category,
  }));
};



module.exports = {
  PRODUCT_SEARCH_INDEX,
  indexProduct,
  deleteProductFromIndex,
  searchProducts,
  getSearchSuggestions,
};