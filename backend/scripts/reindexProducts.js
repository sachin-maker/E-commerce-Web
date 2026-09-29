require("dotenv").config();

const elasticClient = require("../src/config/elasticsearch");
const connectDB = require("../src/config/db");
const Product = require("../src/models/productModel");

const {
  PRODUCT_SEARCH_INDEX,
  createProductSearchIndex,
  switchProductSearchAlias,
} = require("../src/config/createProductSearchIndex");

const reindexProducts = async () => {
  try {
    console.log("Starting product reindex...");
    console.log(`Target index: ${PRODUCT_SEARCH_INDEX}`);

    await connectDB();

    const products = await Product.find({
      isActive: true,
    }).lean();

    console.log(`Found ${products.length} active products`);

    await createProductSearchIndex();

    console.log("Sending products to Elasticsearch...");

    const operations = [];

    for (const product of products) {
      operations.push({
        index: {
          _index: PRODUCT_SEARCH_INDEX,
          _id: product._id.toString(),
        },
      });

      operations.push({
        title: product.title,
        description: product.description,
        brand: product.brand || null,
        category: product.category,

        price: product.price,
        discountPercentage: product.discountPercentage || 0,
        rating: product.rating || 0,
        stock: product.stock || 0,

        isActive: product.isActive,

        thumbnail: product.thumbnail || null,
        images: product.images || [],

        createdAt: product.createdAt,
        updatedAt: product.updatedAt,

        suggest: {
          input: [
            product.title,
            product.brand,
            product.category,
          ].filter(Boolean),
        },
      });
    }

    if (operations.length > 0) {
      const bulkResponse = await elasticClient.bulk({
        refresh: true,
        operations,
      });

      if (bulkResponse.errors) {
        const failedItems = bulkResponse.items.filter(
          (item) => item.index?.error
        );

        console.error(
          `Failed to index ${failedItems.length} products`
        );

        console.error(
          JSON.stringify(failedItems.slice(0, 5), null, 2)
        );

        throw new Error("Some products failed to index");
      }
    }

    console.log(
      `Successfully indexed ${products.length} products into ${PRODUCT_SEARCH_INDEX}`
    );

    await switchProductSearchAlias();

    console.log("Product search alias switched successfully");
    console.log("Reindex process completed");
  } catch (error) {
    console.error("Reindex process failed:", error);
    process.exitCode = 1;
  } finally {
    await elasticClient.close();
    process.exit();
  }
};

reindexProducts();