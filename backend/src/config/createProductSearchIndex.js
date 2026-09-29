const elasticClient = require("./elasticsearch");
const {
  getElasticsearchSynonymRules,
} = require("../utils/searchSynonyms");

const PRODUCT_SEARCH_INDEX = "products_v3";
const PRODUCT_SEARCH_ALIAS = "products_current";

const createProductSearchIndex = async () => {
  const indexExists = await elasticClient.indices.exists({
    index: PRODUCT_SEARCH_INDEX,
  });

  if (indexExists) {
    console.log(
      `Elasticsearch index "${PRODUCT_SEARCH_INDEX}" already exists`
    );

    return PRODUCT_SEARCH_INDEX;
  }

  const synonymRules = getElasticsearchSynonymRules();

  await elasticClient.indices.create({
    index: PRODUCT_SEARCH_INDEX,

    settings: {
      analysis: {
        filter: {
          product_synonyms: {
            type: "synonym_graph",
            synonyms: synonymRules,
          },
        },

        analyzer: {
          product_search_analyzer: {
            type: "custom",
            tokenizer: "standard",
            filter: ["lowercase", "product_synonyms"],
          },
        },

        normalizer: {
          lowercase_normalizer: {
            type: "custom",
            filter: ["lowercase"],
          },
        },
      },
    },

    mappings: {
      properties: {
        title: {
          type: "search_as_you_type",
        },

        description: {
          type: "text",
        },

        brand: {
          type: "keyword",
          fields: {
            text: {
              type: "text",
            },
          },
        },

        category: {
          type: "keyword",
          fields: {
            text: {
              type: "text",
            },
          },
        },

        price: {
          type: "float",
        },

        discountPercentage: {
          type: "float",
        },

        rating: {
          type: "float",
        },

        stock: {
          type: "integer",
        },

        isActive: {
          type: "boolean",
        },

        thumbnail: {
          type: "keyword",
          index: false,
        },

        images: {
          type: "keyword",
          index: false,
        },

        createdAt: {
          type: "date",
        },

        updatedAt: {
          type: "date",
        },

        suggest: {
          type: "completion",
        },
      },
    },
  });

  console.log(
    `Elasticsearch index "${PRODUCT_SEARCH_INDEX}" created successfully`
  );

  return PRODUCT_SEARCH_INDEX;
};

/**
 * Switch the products_current alias to a new index.
 *
 * This is atomic, so users never see a partially rebuilt index.
 */
const switchProductSearchAlias = async () => {
  const aliasExists = await elasticClient.indices.existsAlias({
    name: PRODUCT_SEARCH_ALIAS,
  });

  const actions = [];

  if (aliasExists) {
    const currentIndices = await elasticClient.indices.getAlias({
      name: PRODUCT_SEARCH_ALIAS,
    });

    Object.keys(currentIndices).forEach((indexName) => {
      actions.push({
        remove: {
          index: indexName,
          alias: PRODUCT_SEARCH_ALIAS,
        },
      });
    });
  }

  actions.push({
    add: {
      index: PRODUCT_SEARCH_INDEX,
      alias: PRODUCT_SEARCH_ALIAS,
      is_write_index: true,
    },
  });

  await elasticClient.indices.updateAliases({
    actions,
  });

  console.log(
    `Alias "${PRODUCT_SEARCH_ALIAS}" now points to "${PRODUCT_SEARCH_INDEX}"`
  );
};

module.exports = {
  PRODUCT_SEARCH_INDEX,
  PRODUCT_SEARCH_ALIAS,
  createProductSearchIndex,
  switchProductSearchAlias,
};