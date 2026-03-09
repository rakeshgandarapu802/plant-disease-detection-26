import React from "react";
import { DISEASES, DISEASE_COLORS, DISEASE_ICONS } from "../constants";

export default function RFResultPanel({ rfResult }) {
  if (!rfResult) return null;

  const { tally, prediction, confidence } = rfResult;

  return (
    <div style={{
      background: "#0f172a",
      padding: 20,
      borderRadius: 14,
      boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
      marginTop: 20
    }}>

      <h3 style={{
        color: "#e2e8f0",
        marginBottom: 16,
        fontFamily: "monospace",
        letterSpacing: 1
      }}>
        🌲 Random Forest Decision
      </h3>

      {/* Prediction card */}
      <div style={{
        padding: 18,
        borderRadius: 12,
        background: `${DISEASE_COLORS[prediction]}22`,
        border: `2px solid ${DISEASE_COLORS[prediction]}`,
        textAlign: "center",
        marginBottom: 20
      }}>
        <div style={{ fontSize: 32 }}>
          {DISEASE_ICONS[prediction]}
        </div>

        <div style={{
          fontSize: 20,
          color: DISEASE_COLORS[prediction],
          fontWeight: 700
        }}>
          {prediction}
        </div>

        <div style={{
          fontSize: 14,
          color: "#94a3b8"
        }}>
          Confidence: {confidence.toFixed(1)}%
        </div>
      </div>

      {/* Vote bars */}
      {DISEASES.map((disease) => {
        const votes = tally[disease] || 0;
        const percent = (votes / 9) * 100;

        return (
          <div key={disease} style={{ marginBottom: 12 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 4,
              color: "#cbd5f5"
            }}>
              <span>{DISEASE_ICONS[disease]} {disease}</span>
              <span>{votes} votes</span>
            </div>

            <div style={{
              height: 8,
              background: "#1e293b",
              borderRadius: 6,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${percent}%`,
                height: "100%",
                background: DISEASE_COLORS[disease],
                transition: "width 0.7s ease"
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}