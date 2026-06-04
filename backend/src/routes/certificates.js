const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const BlockchainService = require("../utils/BlockchainService");
const HashService = require("../utils/HashService");

module.exports = function(db) {
  const router = express.Router();
  const certificatesCollection = db.collection("certificates");

  // Create Certificate (any authenticated user can submit a pending certificate)
  router.post("/create", authMiddleware, async (req, res) => {
    try {
      const {
        ownerName,
        ownerEmail: bodyOwnerEmail,
        ownerAddress,
        skillName,
        score,
        issuerName,
        issuerEmail,
        expiryDate,
        metadata
      } = req.body;

      const ownerEmail = req.user.role === "admin" ? bodyOwnerEmail : req.user.email;

      if (!ownerName || !ownerEmail || !skillName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const certificateId = `CERT-${uuidv4().substring(0, 8).toUpperCase()}`;

      const certificateData = {
        certificateId,
        ownerName,
        ownerEmail,
        ownerAddress: ownerAddress || "0x0000000000000000000000000000000000000000",
        skillName,
        score: score || "",
        issuerName,
        issuerEmail,
        issueDate: Math.floor(Date.now() / 1000),
        expiryDate: expiryDate || 0,
        createdBy: req.user.userId,
        metadata
      };

      // Generate hash
      const certificateHash = HashService.generateCertificateHash(certificateData);

      // Save to MongoDB with PENDING status (NOT deployed to blockchain yet)
      await certificatesCollection.insertOne({
        ...certificateData,
        certificateHash,
        status: "PENDING",
        blockchainTx: null,
        blockNumber: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      });

      res.status(201).json({
        success: true,
        certificateId,
        message: "Certificate submitted successfully. It is pending deployment to the blockchain.",
        status: "PENDING"
      });
    } catch (error) {
      console.error("Error creating certificate:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all certificates
  router.get("/", authMiddleware, async (req, res) => {
    try {
      const certs = await certificatesCollection
        .find({ ownerEmail: req.user.email })
        .toArray();
      res.json({ certificates: certs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get certificate by ID
  router.get("/:certificateId", async (req, res) => {
    try {
      const cert = await certificatesCollection.findOne({
        certificateId: req.params.certificateId
      });

      if (!cert) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      res.json({ certificate: cert });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update certificate (owners can edit pending certificates; admin can also update active certificates)
  router.put("/:certificateId", authMiddleware, async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const { certificateId } = req.params;
      const {
        ownerName,
        ownerAddress,
        skillName,
        score,
        issuerName,
        issuerEmail,
        expiryDate,
        metadata
      } = req.body;

      const cert = await certificatesCollection.findOne({ certificateId });
      if (!cert) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      const isAdmin = req.user.role === "admin";
      const isOwner = req.user.email === cert.ownerEmail;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (isOwner && cert.status !== "PENDING") {
        return res.status(400).json({ error: "Only pending certificates can be edited by the owner" });
      }

      if (cert.status === "REVOKED") {
        return res.status(400).json({ error: "Cannot update a revoked certificate" });
      }

      const updatedData = {
        certificateId,
        ownerName: ownerName || cert.ownerName,
        ownerEmail: cert.ownerEmail,
        ownerAddress: ownerAddress || cert.ownerAddress,
        skillName: skillName || cert.skillName,
        score: score || cert.score || "",
        issuerName: issuerName || cert.issuerName,
        issuerEmail: issuerEmail || cert.issuerEmail,
        issueDate: cert.issueDate,
        expiryDate: expiryDate || cert.expiryDate,
        metadata: metadata || cert.metadata
      };

      const newHash = HashService.generateCertificateHash(updatedData);

      if (cert.status === "ACTIVE") {
        if (!isAdmin) {
          return res.status(403).json({ error: "Only admin can update active certificates" });
        }

        await blockchainService.updateCertificate(
          certificateId,
          newHash,
          updatedData
        );
      }

      await certificatesCollection.updateOne(
        { certificateId },
        {
          $set: {
            ...updatedData,
            certificateHash: newHash,
            version: cert.version + 1,
            updatedAt: new Date()
          }
        }
      );

      res.json({ success: true, message: "Certificate updated" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Revoke certificate
  router.post("/:certificateId/revoke", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const { certificateId } = req.params;

      const cert = await certificatesCollection.findOne({ certificateId });
      if (!cert) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      // Update blockchain
      await blockchainService.revokeCertificate(certificateId);

      // Update MongoDB
      await certificatesCollection.updateOne(
        { certificateId },
        { $set: { status: "REVOKED", updatedAt: new Date() } }
      );

      res.json({ success: true, message: "Certificate revoked" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get version history
  router.get("/:certificateId/history", async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const { certificateId } = req.params;
      const history = await blockchainService.getVersionHistory(certificateId);
      res.json({ history });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ADMIN ENDPOINTS =====
  
  // Get pending certificates (for admin confirmation)
  router.get("/admin/pending-list", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const pending = await certificatesCollection
        .find({ status: "PENDING" })
        .toArray();
      res.json({ certificates: pending });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Estimate gas fee for deploying certificate
  router.post("/admin/estimate-gas/:certificateId", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const { certificateId } = req.params;

      const cert = await certificatesCollection.findOne({ certificateId });
      if (!cert) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      if (cert.status !== "PENDING") {
        return res.status(400).json({ error: "Certificate must be in PENDING status" });
      }

      const gasEstimate = await blockchainService.estimateGasFee({
        certificateId,
        owner: cert.ownerAddress,
        skillName: cert.skillName,
        certificateHash: cert.certificateHash,
        expiryDate: cert.expiryDate || 0,
        metadata: cert.metadata
      });

      res.json({ 
        gasEstimate,
        certificateId
      });
    } catch (error) {
      console.error("Error estimating gas:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Confirm and deploy certificate to blockchain
  router.post("/admin/confirm/:certificateId", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const { certificateId } = req.params;

      const cert = await certificatesCollection.findOne({ certificateId });
      if (!cert) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      if (cert.status !== "PENDING") {
        return res.status(400).json({ error: "Certificate must be in PENDING status" });
      }

      // Deploy to blockchain
      const blockchainResult = await blockchainService.createCertificate({
        certificateId: cert.certificateId,
        owner: cert.ownerAddress,
        skillName: cert.skillName,
        certificateHash: cert.certificateHash,
        expiryDate: cert.expiryDate || 0,
        metadata: cert
      });

      // Update MongoDB with blockchain info
      await certificatesCollection.updateOne(
        { certificateId },
        {
          $set: {
            status: "ACTIVE",
            blockchainTx: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            updatedAt: new Date()
          }
        }
      );

      res.json({ 
        success: true, 
        message: "Certificate deployed to blockchain",
        certificateId,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber
      });
    } catch (error) {
      console.error("Error confirming certificate:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get active issuer status and authorized list
  router.get("/admin/issuer-status", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const signerAddress = await blockchainService.signer.getAddress();
      const issuers = await blockchainService.getAuthorizedIssuers();
      const authorized = issuers.some(
        (issuer) => issuer.toLowerCase() === signerAddress.toLowerCase()
      );

      res.json({
        signerAddress,
        authorized,
        issuers
      });
    } catch (error) {
      console.error("Error checking issuer status:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Authorize a new issuer address
  router.post("/admin/authorize-issuer", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const { issuerAddress } = req.body;

      if (!issuerAddress || !/^0x[0-9a-fA-F]{40}$/.test(issuerAddress)) {
        return res.status(400).json({ error: "Invalid issuer address" });
      }

      const result = await blockchainService.authorizeIssuer(issuerAddress);
      res.json({ success: true, result });
    } catch (error) {
      console.error("Error authorizing issuer:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ===== USER/VERIFIER ENDPOINTS =====

  // Get active certificates for user
  router.get("/user/active", authMiddleware, async (req, res) => {
    try {
      const active = await certificatesCollection
        .find({ 
          ownerEmail: req.user.email,
          status: "ACTIVE"
        })
        .toArray();
      res.json({ certificates: active });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search certificates on blockchain
  router.post("/search", async (req, res) => {
    try {
      const blockchainService = new BlockchainService();
      const { certificateId, skillName, owner } = req.body;

      if (!certificateId && !skillName && !owner) {
        return res.status(400).json({ error: "At least one search parameter required" });
      }

      let query = {};
      if (certificateId) query.certificateId = certificateId;
      if (skillName) query.skillName = { $regex: skillName, $options: "i" };
      if (owner) {
        query.$or = [
          { ownerName: { $regex: owner, $options: "i" } },
          { ownerEmail: { $regex: owner, $options: "i" } }
        ];
      }

      const results = await certificatesCollection
        .find(query)
        .toArray();

      res.json({ results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
