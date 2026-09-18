const searchSynonyms = {
  perfume: ["perfume", "fragrance", "scent", "body spray"],
  fragrance: ["perfume", "fragrance", "scent", "body spray"],

  mobile: ["mobile", "phone", "smartphone"],
  smartphone: ["mobile", "phone", "smartphone"],
  phone: ["mobile", "phone", "smartphone"],

  shoes: ["shoes", "footwear", "sneakers"],
  footwear: ["shoes", "footwear", "sneakers"],

  laptop: ["laptop", "computer", "notebook"],
  computer: ["laptop", "computer", "notebook"],
};

const getSearchTerms = (search) => {
  const normalizedSearch = search.trim().toLowerCase();

  return searchSynonyms[normalizedSearch] || [
    normalizedSearch,
  ];
};

module.exports = {
  getSearchTerms,
};