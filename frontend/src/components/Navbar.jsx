// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const token    = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const navStyle = {
    background: "#0d160d",
    borderBottom: "1px solid #2a3d2a",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "58px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#4ade80" : "#6b8f6b",
    textDecoration: "none",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "1px",
    padding: "4px 0",
    borderBottom: location.pathname === path ? "1px solid #4ade80" : "none",
  });

  return (
    <nav style={navStyle}>
      <Link to="/" style={{ ...linkStyle("/"), fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 800, color: "#4ade80", borderBottom: "none" }}>
        🌿 PlantGuard
      </Link>
      {token && (
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link to="/"          style={linkStyle("/")}>Detect</Link>
          <Link to="/dashboard" style={linkStyle("/dashboard")}>Dashboard</Link>
          <Link to="/history"   style={linkStyle("/history")}>History</Link>
          <span style={{ color: "#4b6b4b", fontFamily: "monospace", fontSize: "0.75rem" }}>
            {username}
          </span>
          <button onClick={logout} style={{
            background: "transparent", border: "1px solid #2a3d2a",
            color: "#6b8f6b", padding: "5px 14px", cursor: "pointer",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", borderRadius: "2px",
          }}>
            logout
          </button>
        </div>
      )}
    </nav>
  );
}
