// src/pages/Home.jsx
import React from "react";
import ImageUploader from "../components/ImageUploader";

export default function Home() {
  return (
    <div className="page">
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#4ade80", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "10px" }}>
          ● Plant Disease Detection
        </p>
        <h1 className="page-title">
          Upload a <span>Leaf Image</span><br />Get Instant Diagnosis
        </h1>
        <p style={{ color: "#6b8f6b", maxWidth: "540px", fontSize: "0.95rem" }}>
          Supports Tomato, Potato, and Corn. Upload a clear photo of the leaf and our AI will detect diseases and suggest remedies.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "32px" }}>
        {[
          { icon: "🍅", plant: "Tomato", classes: "6 disease classes" },
          { icon: "🥔", plant: "Potato", classes: "2 disease classes" },
          { icon: "🌽", plant: "Corn",   classes: "3 disease classes" },
        ].map((p) => (
          <div key={p.plant} className="card" style={{ textAlign: "center", padding: "16px" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{p.icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e8f5e9" }}>{p.plant}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", color: "#6b8f6b", marginTop: "2px" }}>{p.classes}</div>
          </div>
        ))}
      </div>

      <ImageUploader />
    </div>
  );
}
