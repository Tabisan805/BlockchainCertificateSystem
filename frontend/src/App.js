import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateCertificate from "./pages/CreateCertificate";
import VerifyCertificate from "./pages/VerifyCertificate";
import ManageCertificates from "./pages/ManageCertificates";
import SearchCertificate from "./pages/SearchCertificate";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-certificate" element={<CreateCertificate />} />
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/manage-certificates" element={<ManageCertificates />} />
        <Route path="/search" element={<SearchCertificate />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
