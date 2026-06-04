const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const { ethers } = require("ethers");

const HashService = require("../src/utils/HashService");
const CONTRACT_ABI = require("../src/utils/CertificateRegistry.json");

const rootDir = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(rootDir, "backend", ".env") });

const smartContractEnv = dotenv.parse(
  fs.readFileSync(path.join(rootDir, "smart-contract", ".env"))
);

const args = process.argv.slice(2);
const options = {
  execute: args.includes("--execute"),
  dbOnly: args.includes("--db-only"),
  force: args.includes("--force"),
  offset: getArgNumber("--offset") || 0,
  limit: getArgNumber("--limit"),
  source: getArgValue("--source")
};

const IMPORT_ISSUER_NAME = process.env.IMPORT_ISSUER_NAME || "TestCenter";
const IMPORT_ISSUER_EMAIL =
  process.env.IMPORT_ISSUER_EMAIL || "certificates@iigvietnam.local";

function getArgValue(name) {
  const match = args.find((arg) => arg.startsWith(`${name}=`));
  return match ? match.split("=", 2)[1] : null;
}

function getArgNumber(name) {
  const value = getArgValue(name);
  return value ? Number(value) : null;
}

function normalizePrivateKey(value) {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^0x[0-9a-fA-F]{64}$/.test(trimmed)) return trimmed;
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) return `0x${trimmed}`;
  return trimmed;
}

function getPrivateKey() {
  const backendKey = normalizePrivateKey(process.env.PRIVATE_KEY);
  if (/^0x[0-9a-fA-F]{64}$/.test(backendKey)) return backendKey;

  const contractKey = normalizePrivateKey(smartContractEnv.PRIVATE_KEY);
  if (/^0x[0-9a-fA-F]{64}$/.test(contractKey)) return contractKey;

  return backendKey;
}

function parseCsv(content) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  return dataRows.map((values) =>
    headers.reduce((record, header, index) => {
      record[header] = values[index] || "";
      return record;
    }, {})
  );
}

function readCsv(relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  return parseCsv(fs.readFileSync(fullPath, "utf8"));
}

function toUnixSeconds(value) {
  if (!value) return 0;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return Math.floor(date.getTime() / 1000);
  }

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return 0;

  const [, month, day, year] = match;
  return Math.floor(
    new Date(Number(year), Number(month) - 1, Number(day)).getTime() / 1000
  );
}

function addYears(unixSeconds, years) {
  if (!unixSeconds) return 0;
  const date = new Date(unixSeconds * 1000);
  date.setFullYear(date.getFullYear() + years);
  return Math.floor(date.getTime() / 1000);
}

function stableHash(value, length = 10) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, length);
}

function buildToeicCertificate(row, index) {
  const issueDate = toUnixSeconds(row.test_date);
  const expiryDate = toUnixSeconds(row.valid_until) || addYears(issueDate, 2);
  const fallbackKey = stableHash(
    `${row.id_number}|${row.registration_number}|${row.test_date}|${index + 1}`
  ).toUpperCase();
  const sequence = row.row_number || fallbackKey;
  const certificateId = `TOEIC-${row.registration_number}-${sequence}`;
  const ownerEmail = `${row.id_number}@toeic.local`;

  return buildCertificate({
    certificateId,
    ownerName: row.full_name || `TOEIC Candidate ${row.id_number}`,
    ownerEmail,
    skillName: "TOEIC",
    score: row.total_score,
    sectionScores: {
      listening: row.listening_score || "",
      reading: row.reading_score || ""
    },
    issueDate,
    expiryDate,
    source: "toeic",
    original: row
  });
}

function buildToeflCertificate(row, index) {
  const issueDate = toUnixSeconds(row.test_date);
  const expiryDate = addYears(issueDate, 2);
  const email = row.email || `toefl-${index + 1}@toefl.local`;
  const suffix = stableHash(`${email}|${row.test_date}|${index + 1}`).toUpperCase();
  const certificateId = `TOEFL-${suffix}`;

  return buildCertificate({
    certificateId,
    ownerName: row.full_name || email.split("@")[0] || `TOEFL Candidate ${index + 1}`,
    ownerEmail: email,
    skillName: "TOEFL",
    score: row.total_score,
    sectionScores: {
      reading: row.reading_score || "",
      listening: row.listening_score || "",
      writing: row.writing_score || "",
      speaking: row.speaking_score || ""
    },
    issueDate,
    expiryDate,
    source: "toefl",
    original: row
  });
}

