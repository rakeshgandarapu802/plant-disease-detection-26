// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import { getHistory } from "../api/api";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dt) =>
    new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="page">
      <h1 className="page-title">Prediction <span>History</span></h1>

      {loading ? (
        <p style={{ color: "#6b8f6b", fontFamily: "monospace" }}>Loading history...</p>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px" }}>
          <p style={{ color: "#6b8f6b" }}>No predictions yet. Upload a leaf image to get started!</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Disease</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>File</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.id}>
                  <td style={{ color: "#4b6b4b" }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{h.diseaseName?.replace(/_/g, " ")}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ background: "#172017", width: "60px", height: "6px", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${h.confidence}%`, height: "100%", background: h.isHealthy ? "#4ade80" : "#f87171" }} />
                      </div>
                      <span>{h.confidence?.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={h.isHealthy ? "badge-healthy" : "badge-diseased"}>
                      {h.isHealthy ? "Healthy" : "Diseased"}
                    </span>
                  </td>
                  <td style={{ color: "#6b8f6b", fontSize: "0.8rem" }}>{h.imageFilename || "—"}</td>
                  <td style={{ color: "#6b8f6b", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {formatDate(h.predictedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
