import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (email, password, name, role) =>
    api.post("/auth/register", { email, password, name, role }),
  getMe: () => api.get("/auth/me")
};

export const certificateAPI = {
  create: (data) => api.post("/certificates/create", data),
  getAll: () => api.get("/certificates"),
  getActive: () => api.get("/certificates/user/active"),
  getById: (id) => api.get(`/certificates/${id}`),
  update: (id, data) => api.put(`/certificates/${id}`, data),
  revoke: (id) => api.post(`/certificates/${id}/revoke`),
  getHistory: (id) => api.get(`/certificates/${id}/history`),
  // Admin endpoints
  getPending: () => api.get("/certificates/admin/pending-list"),
  estimateGas: (id) => api.post(`/certificates/admin/estimate-gas/${id}`),
  confirm: (id) => api.post(`/certificates/admin/confirm/${id}`),
  search: (params) => api.post("/certificates/search", params)
};

export const verifyAPI = {
  verifyCertificateId: (certificateId) =>
    api.post("/verify/certificate-id", { certificateId }),
  verifyUpload: (certificateId, certificateData) =>
    api.post("/verify/upload", { certificateId, certificateData })
};

export const qrAPI = {
  generate: (certificateId, verificationUrl) =>
    api.post("/qr/generate", { certificateId, verificationUrl }),
  getQR: (certificateId) => api.get(`/qr/${certificateId}`)
};

export const adminAPI = {
  getAllCertificates: () => api.get("/admin/certificates"),
  getAllUsers: () => api.get("/admin/users"),
  getStats: () => api.get("/admin/stats")
};

export default api;
