const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const JWTService = require("../utils/JWTService");

module.exports = function(db) {
  const router = express.Router();
  const usersCollection = db.collection("users");

  // Register
  router.post("/register", async (req, res) => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await usersCollection.insertOne({
        email,
        password: hashedPassword,
        name,
        role: role || "user",
        createdAt: new Date(),
        active: true
      });

      const token = JWTService.generateToken({
        _id: result.insertedId,
        email,
        role: role || "user"
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: result.insertedId,
          email,
          name,
          role: role || "user"
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = JWTService.generateToken({
        _id: user._id,
        email: user.email,
        role: user.role
      });

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user
  router.get("/me", (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token" });
      }

      const decoded = JWTService.verifyToken(token);
      res.json({ user: decoded });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  return router;
};
