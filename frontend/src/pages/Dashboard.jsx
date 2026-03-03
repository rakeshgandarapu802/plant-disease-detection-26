// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getStats, getDashboard } from "../api/api";

const COLORS = ["#4ade80", "#f87171", "#60a5fa", "#fbbf24", "#a78bfa", "#fb923c", "#34d399"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "#172017", border: "1px solid #2a3d2a", padding: "10px 14px", borderRadius: "2px" }}>
        <p style={{ color: "#4ade80", fontFamily: "monospace", fontSize: "0.82rem" }}>{payload[0].payload.disease}</p>
        <p style={{ color: "#e8f5e9", fontSize: "0.9rem" }}>Count: <strong>{payload[0].value}</strong></p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats,   setStats]   = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getDashboard()])
      .then(([s, d]) => { setStats(s); setSummary(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page" style={{ textAlign: "center", paddingTop: "80px" }}>
      <div style={{ color: "#4ade80", fontFamily: "monospace" }}>Loading dashboard...</div>
    </div>
  );

  const username = localStorage.getItem("username");

  return (
    <div className="page">
      <h1 className="page-title">
        <span>Dashboard</span> — {username}
      </h1>

      {/* Summary cards */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total Scans",     value: summary.totalPredictions, color: "#4ade80" },
            { label: "Diseases Found",  value: summary.diseasedCount,    color: "#f87171" },
            { label: "Healthy Plants",  value: summary.healthyCount,     color: "#60a5fa" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: "center", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: "2rem", fontFamily: "'Syne', sans-serif", fontWeight: 800, color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", color: "#6b8f6b", letterSpacing: "1px", textTransform: "uppercase", marginTop: "4px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {stats.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px" }}>
          <p style={{ color: "#6b8f6b" }}>No predictions yet. Upload a leaf image to get started!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Bar Chart */}
          <div className="card">
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", color: "#4ade80", marginBottom: "20px", letterSpacing: "1px", textTransform: "uppercase" }}>
              Disease Frequency
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.map(s => ({ disease: s.disease?.replace(/_/g,"  "), count: Number(s.count) }))}>
                <XAxis dataKey="disease" tick={{ fill: "#6b8f6b", fontSize: 9 }} />
                <YAxis tick={{ fill: "#6b8f6b", fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#4ade80" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", color: "#4ade80", marginBottom: "20px", letterSpacing: "1px", textTransform: "uppercase" }}>
              Distribution
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.map(s => ({ name: s.disease?.replace(/_/g," "), value: Number(s.count) }))}
                  cx="50%" cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fill: "#a8c4a8", fontSize: "9px" }}
                >
                  {stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ color: "#6b8f6b", fontSize: "11px" }} />
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
