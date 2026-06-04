const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

module.exports = function(db) {
  const router = express.Router();
  const certificatesCollection = db.collection("certificates");
  const usersCollection = db.collection("users");

  // Get all certificates (admin)
  router.get("/certificates", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const certs = await certificatesCollection.find({}).toArray();
      res.json({ certificates: certs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all users (admin)
  router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
      res.json({ users });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get statistics
  router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const totalCerts = await certificatesCollection.countDocuments();
      const activeCerts = await certificatesCollection.countDocuments({ status: "ACTIVE" });
      const revokedCerts = await certificatesCollection.countDocuments({ status: "REVOKED" });
      const totalUsers = await usersCollection.countDocuments();

      res.json({
        statistics: {
          totalCertificates: totalCerts,
          activeCertificates: activeCerts,
          revokedCertificates: revokedCerts,
          totalUsers,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
