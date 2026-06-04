const express = require("express");
const QRCode = require("qrcode");

module.exports = function(db) {
  const router = express.Router();

  // Generate QR Code
  router.post("/generate", async (req, res) => {
    try {
      const { certificateId, verificationUrl } = req.body;

      if (!certificateId) {
        return res.status(400).json({ error: "Certificate ID required" });
      }

      const url = verificationUrl || 
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify/${certificateId}`;

      const qrCode = await QRCode.toDataURL(url);

      res.json({
        success: true,
        certificateId,
        qrCode,
        verificationUrl: url
      });
    } catch (error) {
      console.error("QR generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get QR Code as image
  router.get("/:certificateId", async (req, res) => {
    try {
      const { certificateId } = req.params;
      const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify/${certificateId}`;

      const qrCode = await QRCode.toDataURL(url);
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
