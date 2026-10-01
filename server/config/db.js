const mongoose = require("mongoose");

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

async function closeDB() {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error closing MongoDB connection:", error.message);
  }
}

async function checkHealth() {
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  connectDB,
  closeDB,
  checkHealth,
};
