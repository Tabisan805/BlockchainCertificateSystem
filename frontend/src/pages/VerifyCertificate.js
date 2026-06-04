import React, { useState } from "react";
import Header from "../components/Header";
import { verifyAPI } from "../utils/api";

function formatScoreLabel(label) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function ScoreBreakdown({ scores }) {
  const entries = Object.entries(scores || {}).filter(([, value]) => value !== "");

  if (entries.length === 0) {
    return null;
  }

  return (
    <div style={styles.scoreBreakdown}>
      <strong>Section Scores:</strong>
      <div style={styles.scoreGrid}>
        {entries.map(([label, value]) => (
          <span key={label} style={styles.scoreChip}>
            {formatScoreLabel(label)}: {value}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function VerifyCertificate() {
  const [method, setMethod] = useState("id");
  const [certificateId, setCertificateId] = useState("");
  const [uploadedData, setUploadedData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerifyById = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await verifyAPI.verifyCertificateId(certificateId);
      setResult(response.data);
    } catch (err) {
      if (err.response?.data?.error && err.response.status === 400) {
        setError(err.response.data.error);
      } else if (err.response?.data?.error && err.response.status === 404) {
        setError("Certificate not found");
      }
      setResult(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUpload = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = JSON.parse(uploadedData);
      const response = await verifyAPI.verifyUpload(certificateId, data);
      setResult(response.data);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format");
      } else if (err.response?.data?.error && err.response.status === 400) {
        setError(err.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Header
        title="Verify Certificate"
        subtitle="Confirm certificate authenticity and certificate status"
      />

      <div style={styles.content}>
        <div style={styles.searchCard}>
          <h2>Verify Certificate Authenticity</h2>

          <div style={styles.methodTabs}>
            <button
              onClick={() => setMethod("id")}
              style={{
                ...styles.tab,
                backgroundColor: method === "id" ? "#007bff" : "#ddd",
                color: method === "id" ? "white" : "black"
              }}
            >
              By Certificate ID
            </button>
            <button
              onClick={() => setMethod("upload")}
              style={{
                ...styles.tab,
                backgroundColor: method === "upload" ? "#007bff" : "#ddd",
                color: method === "upload" ? "white" : "black"
              }}
            >
              By Upload
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {method === "id" && (
            <form onSubmit={handleVerifyById} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Certificate ID:</label>
                <input
                  type="text"
                  value={certificateId}
                  onChange={(event) => setCertificateId(event.target.value)}
                  placeholder="e.g., CERT-XXXXXXXX"
                  required
                  style={styles.input}
                />
              </div>
              <button type="submit" disabled={loading} style={styles.verifyButton}>
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          )}

          {method === "upload" && (
            <form onSubmit={handleVerifyUpload} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Certificate ID:</label>
                <input
                  type="text"
                  value={certificateId}
                  onChange={(event) => setCertificateId(event.target.value)}
                  placeholder="e.g., CERT-XXXXXXXX"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Certificate Data (JSON):</label>
                <textarea
                  value={uploadedData}
                  onChange={(event) => setUploadedData(event.target.value)}
                  placeholder="Paste certificate data as JSON"
                  required
                  style={{ ...styles.input, minHeight: "120px" }}
                />
              </div>
              <button type="submit" disabled={loading} style={styles.verifyButton}>
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          )}
        </div>

        {result && (() => {
          const isValid = result.verified === true || result.status === "ACTIVE";
          return (
            <div style={styles.resultCard}>
              <div
                style={{
                  ...styles.resultHeader,
                  backgroundColor: isValid ? "#d4edda" : "#f8d7da",
                  borderBottomColor: isValid ? "#28a745" : "#dc3545"
                }}
              >
                <h3 style={{ margin: 0, color: isValid ? "#155724" : "#721c24" }}>
                  {isValid ? "Certificate Valid" : `Certificate ${result.status || "Invalid"}`}
                </h3>
              </div>
              <div style={styles.resultContent}>
                {result.certificate && (
                  <div>
                    <p><strong>Certificate ID:</strong> {result.certificate.id}</p>
                    <p><strong>Full Name:</strong> {result.certificate.owner}</p>
                    <p><strong>Email:</strong> {result.certificate.email}</p>
                    <p><strong>Skill:</strong> {result.certificate.skill}</p>
                    <p><strong>Score:</strong> {result.certificate.score || "-"}</p>
                    <ScoreBreakdown scores={result.certificate.sectionScores} />
                    <p><strong>Issue Date:</strong> {new Date(result.certificate.issueDate).toLocaleDateString()}</p>
                    <p><strong>Expiry Date:</strong> {result.certificate.expiryDate}</p>
                    <p><strong>Version:</strong> {result.certificate.version}</p>
                    {result.certificate.transactionHash && (
                      <p>
                        <strong>Transaction:</strong>{" "}
                        <code style={styles.code}>
                          {result.certificate.transactionHash.substring(0, 20)}...
                        </code>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif'
  },
  content: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto"
  },
  searchCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  },
  methodTabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem"
  },
  form: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-end",
    flexWrap: "wrap"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    flex: "1",
    minWidth: "250px"
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    marginTop: "5px"
  },
  verifyButton: {
    padding: "10px 30px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500"
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px",
    borderRadius: "4px",
    marginBottom: "20px",
    border: "1px solid #f5c6cb"
  },
  resultCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden"
  },
  resultHeader: {
    padding: "20px",
    borderBottom: "3px solid",
    backgroundColor: "#d4edda"
  },
  resultContent: {
    padding: "20px",
    fontSize: "0.95rem",
    lineHeight: "1.8"
  },
  scoreBreakdown: {
    margin: "8px 0 12px"
  },
  scoreGrid: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "6px"
  },
  scoreChip: {
    backgroundColor: "#eef4ff",
    border: "1px solid #cfe0ff",
    color: "#153b72",
    borderRadius: "4px",
    padding: "4px 8px",
    lineHeight: "1.4"
  },
  code: {
    backgroundColor: "#f0f0f0",
    padding: "2px 6px",
    borderRadius: "3px",
    fontSize: "0.85rem",
    wordBreak: "break-all"
  }
};
