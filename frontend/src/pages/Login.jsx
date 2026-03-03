// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/api";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      localStorage.setItem("token",    data.token);
      localStorage.setItem("username", data.username);
      toast.success(`Welcome back, ${data.username}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 58px)", padding: "24px" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🌿</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800 }}>
            Sign In to <span style={{ color: "#4ade80" }}>PlantGuard</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label className="label">Username</label>
            <input
              className="input"
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="your_username"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: "4px" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#6b8f6b", fontSize: "0.88rem" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "#4ade80", textDecoration: "none" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
