// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 58px)", padding: "24px" }}>
      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🌱</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.5rem", fontWeight: 800 }}>
            Create Account
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { key: "username", label: "Username",         type: "text",     placeholder: "farmer_john" },
            { key: "email",    label: "Email Address",    type: "email",    placeholder: "john@farm.com" },
            { key: "password", label: "Password",         type: "password", placeholder: "min 6 chars" },
            { key: "confirm",  label: "Confirm Password", type: "password", placeholder: "repeat password" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                className="input"
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required
              />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: "4px" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "18px", color: "#6b8f6b", fontSize: "0.88rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#4ade80", textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
