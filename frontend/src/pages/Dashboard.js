import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { certificateAPI, adminAPI } from "../utils/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [showGasModal, setShowGasModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [recentCertificates, setRecentCertificates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
      loadData();
    }
  }, [navigate]);

  const loadData = async () => {
    try {
      const userRole = JSON.parse(localStorage.getItem("user")).role;

      if (userRole === "admin") {
        // Admin: get pending certificates
        const certRes = await certificateAPI.getPending();
        setCertificates(certRes.data.certificates || []);
        const statsRes = await adminAPI.getStats();
        setStats(statsRes.data.statistics);
      } else {
        // User/Verifier: get all certificates for the logged in user, including pending ones
        const certRes = await certificateAPI.getAll();
        setCertificates(certRes.data.certificates || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEstimateGas = async (certificateId) => {
    try {
      setActionLoading(certificateId);
      const res = await certificateAPI.estimateGas(certificateId);
      setGasEstimate(res.data.gasEstimate);
      setShowGasModal(certificateId);
    } catch (error) {
      alert("Error estimating gas: " + error.response?.data?.error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDeploy = async (certificateId) => {
    if (!window.confirm("Confirm deploying this certificate to blockchain?")) {
      return;
    }
    try {
      setActionLoading(certificateId);
      await certificateAPI.confirm(certificateId);
      alert("Certificate deployed to blockchain successfully!");
      setShowGasModal(null);
      await loadData();
    } catch (error) {
      alert("Error deploying: " + error.response?.data?.error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const statusCounts = certificates.reduce(
    (acc, cert) => {
      if (cert.status === "PENDING") acc.pending += 1;
      if (cert.status === "ACTIVE") acc.active += 1;
      if (cert.status === "REVOKED") acc.revoked += 1;
      return acc;
    },
    { pending: 0, active: 0, revoked: 0 }
  );

  const filteredCertificates = certificates.filter((cert) => {
    if (statusFilter !== "all" && cert.status !== statusFilter) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    const query = searchTerm.toLowerCase();
    return [
      cert.certificateId,
      cert.ownerName,
      cert.ownerEmail,
      cert.skillName,
      cert.issuerName
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  const isAdmin = user?.role === "admin";

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <Header
        title="Certificate Dashboard"
        subtitle="Real-time certificate insights, search, and quick actions"
      />

      <div style={styles.content}>
        <div style={styles.quickPanel}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>Total</h3>
              <p>{certificates.length}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Pending</h3>
              <p>{statusCounts.pending}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Active</h3>
              <p>{statusCounts.active}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Revoked</h3>
              <p>{statusCounts.revoked}</p>
            </div>
          </div>

          <div style={styles.actionGrid}>
            <Link to="/create-certificate" style={styles.actionCard}>
              <h4>New Request</h4>
              <p>Submit a certificate request for blockchain deployment.</p>
            </Link>
            <Link to="/search" style={styles.actionCard}>
              <h4>Search Certificates</h4>
              <p>Find certificates by ID, skill, or owner.</p>
            </Link>
            <Link to="/verify" style={styles.actionCard}>
              <h4>Verify</h4>
              <p>Validate certificate authenticity quickly.</p>
            </Link>
            {isAdmin && (
              <Link to="/manage-certificates" style={styles.actionCard}>
                <h4>Admin Queue</h4>
                <p>Review pending certificates and deploy them.</p>
              </Link>
            )}
          </div>
        </div>

        <div style={styles.searchBar}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by certificate ID, owner, skill, or issuer"
            style={styles.searchInput}
          />
          <div style={styles.filterButtons}>
            {['all', 'PENDING', 'ACTIVE', 'REVOKED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  ...styles.filterButton,
                  ...(statusFilter === status ? styles.filterActive : {})
                }}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {recentCertificates.length > 0 && (
          <div style={styles.recentSection}>
            <h2>Recent Certificates</h2>
            <div style={styles.recentList}>
              {recentCertificates.map((cert) => (
                <div key={cert.certificateId} style={styles.recentItem}>
                  <div>
                    <strong>{cert.certificateId}</strong>
                    <p>{cert.skillName} · {cert.ownerName} · Score: {cert.score || "-"}</p>
                  </div>
                  <span style={styles.statusBadge(cert.status)}>{cert.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {isAdmin && stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>Total Certificates</h3>
              <p>{stats.totalCertificates}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Active</h3>
              <p>{stats.activeCertificates}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Pending</h3>
              <p>{certificates.length}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Revoked</h3>
              <p>{stats.revokedCertificates}</p>
            </div>
          </div>
        )}

        <h2>{isAdmin ? "Pending Certificates (Awaiting Blockchain Confirmation)" : "Your Certificates"}</h2>
        {certificates.length === 0 ? (
          <p>{isAdmin ? "No pending certificates" : "No certificates yet"}</p>
        ) : (
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Owner</th>
                  <th>Skill</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Issued Date</th>
                  {isAdmin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((cert) => (
                  <tr key={cert.certificateId}>
                    <td>{cert.certificateId}</td>
                    <td>{cert.ownerName}</td>
                    <td>{cert.skillName}</td>
                    <td>{cert.score || "-"}</td>
                    <td><span style={styles.statusBadge(cert.status)}>{cert.status}</span></td>
                    <td>{new Date(cert.issueDate * 1000 || cert.createdAt).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td>
                        <button
                          onClick={() => handleEstimateGas(cert.certificateId)}
                          disabled={actionLoading === cert.certificateId}
                          style={styles.primaryButton}
                        >
                          {actionLoading === cert.certificateId ? "Loading..." : "Check Gas & Deploy"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gas Fee Modal */}
        {showGasModal && gasEstimate && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3>Blockchain Deployment Cost</h3>
              <p><strong>Certificate ID:</strong> {showGasModal}</p>
              <div style={styles.gasDetails}>
                <p><strong>Gas Limit:</strong> {gasEstimate.gasLimit}</p>
                <p><strong>Gas Price:</strong> {gasEstimate.gasPrice}</p>
                <p style={styles.highlight}><strong>Estimated Fee:</strong> {gasEstimate.estimatedFeeEth} ETH (~${gasEstimate.estimatedFeeUsd} USD)</p>
              </div>
              <div style={styles.modalActions}>
                <button
                  onClick={() => handleConfirmDeploy(showGasModal)}
                  disabled={actionLoading}
                  style={styles.confirmButton}
                >
                  {actionLoading ? "Deploying..." : "Confirm & Deploy"}
                </button>
                <button
                  onClick={() => setShowGasModal(null)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
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
    fontSize: "0.95rem"
  },
  navLink: {
    color: "white",
    marginLeft: "12px",
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: 600
  },
  logoutBtn: {
    marginLeft: "12px",
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  content: {
    padding: "20px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  quickPanel: {
    display: "grid",
    gap: "24px",
    marginBottom: "24px"
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px"
  },
  actionCard: {
    backgroundColor: "white",
    padding: "18px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    textDecoration: "none",
    color: "#1f2937",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  },
  actionCardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
  },
  searchBar: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px"
  },
  searchInput: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "1rem"
  },
  filterButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  },
  filterButton: {
    padding: "10px 18px",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease"
  },
  filterActive: {
    backgroundColor: "#007bff",
    color: "white",
    borderColor: "#007bff"
  },
  recentSection: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "24px"
  },
  recentList: {
    display: "grid",
    gap: "12px",
    marginTop: "16px"
  },
  recentItem: {
    padding: "14px 18px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "#f9fafb"
  },
  tableScroll: {
    overflowX: "auto",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  statusBadge: (status) => ({
    padding: "4px 8px",
    borderRadius: "4px",
    backgroundColor: status === "PENDING" ? "#ffc107" : status === "ACTIVE" ? "#28a745" : "#dc3545",
    color: status === "PENDING" ? "black" : "white",
    fontSize: "0.9rem"
  }),
  primaryButton: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem"
  },
  confirmButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem"
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem"
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
  },
  gasDetails: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "4px",
    marginBottom: "20px",
    borderLeft: "4px solid #007bff"
  },
  highlight: {
    color: "#dc3545",
    fontSize: "1.1rem"
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end"
  }
};
