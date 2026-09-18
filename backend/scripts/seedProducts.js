require("dotenv").config();

const mongoose = require("mongoose");

const Product = require("../src/models/productModel");

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected for seeding");

    const response = await fetch("https://dummyjson.com/products?limit=0");
    const data = await response.json();

    const products = data.products.map((product) => ({
      title: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      stock: product.stock,
      brand: product.brand || "",
      category: product.category,
      thumbnail: product.thumbnail,
      images: product.images || [],
      isActive: true,
    }));

    await Product.deleteMany();

    await Product.insertMany(products);

    console.log(`${products.length} products inserted successfully`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Product seeding failed:", error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedProducts();