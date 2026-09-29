require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const {
  createProductSearchIndex,
} = require("./config/createProductSearchIndex");



const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await createProductSearchIndex();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();