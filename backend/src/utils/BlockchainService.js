const { ethers } = require("ethers");
const CONTRACT_ABI = require("./CertificateRegistry.json");

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
    );

    const privateKey = this.normalizePrivateKey(process.env.PRIVATE_KEY || "");
    
    this.signer = new ethers.Wallet(
      privateKey,
      this.provider
    );
    
    this.contractAddress = process.env.CONTRACT_ADDRESS || "";
    this.contract = new ethers.Contract(
      this.contractAddress,
      CONTRACT_ABI,
      this.signer
    );
  }

  async createCertificate(certificateData) {
    try {
      await this.ensureAuthorizedIssuer();

      const tx = await this.contract.createCertificate(
        certificateData.certificateId,
        certificateData.owner,
        certificateData.skillName,
        certificateData.certificateHash,
        certificateData.expiryDate || 0,
        JSON.stringify(certificateData.metadata || {})
      );

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        status: "confirmed"
      };
    } catch (error) {
      console.error("Error creating certificate:", error);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  async updateCertificate(certificateId, newHash, metadata) {
    try {
      await this.ensureAuthorizedIssuer();

      const tx = await this.contract.updateCertificate(
        certificateId,
        newHash,
        JSON.stringify(metadata || {})
      );

      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error("Error updating certificate:", error);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  async revokeCertificate(certificateId) {
    try {
      await this.ensureAuthorizedIssuer();

      const tx = await this.contract.revokeCertificate(certificateId);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error("Error revoking certificate:", error);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  async getCertificate(certificateId) {
    try {
      const cert = await this.contract.getCertificate(certificateId);
      return {
        certificateId: cert.certificateId,
        issuer: cert.issuer,
        owner: cert.owner,
        certificateHash: cert.certificateHash,
        issueDate: cert.issueDate.toString(),
        expiryDate: cert.expiryDate.toString(),
        skillName: cert.skillName,
        status: this.getStatusName(cert.status),
        metadata: cert.metadata,
        version: cert.version.toString()
      };
    } catch (error) {
      console.error("Error getting certificate:", error);
      throw new Error(`Certificate not found or blockchain error: ${error.message}`);
    }
  }

  async verifyCertificate(certificateId, hash) {
    try {
      const result = await this.contract.verifyCertificate(certificateId, hash);
      return {
        isValid: result[0],
        status: this.getStatusName(result[1]),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error verifying certificate:", error);
      throw new Error(`Verification error: ${error.message}`);
    }
  }

  async getVersionHistory(certificateId) {
    try {
      const history = await this.contract.getVersionHistory(certificateId);
      return history.map(v => ({
        version: v.version.toString(),
        certificateHash: v.certificateHash,
        timestamp: v.timestamp.toString(),
        status: this.getStatusName(v.status),
        updatedBy: v.updatedBy
      }));
    } catch (error) {
      console.error("Error getting version history:", error);
      throw new Error(`Version history error: ${error.message}`);
    }
  }

  async getAuthorizedIssuers() {
    try {
      return await this.contract.getAuthorizedIssuers();
    } catch (error) {
      console.error("Error getting authorized issuers:", error);
      throw new Error(`Authorized issuers error: ${error.message}`);
    }
  }

  async authorizeIssuer(issuerAddress) {
    try {
      await this.ensureAuthorizedIssuer();

      const tx = await this.contract.authorizeIssuer(issuerAddress);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error("Error authorizing issuer:", error);
      throw new Error(`Authorize issuer error: ${error.message}`);
    }
  }

  async estimateGasFee(certificateData) {
    try {
      await this.ensureAuthorizedIssuer();

      // Estimate gas for createCertificate transaction
      const gasEstimate = await this.contract.createCertificate.estimateGas(
        certificateData.certificateId,
        certificateData.owner,
        certificateData.skillName,
        certificateData.certificateHash,
        certificateData.expiryDate || 0,
        JSON.stringify(certificateData.metadata || {})
      );

      // Get current gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
      
      // Calculate estimated fee in ETH and USD (assuming $2000 per ETH)
      const estimatedFeeWei = gasEstimate * gasPrice;
      const estimatedFeeEth = ethers.formatEther(estimatedFeeWei);
      const estimatedFeeUsd = parseFloat(estimatedFeeEth) * 2000;

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        estimatedFeeWei: estimatedFeeWei.toString(),
        estimatedFeeEth: estimatedFeeEth.toString(),
        estimatedFeeUsd: estimatedFeeUsd.toFixed(4)
      };
    } catch (error) {
      console.error("Error estimating gas fee:", error);
      throw new Error(`Gas estimation error: ${error.message}`);
    }
  }

  getStatusName(statusCode) {
    const statuses = ["ACTIVE", "REVOKED", "SUPERSEDED", "PENDING"];
    return statuses[statusCode] || "UNKNOWN";
  }

  normalizePrivateKey(privateKey) {
    const trimmed = privateKey.trim();
    if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
      return `0x${trimmed}`;
    }
    if (/^0x[0-9a-fA-F]{64}$/.test(trimmed)) {
      return trimmed;
    }
    throw new Error("Invalid PRIVATE_KEY. It must be 64 hex characters, with or without 0x.");
  }

  async ensureAuthorizedIssuer() {
    const signerAddress = await this.signer.getAddress();
    const issuers = await this.getAuthorizedIssuers();
    const authorized = issuers.some(
      (issuer) => issuer.toLowerCase() === signerAddress.toLowerCase()
    );

    if (!authorized) {
      throw new Error(
        `Signer ${signerAddress} is not an authorized issuer for contract ${this.contractAddress}`
      );
    }
  }

}

module.exports = BlockchainService;
