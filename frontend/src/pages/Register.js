import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.register(email, password, name, role);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Register</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.formGroup}>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.input}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="verifier">Verifier</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5"
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px"
  },
  form: {
    marginTop: "20px"
  },
  formGroup: {
    marginBottom: "15px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
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
  link: {
    color: "#007bff",
    textDecoration: "none"
  }
};
