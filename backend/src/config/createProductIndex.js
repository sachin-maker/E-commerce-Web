const elasticClient = require("./elasticsearch");

const createProductIndex = async () => {
  const indexExists = await elasticClient.indices.exists({
    index: "products",
  });

  if (!indexExists) {
    await elasticClient.indices.create({
      index: "products",
      mappings: {
        properties: {
          title: {
            type: "text",
          },
          description: {
            type: "text",
          },
          category: {
            type: "keyword",
          },
          brand: {
            type: "keyword",
          },
          price: {
            type: "float",
          },
        },
      },
    });

    console.log("Products index created");
  }
};

module.exports = createProductIndex;