// src/components/PredictionResult.jsx
import React from "react";
import { jsPDF } from "jspdf";

export default function PredictionResult({ data, imageUrl }) {
  const { disease, confidence, is_healthy, remedy, top3 } = data;
  const statusColor = is_healthy ? "#4ade80" : "#f87171";
  const displayName = disease.replace(/_/g, " ");

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const green = [74, 222, 128];
    const dark  = [10, 15, 10];

    // Header bar
    doc.setFillColor(...dark);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(17, 24, 17);
    doc.rect(0, 0, 210, 40, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...green);
    doc.text("🌿 PlantGuard — Disease Report", 20, 22);

    doc.setFontSize(9);
    doc.setTextColor(107, 143, 107);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 32);

    // Result section
    doc.setFillColor(23, 32, 23);
    doc.roundedRect(15, 48, 180, 50, 2, 2, "F");

    doc.setFontSize(11);
    doc.setTextColor(...green);
    doc.text("DIAGNOSIS", 22, 60);

    doc.setFontSize(16);
    doc.setTextColor(232, 245, 233);
    doc.text(displayName, 22, 72);

    doc.setFontSize(11);
    doc.setTextColor(is_healthy ? 74 : 248, is_healthy ? 222 : 113, is_healthy ? 128 : 113);
    doc.text(`Status: ${is_healthy ? "✓ Healthy" : "⚠ Diseased"}`, 22, 82);

    doc.setTextColor(232, 245, 233);
    doc.text(`Confidence: ${confidence}%`, 22, 91);

    // Remedy
    if (!is_healthy) {
      doc.setFontSize(11);
      doc.setTextColor(...green);
      doc.text("REMEDY RECOMMENDATION", 22, 115);
      doc.setTextColor(200, 220, 200);
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(remedy, 170);
      doc.text(lines, 22, 124);
    }

    // Top 3
    const top3Y = is_healthy ? 115 : 165;
    doc.setFontSize(11);
    doc.setTextColor(...green);
    doc.text("TOP 3 PREDICTIONS", 22, top3Y);

    top3.forEach((t, i) => {
      const y = top3Y + 12 + i * 10;
      doc.setFillColor(23, 32, 23);
      doc.rect(22, y - 5, 166, 8, "F");
      doc.setTextColor(200, 220, 200);
      doc.setFontSize(9);
      doc.text(`${i + 1}. ${t.class.replace(/_/g, " ")}`, 26, y);
      doc.text(`${t.confidence}%`, 172, y, { align: "right" });
    });

    doc.save(`plant-report-${Date.now()}.pdf`);
  };

  return (
    <div className="card" style={{ borderLeft: `3px solid ${statusColor}` }}>
      {/* Status header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", color: statusColor, marginBottom: "4px" }}>
            {is_healthy ? "✅ Healthy Plant" : "⚠️ Disease Detected"}
          </h2>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.9rem", color: "#c8dcc8" }}>
            {displayName}
          </p>
        </div>
        <button className="btn btn-outline" onClick={downloadPDF} style={{ fontSize: "0.82rem" }}>
          📥 PDF Report
        </button>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", color: "#6b8f6b", letterSpacing: "1px", textTransform: "uppercase" }}>Confidence</span>
          <strong style={{ color: statusColor }}>{confidence}%</strong>
        </div>
        <div style={{ background: "#172017", borderRadius: "2px", height: "8px", overflow: "hidden" }}>
          <div style={{
            width: `${confidence}%`,
            height: "100%",
            background: statusColor,
            borderRadius: "2px",
            transition: "width 1s ease",
          }} />
        </div>
      </div>

      {/* Remedy */}
      {!is_healthy && (
        <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.3)", padding: "16px", marginBottom: "20px", borderRadius: "2px" }}>
          <h4 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fbbf24", marginBottom: "10px" }}>
            🌿 Suggested Remedy
          </h4>
          <p style={{ color: "#d4c8a0", fontSize: "0.92rem", lineHeight: "1.7" }}>{remedy}</p>
        </div>
      )}

      {/* Top 3 */}
      <div>
        <h4 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "2px", textTransform: "uppercase", color: "#6b8f6b", marginBottom: "10px" }}>
          Top 3 Predictions
        </h4>
        {top3.map((t, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            background: i === 0 ? "rgba(74,222,128,0.08)" : "#172017",
            marginBottom: "4px",
            border: i === 0 ? "1px solid rgba(74,222,128,0.3)" : "1px solid #2a3d2a",
            borderRadius: "2px",
          }}>
            <span style={{ color: i === 0 ? "#e8f5e9" : "#8a9e8a", fontSize: "0.87rem" }}>
              {i + 1}. {t.class.replace(/_/g, " ")}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.82rem", color: i === 0 ? "#4ade80" : "#6b8f6b" }}>
              {t.confidence}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
