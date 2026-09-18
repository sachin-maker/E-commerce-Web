require("dotenv").config();
const mongoose = require("mongoose");
// const Product = require("../src/models/ProductModel");
const Product = require("../models/productModel");

const elasticClient = require("../src/config/elasticsearch");

const indexExistingProducts = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find().lean();

  const operations = [];

  for (const product of products) {
    operations.push({
      index: {
        _index: "products",
        _id: product._id.toString(),
      },
    });

    operations.push({
      title: product.title,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price,
    });
  }

  if (operations.length > 0) {
    await elasticClient.bulk({
      refresh: true,
      operations,
    });
  }

  console.log(`${products.length} products indexed`);

  await mongoose.disconnect();
};

indexExistingProducts().catch((error) => {
  console.error(error);
  process.exit(1);
});