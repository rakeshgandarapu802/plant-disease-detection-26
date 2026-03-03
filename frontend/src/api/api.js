// src/api/api.js

import axios from "axios";

/*
  ============================================
  AXIOS INSTANCE
  ============================================
*/

const api = axios.create({
  baseURL: "http://localhost:8081/api/v1", // ✅ Correct backend port
  headers: {
    "Content-Type": "application/json",
  },
});

/*
  ============================================
  REQUEST INTERCEPTOR
  → Attach JWT token automatically
  ============================================
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
  ============================================
  RESPONSE INTERCEPTOR
  → Handle global 401 (token expired / invalid)
  ============================================
*/

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/*
  ============================================
  AUTH APIs
  ============================================
*/

export const register = async (username, email, password) => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });
  return response.data;
};

export const login = async (username, password) => {
  const response = await api.post("/auth/login", {
    username,
    password,
  });

  // Save token & username
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("username", response.data.username);

  return response.data;
};

/*
  ============================================
  PROTECTED APIs
  ============================================
*/

export const predictDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.post("/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getHistory = async () => {
  const response = await api.get("/history");
  return response.data;
};

export const getStats = async () => {
  const response = await api.get("/stats");
  return response.data;
};

export const getDashboard = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export default api;