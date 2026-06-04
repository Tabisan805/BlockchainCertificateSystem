import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ title, subtitle }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "guest";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <div>
        <h1 style={styles.title}>{title || "Certificate System"}</h1>
        <p style={styles.subtitle}>{subtitle || "Blockchain certificate platform"}</p>
      </div>

      <div style={styles.navActions}>
        <span style={styles.userBadge}>{user?.name || "Guest"} ({role})</span>
        <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
        <Link to="/create-certificate" style={styles.navLink}>Create</Link>
        <Link to="/search" style={styles.navLink}>Search</Link>
        <Link to="/verify" style={styles.navLink}>Verify</Link>
        {role === "admin" && (
          <Link to="/manage-certificates" style={styles.navLink}>Manage</Link>
        )}
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
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
  title: {
    margin: 0,
    fontSize: "1.8rem"
  },
  subtitle: {
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
  }
};
