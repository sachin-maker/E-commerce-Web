const elasticClient = require("../config/elasticsearch");

const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const result = await elasticClient.search({
      index: "products",
      query: {
        multi_match: {
          query: q,
          fields: [
            "title^4",
            "brand^3",
            "category^2",
            "description",
          ],
          fuzziness: "AUTO",
        },
      },
    });

    const products = result.hits.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
    }));

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Elasticsearch search error:", error);

    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};

module.exports = {
  searchProducts,
};