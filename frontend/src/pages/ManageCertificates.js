import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminAPI, certificateAPI } from "../utils/api";

export default function ManageCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("certificates");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [certRes, userRes] = await Promise.all([
        adminAPI.getAllCertificates(),
        adminAPI.getAllUsers()
      ]);
      setCertificates(certRes.data.certificates || []);
      setUsers(userRes.data.users || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load manage data");
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const handleRevoke = async (certificateId) => {
    setActionLoading(certificateId);
    setError("");

    try {
      await certificateAPI.revoke(certificateId);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Revoke failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <p>Loading management tools...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <div>
          <h1>Admin Management</h1>
          <p>Manage certificates and users in the system.</p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/dashboard" style={styles.secondaryButton}>
            Back to Dashboard
          </Link>
          <button
            style={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Certificates</h3>
          <p>{certificates.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Users</h3>
          <p>{users.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Current Tab</h3>
          <p>{activeTab === "certificates" ? "Certificate List" : "User List"}</p>
        </div>
      </div>

      <div style={styles.tabBar}>
        <button
          type="button"
          onClick={() => setActiveTab("certificates")}
          style={{
            ...styles.tabButton,
            ...(activeTab === "certificates" ? styles.tabActive : {})
          }}
        >
          Certificates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          style={{
            ...styles.tabButton,
            ...(activeTab === "users" ? styles.tabActive : {})
          }}
        >
          Users
        </button>
      </div>

      {activeTab === "certificates" && (
        <div style={styles.card}>
          <h2>Certificate Catalog</h2>
          {certificates.length === 0 ? (
            <p>No certificates found.</p>
          ) : (
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Owner</th>
                    <th>Skill</th>
                    <th>Status</th>
                    <th>Issued</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((item) => (
                    <tr key={item.certificateId}>
                      <td>{item.certificateId}</td>
                      <td>{item.ownerName}</td>
                      <td>{item.skillName}</td>
                      <td>{item.status}</td>
                      <td>{new Date(item.issueDate * 1000).toLocaleDateString()}</td>
                      <td>
                        {item.status === "ACTIVE" ? (
                          <button
                            style={styles.dangerButton}
                            disabled={actionLoading === item.certificateId}
                            onClick={() => handleRevoke(item.certificateId)}
                          >
                            {actionLoading === item.certificateId ? "Revoking..." : "Revoke"}
                          </button>
                        ) : (
                          <span style={styles.disabledText}>No action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div style={styles.card}>
          <h2>User Directory</h2>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem._id || userItem.email}>
                      <td>{userItem.name}</td>
                      <td>{userItem.email}</td>
                      <td>{userItem.role}</td>
                      <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    padding: "24px",
    backgroundColor: "#f4f7fb"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px"
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  statCard: {
    backgroundColor: "white",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(25, 41, 61, 0.08)",
    textAlign: "center"
  },
  tabBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px"
  },
  tabButton: {
    padding: "12px 18px",
    borderRadius: "999px",
    border: "1px solid #d3d9e6",
    backgroundColor: "white",
    cursor: "pointer",
    color: "#2f3a4a",
    flex: 1,
    fontWeight: 600
  },
  tabActive: {
    backgroundColor: "#2f6bed",
    borderColor: "#2f6bed",
    color: "white"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 4px 18px rgba(16, 38, 77, 0.08)",
    marginBottom: "24px"
  },
  tableScroll: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "720px"
  },
  dangerButton: {
    padding: "8px 14px",
    backgroundColor: "#d9534f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  secondaryButton: {
    padding: "10px 16px",
    borderRadius: "6px",
    border: "1px solid #2f6bed",
    backgroundColor: "white",
    color: "#2f6bed",
    textDecoration: "none",
    fontWeight: 600,
    cursor: "pointer"
  },
  logoutBtn: {
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#ff5c5c",
    color: "white",
    cursor: "pointer"
  },
  error: {
    backgroundColor: "#fdecea",
    color: "#611a15",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px"
  },
  disabledText: {
    color: "#777",
    fontSize: "0.95rem"
  }
};
