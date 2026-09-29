const searchSynonyms = {
  perfume: [
    "perfume",
    "fragrance",
    "fragrances",
    "scent",
    "body spray",
    "cologne",
  ],

  fragrance: [
    "perfume",
    "fragrance",
    "fragrances",
    "scent",
    "body spray",
    "cologne",
  ],

  fragrances: [
    "perfume",
    "fragrance",
    "fragrances",
    "scent",
    "body spray",
    "cologne",
  ],

  scent: [
    "perfume",
    "fragrance",
    "fragrances",
    "scent",
    "body spray",
    "cologne",
  ],

  cologne: [
    "perfume",
    "fragrance",
    "fragrances",
    "scent",
    "body spray",
    "cologne",
  ],

  phone: [
    "phone",
    "smartphone",
    "mobile phone",
  ],

  smartphone: [
    "phone",
    "smartphone",
    "mobile phone",
  ],

  "mobile phone": [
    "phone",
    "smartphone",
    "mobile phone",
  ],

  shoes: [
    "shoes",
    "shoe",
    "footwear",
    "sneakers",
  ],

  shoe: [
    "shoes",
    "shoe",
    "footwear",
    "sneakers",
  ],

  footwear: [
    "shoes",
    "shoe",
    "footwear",
    "sneakers",
  ],

  sneakers: [
    "shoes",
    "shoe",
    "footwear",
    "sneakers",
  ],

  laptop: [
    "laptop",
    "computer",
    "notebook",
  ],

  computer: [
    "laptop",
    "computer",
    "notebook",
  ],

  notebook: [
    "laptop",
    "computer",
    "notebook",
  ],
};

/**
 * Get search terms including synonyms.
 *
 * Example:
 *
 * getSearchTerms("perfume")
 *
 * =>
 * [
 *   "perfume",
 *   "fragrance",
 *   "fragrances",
 *   "scent",
 *   "body spray",
 *   "cologne"
 * ]
 */
const getSearchTerms = (search) => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return [];
  }

  const terms = new Set([normalizedSearch]);

  // Exact synonym match
  if (searchSynonyms[normalizedSearch]) {
    searchSynonyms[normalizedSearch].forEach((term) => {
      terms.add(term);
    });
  }

  // Also support multi-word searches such as:
  // "mobile phone"
  // "gaming laptop"
  // "running shoes"
  normalizedSearch.split(/\s+/).forEach((word) => {
    if (searchSynonyms[word]) {
      searchSynonyms[word].forEach((term) => {
        terms.add(term);
      });
    }
  });

  return [...terms];
};

/**
 * Convert synonym groups into Elasticsearch synonym rules.
 *
 * Example:
 *
 * perfume, fragrance, fragrances, scent, body spray, cologne
 */
const getElasticsearchSynonymRules = () => {
  const uniqueGroups = new Set();

  Object.values(searchSynonyms).forEach((terms) => {
    const normalizedTerms = terms
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean);

    if (normalizedTerms.length > 1) {
      uniqueGroups.add(normalizedTerms.join(", "));
    }
  });

  return [...uniqueGroups];
};

module.exports = {
  searchSynonyms,
  getSearchTerms,
  getElasticsearchSynonymRules,
};