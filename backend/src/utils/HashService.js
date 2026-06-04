const crypto = require("crypto");

class HashService {
  /**
   * Generate SHA-256 hash for certificate data
   */
  static generateHash(data) {
    if (typeof data === "object") {
      data = JSON.stringify(data);
    }
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Verify hash matches
   */
  static verifyHash(data, hash) {
    const computedHash = this.generateHash(data);
    return computedHash === hash;
  }

  /**
   * Generate certificate hash from certificate object
   */
  static generateCertificateHash(certificateData) {
    const dataToHash = {
      certificateId: certificateData.certificateId,
      ownerName: certificateData.ownerName,
      ownerEmail: certificateData.ownerEmail,
      skillName: certificateData.skillName,
      score: certificateData.score || "",
      issueDate: certificateData.issueDate,
      expiryDate: certificateData.expiryDate,
      issuerName: certificateData.issuerName,
      issuerEmail: certificateData.issuerEmail
    };

    return this.generateHash(dataToHash);
  }
}

module.exports = HashService;
