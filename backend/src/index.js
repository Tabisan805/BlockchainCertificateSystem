const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
let db;
async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    db = client.db("certificate_db");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

function setupRoutes(database) {
  app.use("/api/auth", require("./routes/auth")(database));
  app.use("/api/certificates", require("./routes/certificates")(database));
  app.use("/api/verify", require("./routes/verify")(database));
  app.use("/api/admin", require("./routes/admin")(database));
  app.use("/api/qr", require("./routes/qr")(database));
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  setupRoutes(db);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
