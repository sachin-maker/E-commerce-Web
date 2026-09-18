const elasticClient = require("../config/elasticsearch");

const indexProduct = async (product) => {
  await elasticClient.index({
    index: "products",
    id: product._id.toString(),
    document: {
      title: product.title,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price,
    },
    refresh: "wait_for",
  });
};

const deleteProductFromIndex = async (productId) => {
  try {
    await elasticClient.delete({
      index: "products",
      id: productId.toString(),
      refresh: "wait_for",
    });
  } catch (error) {
    if (error.meta?.statusCode !== 404) {
      throw error;
    }
  }
};

module.exports = {
  indexProduct,
  deleteProductFromIndex,
};