function buildCertificate(data) {
  const certificateData = {
    certificateId: data.certificateId,
    ownerName: data.ownerName,
    ownerEmail: data.ownerEmail,
    ownerAddress: null,
    skillName: data.skillName,
    score: data.score || "",
    sectionScores: data.sectionScores || {},
    issuerName: IMPORT_ISSUER_NAME,
    issuerEmail: IMPORT_ISSUER_EMAIL,
    issueDate: data.issueDate,
    expiryDate: data.expiryDate,
    metadata: {
      source: data.source,
      importedAt: new Date().toISOString(),
      original: data.original
    }
  };

  return {
    ...certificateData,
    certificateHash: HashService.generateCertificateHash(certificateData)
  };
}

function loadCertificates() {
  const certificates = [];

  if (!options.source || options.source === "toeic") {
    readCsv("data/toeic.csv").forEach((row, index) => {
      certificates.push(buildToeicCertificate(row, index));
    });
  }

  if (!options.source || options.source === "toefl") {
    readCsv("data/toefl.csv").forEach((row, index) => {
      certificates.push(buildToeflCertificate(row, index));
    });
  }

  const start = options.offset;
  const end = options.limit ? start + options.limit : undefined;
  return certificates.slice(start, end);
}

async function main() {
  const certificates = loadCertificates();
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const rpcUrl = process.env.SEPOLIA_RPC_URL || smartContractEnv.SEPOLIA_RPC_URL;
  const privateKey = getPrivateKey();

  console.log(`Loaded ${certificates.length} certificate(s).`);
  console.log(`Mode: ${options.execute ? "execute" : "dry-run"}`);

  if (!options.execute) {
    console.log("Dry run only. Add --execute to write MongoDB/blockchain.");
    console.log("Sample:", certificates[0]);
    return;
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db("certificate_db");
  const collection = db.collection("certificates");
  await collection.createIndex({ certificateId: 1 }, { unique: true });

  let contract = null;
  let ownerAddress = process.env.DEFAULT_OWNER_ADDRESS;

  if (!ownerAddress && /^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    ownerAddress = new ethers.Wallet(privateKey).address;
  }

  if (!options.dbOnly) {
    if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
      throw new Error("PRIVATE_KEY is missing or invalid. It must be 0x + 64 hex characters.");
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(contractAddress || "")) {
      throw new Error("CONTRACT_ADDRESS is missing or invalid.");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    ownerAddress = ownerAddress || wallet.address;
    contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);

    const issuers = await contract.getAuthorizedIssuers();
    const isAuthorized = issuers.some(
      (issuer) => issuer.toLowerCase() === wallet.address.toLowerCase()
    );
    if (!isAuthorized) {
      throw new Error(`Wallet ${wallet.address} is not an authorized issuer for this contract.`);
    }

    const balance = await provider.getBalance(wallet.address);
    console.log(`Issuer: ${wallet.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(ownerAddress || "")) {
    throw new Error("DEFAULT_OWNER_ADDRESS is invalid and signer address could not be used.");
  }

  const stats = { inserted: 0, skipped: 0, blockchain: 0, failed: 0 };

  for (const certificate of certificates) {
    const existing = await collection.findOne({
      certificateId: certificate.certificateId
    });

    if (existing && !options.force && (options.dbOnly || existing.blockchainTx)) {
      stats.skipped += 1;
      continue;
    }

    const document = {
      ...certificate,
      ownerAddress,
      status: options.dbOnly ? "PENDING" : "PENDING",
      blockchainTx: null,
      blockNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      imported: true
    };

    await collection.updateOne(
      { certificateId: certificate.certificateId },
      { $set: document },
      { upsert: true }
    );
    stats.inserted += 1;

    if (options.dbOnly) {
      continue;
    }

    try {
      const tx = await contract.createCertificate(
        certificate.certificateId,
        ownerAddress,
        certificate.skillName,
        certificate.certificateHash,
        certificate.expiryDate || 0,
        JSON.stringify({
          source: certificate.metadata.source,
          ownerEmail: certificate.ownerEmail,
          original: certificate.metadata.original
        })
      );
      const receipt = await tx.wait();

      await collection.updateOne(
        { certificateId: certificate.certificateId },
        {
          $set: {
            status: "ACTIVE",
            blockchainTx: receipt.hash,
            blockNumber: receipt.blockNumber,
            updatedAt: new Date()
          }
        }
      );

      stats.blockchain += 1;
      console.log(
        `[${stats.blockchain}/${certificates.length}] ${certificate.certificateId} ${receipt.hash}`
      );
    } catch (error) {
      stats.failed += 1;
      await collection.updateOne(
        { certificateId: certificate.certificateId },
        {
          $set: {
            status: "PENDING",
            importError: error.message,
            updatedAt: new Date()
          }
        }
      );
      console.error(`${certificate.certificateId}: ${error.message}`);
    }
  }

  await client.close();
  console.log("Import complete:", stats);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
