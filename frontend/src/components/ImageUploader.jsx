// src/components/ImageUploader.jsx
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { predictDisease } from "../api/api";
import PredictionResult from "./PredictionResult";
import toast from "react-hot-toast";

export default function ImageUploader() {
  const [preview, setPreview] = useState(null);
  const [file,    setFile]    = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error("Only image files are accepted.");
      return;
    }
    const f = accepted[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await predictDisease(file);
      setResult(data);
      toast.success("Analysis complete!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? "#4ade80" : "#2a3d2a"}`,
          background: isDragActive ? "rgba(74,222,128,0.05)" : "#111811",
          borderRadius: "4px",
          padding: "40px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          minHeight: "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img
            src={preview}
            alt="leaf preview"
            style={{ maxHeight: "180px", maxWidth: "100%", borderRadius: "4px", objectFit: "contain" }}
          />
        ) : (
          <>
            <span style={{ fontSize: "2.5rem" }}>🌿</span>
            <p style={{ color: "#6b8f6b", fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.85rem" }}>
              {isDragActive ? "Drop the image here..." : "Drag & drop a leaf image, or click to select"}
            </p>
            <p style={{ color: "#4b5e4b", fontFamily: "monospace", fontSize: "0.75rem" }}>
              JPG, PNG, WEBP — max 10MB
            </p>
          </>
        )}
      </div>

      {/* Action buttons */}
      {file && !result && (
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button className="btn btn-primary" onClick={handlePredict} disabled={loading} style={{ flex: 1 }}>
            {loading ? "🔄 Analyzing..." : "🔍 Detect Disease"}
          </button>
          <button className="btn btn-outline" onClick={handleReset}>
            ✕ Clear
          </button>
        </div>
      )}

      {result && !loading && (
        <div style={{ marginTop: "16px" }}>
          <button className="btn btn-outline" onClick={handleReset} style={{ marginBottom: "20px" }}>
            ← Analyze Another Image
          </button>
          <PredictionResult data={result} imageUrl={preview} />
        </div>
      )}
    </div>
  );
}
