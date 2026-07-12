require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MongoMemoryServer } = require("mongodb-memory-server");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const errorHandler = require("./middleware/error");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const primaryMongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
const fallbackMongoUri = "mongodb://127.0.0.1:27017/taskmanager";

let mongoServer;

const startMemoryMongo = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected to in-memory fallback database");
};

const connectMongo = async () => {
  const mongoUri = primaryMongoUri || fallbackMongoUri;
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected to ${mongoUri === fallbackMongoUri ? "local" : "primary"} database`);
  } catch (primaryError) {
    if (mongoUri !== fallbackMongoUri) {
      console.warn("Primary MongoDB connection failed, trying local fallback...");
      console.error("Reason:", primaryError.message);
      try {
        await mongoose.connect(fallbackMongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("MongoDB connected to local fallback database");
      } catch (fallbackError) {
        console.warn("Local MongoDB fallback failed, using in-memory fallback...");
        await startMemoryMongo();
      }
    } else {
      console.warn("Local MongoDB connection failed, using in-memory fallback...");
      await startMemoryMongo();
    }
  }
};

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Task Manager API is running 🚀");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});