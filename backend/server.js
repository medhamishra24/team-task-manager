require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const errorHandler = require("./middleware/error");

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectMongo = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Atlas Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("🚀 Task Manager API is running");
});

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});