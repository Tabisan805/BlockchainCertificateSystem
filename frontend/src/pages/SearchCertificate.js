import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { certificateAPI } from "../utils/api";

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

export default function SearchCertificate() {
  const [searchMethod, setSearchMethod] = useState("id");
  const [certificateId, setCertificateId] = useState("");
  const [skillName, setSkillName] = useState("");
  const [owner, setOwner] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    setSearched(true);

    try {
      let searchParams = {};

      if (searchMethod === "id" && certificateId) {
        searchParams.certificateId = certificateId;
      } else if (searchMethod === "skill" && skillName) {
        searchParams.skillName = skillName;
      } else if (searchMethod === "owner" && owner) {
        searchParams.owner = owner;
      } else {
        setError("Please enter a search term");
        setLoading(false);
        return;
      }

      const response = await certificateAPI.search(searchParams);
      setResults(response.data.results || []);

      if (response.data.results.length === 0) {
        setError("No certificates found");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <Header
        title="Search Certificates"
        subtitle="Find verified certificates on blockchain"
      />

      <div style={styles.content}>
        <div style={styles.searchCard}>
          <h2>Search Blockchain Certificates</h2>

          <div style={styles.methodTabs}>
            <button
              onClick={() => setSearchMethod("id")}
              style={{
                ...styles.tab,
                backgroundColor: searchMethod === "id" ? "#007bff" : "#ddd",
                color: searchMethod === "id" ? "white" : "black"
              }}
            >
              By Certificate ID
            </button>
            <button
              onClick={() => setSearchMethod("skill")}
              style={{
                ...styles.tab,
                backgroundColor: searchMethod === "skill" ? "#007bff" : "#ddd",
                color: searchMethod === "skill" ? "white" : "black"
              }}
            >
              By Skill
            </button>
            <button
              onClick={() => {
                setSearchMethod("owner");
              }}
              style={{
                ...styles.tab,
                backgroundColor: searchMethod === "owner" ? "#007bff" : "#ddd",
                color: searchMethod === "owner" ? "white" : "black"
              }}
            >
              By Name / Email
            </button>
          </div>

          <form onSubmit={handleSearch} style={styles.form}>
            {searchMethod === "id" && (
              <div style={styles.formGroup}>
                <label>Certificate ID:</label>
                <input
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="e.g., CERT-XXXXXXXX"
                  style={styles.input}
                />
              </div>
            )}

            {searchMethod === "skill" && (
              <div style={styles.formGroup}>
                <label>Skill Name:</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g., TOEFL, TOEIC"
                  style={styles.input}
                />
              </div>
            )}

            {searchMethod === "owner" && (
              <div style={styles.formGroup}>
                <label>Owner Name or Email:</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Enter full name or email"
                  style={styles.input}
                />
              </div>
            )}

            <button type="submit" disabled={loading} style={styles.searchButton}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {error && searched && (
          <div style={styles.error}>{error}</div>
        )}

        {results.length > 0 && (
          <div style={styles.resultsCard}>
            <h3>Search Results ({results.length})</h3>
            <div style={styles.resultsGrid}>
              {results.map((cert) => (
                <div key={cert.certificateId} style={styles.resultCard}>
                  <div style={styles.resultHeader}>
                    <h4>{cert.certificateId}</h4>
                    <span style={styles.statusBadge}>{cert.status}</span>
                  </div>
                  <div style={styles.resultContent}>
                    <p><strong>Full Name:</strong> {cert.ownerName}</p>
                    <p><strong>Email:</strong> {cert.ownerEmail}</p>
                    <p><strong>Skill:</strong> {cert.skillName}</p>
                    <p><strong>Score:</strong> {cert.score || "-"}</p>
                    <ScoreBreakdown scores={cert.sectionScores} />
                    <p><strong>Issuer:</strong> {cert.issuerName}</p>
                    <p><strong>Issue Date:</strong> {new Date(cert.issueDate * 1000 || cert.createdAt).toLocaleDateString()}</p>
                    {cert.expiryDate > 0 && (
                      <p><strong>Expiry Date:</strong> {new Date(cert.expiryDate * 1000).toLocaleDateString()}</p>
                    )}
                    <p><strong>Blockchain TX:</strong> <code style={styles.code}>{cert.blockchainTx || "N/A"}</code></p>
                    <p><strong>Hash:</strong> <code style={styles.code}>{cert.certificateHash.substring(0, 32)}...</code></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searched && results.length === 0 && !error && (
          <div style={styles.noResults}>
            <p>No certificates found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5"
  },
  navbar: {
    backgroundColor: "#003366",
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  },
  navSubtitle: {
    margin: "6px 0 0",
    color: "#d4e3ff",
    fontSize: "0.95rem"
  },
  userBadge: {
    backgroundColor: "rgba(255,255,255,0.14)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "0.9rem"
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: 600
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  content: {
    padding: "20px",
    maxWidth: "1200px",
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
  searchButton: {
    padding: "10px 30px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem"
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px",
    borderRadius: "4px",
    marginBottom: "20px",
    border: "1px solid #f5c6cb"
  },
  resultsCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  resultCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f9f9f9"
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "2px solid #007bff"
  },
  resultContent: {
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
  statusBadge: {
    padding: "4px 12px",
    backgroundColor: "#28a745",
    color: "white",
    borderRadius: "4px",
    fontSize: "0.9rem"
  },
  code: {
    backgroundColor: "#f0f0f0",
    padding: "2px 6px",
    borderRadius: "3px",
    fontSize: "0.85rem",
    wordBreak: "break-all"
  },
  noResults: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    textAlign: "center",
    color: "#666"
  }
};
