import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { certificateAPI, qrAPI } from "../utils/api";

export default function CreateCertificate() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerAddress: "",
    skillName: "",
    score: "",
    issuerName: "",
    issuerEmail: "",
    expiryDate: "",
    metadata: ""
  });
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [certificateId, setCertificateId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    loadCertificates();
  }, [navigate]);

  const loadCertificates = async () => {
    try {
      const res = await certificateAPI.getAll();
      setPendingCertificates(
        (res.data.certificates || []).filter((cert) => cert.status === "PENDING")
      );
    } catch (err) {
      console.error("Failed to load certificates", err);
    }
  };

  const resetForm = () => {
    setFormData({
      ownerName: "",
      ownerEmail: "",
      ownerAddress: "",
      skillName: "",
      score: "",
      issuerName: "",
      issuerEmail: "",
      expiryDate: "",
      metadata: ""
    });
    setEditingId(null);
    setIsEditing(false);
    setCertificateId(null);
    setQrCode(null);
    setMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (cert) => {
    setIsEditing(true);
    setEditingId(cert.certificateId);
    setFormData({
      ownerName: cert.ownerName || "",
      ownerEmail: cert.ownerEmail || "",
      ownerAddress: cert.ownerAddress || "",
      skillName: cert.skillName || "",
      score: cert.score || "",
      issuerName: cert.issuerName || "",
      issuerEmail: cert.issuerEmail || "",
      expiryDate:
        cert.expiryDate && cert.expiryDate > 0
          ? new Date(cert.expiryDate * 1000).toISOString().slice(0, 10)
          : "",
      metadata: cert.metadata ? JSON.stringify(cert.metadata, null, 2) : ""
    });
    setError("");
    setSuccess(false);
    setMessage(`Editing pending certificate ${cert.certificateId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setMessage("");

    try {
      const expiryDate = formData.expiryDate
        ? Math.floor(new Date(formData.expiryDate).getTime() / 1000)
        : 0;

      const body = {
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerAddress: formData.ownerAddress,
        skillName: formData.skillName,
        score: formData.score,
        issuerName: formData.issuerName,
        issuerEmail: formData.issuerEmail,
        expiryDate,
        metadata: JSON.parse(formData.metadata || "{}")
      };

      if (isEditing && editingId) {
        await certificateAPI.update(editingId, body);
        setCertificateId(editingId);
        setMessage("Certificate updated successfully.");
      } else {
        const response = await certificateAPI.create(body);
        setCertificateId(response.data.certificateId);
        setMessage("Certificate submitted successfully and is pending deployment.");

        const qrRes = await qrAPI.generate(response.data.certificateId);
        setQrCode(qrRes.data.qrCode);
      }

      setSuccess(true);
      resetForm();
      await loadCertificates();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Header
        title={isEditing ? "Edit Pending Certificate" : "Create Certificate"}
        subtitle="Submit certificate requests and edit pending items"
      />

      <div style={styles.container}>
        <h2>{isEditing ? "Edit Pending Certificate" : "Create Certificate"}</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && (
          <div style={styles.success}>
            <p>✓ {message}</p>
            {certificateId && <p>Certificate ID: {certificateId}</p>}
            {qrCode && (
              <div style={{ marginTop: "20px" }}>
                <p>QR Code:</p>
                <img src={qrCode} alt="QR Code" style={{ width: "200px" }} />
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label>Full Name:</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Owner Email:</label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Owner Address (optional):</label>
              <input
                type="text"
                name="ownerAddress"
                value={formData.ownerAddress}
                onChange={handleChange}
                placeholder="0x..."
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Skill Name:</label>
              <input
                type="text"
                name="skillName"
                value={formData.skillName}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Score:</label>
              <input
                type="text"
                name="score"
                value={formData.score}
                onChange={handleChange}
                placeholder="e.g., 95, A+, 850"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Issuer Name:</label>
              <input
                type="text"
                name="issuerName"
                value={formData.issuerName}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Issuer Email:</label>
              <input
                type="email"
                name="issuerEmail"
                value={formData.issuerEmail}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Expiry Date (optional):</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Metadata (JSON):</label>
              <textarea
                name="metadata"
                value={formData.metadata}
                onChange={handleChange}
                placeholder="{}"
                style={{ ...styles.input, minHeight: "100px" }}
              />
            </div>
          </div>
          <div style={styles.buttonGroup}>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? (isEditing ? "Saving..." : "Submitting...") : (isEditing ? "Update Certificate" : "Submit Certificate")}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                style={styles.secondaryButton}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {pendingCertificates.length > 0 && (
          <div style={styles.pendingSection}>
            <h3>Your Pending Certificates</h3>
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Owner</th>
                    <th>Skill</th>
                    <th>Score</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCertificates.map((cert) => (
                    <tr key={cert.certificateId}>
                      <td>{cert.certificateId}</td>
                      <td>{cert.ownerName}</td>
                      <td>{cert.skillName}</td>
                      <td>{cert.score || "-"}</td>
                      <td>{new Date(cert.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleEditClick(cert)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5"
  },
  navbar: {
    backgroundColor: "#003366",
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px"
  },
  navSubtitle: {
    margin: "6px 0 0",
    color: "#d4e3ff",
    fontSize: "0.95rem"
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  },
  userBadge: {
    backgroundColor: "rgba(255,255,255,0.14)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "0.95rem"
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    fontWeight: 600,
    cursor: "pointer"
  },
  container: {
    maxWidth: "1100px",
    margin: "24px auto",
    padding: "20px"
  },
  form: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "15px",
    marginBottom: "20px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column"
  },
  input: {
    padding: "10px",
    marginTop: "5px",
    border: "1px solid #ddd",
    borderRadius: "4px"
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  button: {
    padding: "12px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px"
  },
  secondaryButton: {
    padding: "12px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px"
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "15px"
  },
  success: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "4px",
    marginBottom: "15px"
  },
  pendingSection: {
    marginTop: "30px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  tableScroll: {
    overflowX: "auto",
    marginTop: "15px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  editButton: {
    padding: "8px 16px",
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }
};
