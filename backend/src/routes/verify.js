const express = require("express");
const BlockchainService = require("../utils/BlockchainService");
const HashService = require("../utils/HashService");

module.exports = function(db) {
  const router = express.Router();
  const certificatesCollection = db.collection("certificates");

  function formatCertificate(dbCert, certificateId) {
    return {
      id: certificateId,
      owner: dbCert.ownerName,
      email: dbCert.ownerEmail,
      skill: dbCert.skillName,
      score: dbCert.score || "",
      sectionScores: dbCert.sectionScores || {},
      issueDate: new Date(dbCert.issueDate * 1000).toISOString(),
      expiryDate: dbCert.expiryDate > 0
        ? new Date(dbCert.expiryDate * 1000).toISOString()
        : "No expiry",
      transactionHash: dbCert.blockchainTx,
      version: dbCert.version
    };
  }

  // Verify certificate by ID
  router.post("/certificate-id", async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const { certificateId } = req.body;

      if (!certificateId) {
        return res.status(400).json({ error: "Certificate ID required" });
      }

      const dbCert = await certificatesCollection.findOne({ certificateId });
      if (!dbCert) {
        return res.status(404).json({
          verified: false,
          status: "NOT_FOUND",
          message: "Certificate not found"
        });
      }

      // Verify with blockchain
      try {
        const verification = await blockchainService.verifyCertificate(
          certificateId,
          dbCert.certificateHash
        );

        res.json({
          verified: verification.isValid,
          status: verification.status,
          certificate: formatCertificate(dbCert, certificateId),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        const message = error.message || "Blockchain verification failed";
        if (message.toLowerCase().includes("does not exist") || message.toLowerCase().includes("not deployed")) {
          return res.json({
            verified: false,
            status: "NOT_DEPLOYED",
            message: "This certificate is recorded in the database but has not been deployed to the blockchain yet.",
            certificate: formatCertificate(dbCert, certificateId)
          });
        }

        console.error("Verification error:", error);
        res.status(500).json({
          verified: false,
          error: message
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({
        verified: false,
        error: error.message
      });
    }
  });

  // Verify certificate by upload
  router.post("/upload", async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const { certificateId, certificateData } = req.body;

      if (!certificateId || !certificateData) {
        return res.status(400).json({ error: "Certificate ID and data required" });
      }

      // Calculate hash of uploaded data
      const uploadedHash = HashService.generateHash(certificateData);

      // Get certificate from DB
      const dbCert = await certificatesCollection.findOne({ certificateId });
      if (!dbCert) {
        return res.status(404).json({
          verified: false,
          status: "NOT_FOUND"
        });
      }

      // Verify with blockchain
      try {
        const verification = await blockchainService.verifyCertificate(
          certificateId,
          uploadedHash
        );

        res.json({
          verified: verification.isValid,
          status: verification.status,
          hashMatch: uploadedHash === dbCert.certificateHash,
          certificate: formatCertificate(dbCert, certificateId),
          message: verification.isValid 
            ? "Certificate is valid and authentic" 
            : `Certificate is ${verification.status.toLowerCase()}`
        });
      } catch (error) {
        const message = error.message || "Blockchain verification failed";
        if (message.toLowerCase().includes("does not exist") || message.toLowerCase().includes("not deployed")) {
          return res.json({
            verified: false,
            status: "NOT_DEPLOYED",
            hashMatch: uploadedHash === dbCert.certificateHash,
            certificate: formatCertificate(dbCert, certificateId),
            message: "This certificate exists in the database, but is not deployed on the blockchain yet."
          });
        }

        console.error("Verification error:", error);
        res.status(500).json({
          verified: false,
          error: message
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({
        verified: false,
        error: error.message
      });
    }
  });

  return router;
};
