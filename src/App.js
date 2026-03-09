import { useState, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import CNNVisualizer from './components/CNNVisualizer';
import RFVisualizer from './components/RFVisualizer';
import HybridFusion from './components/HybridFusion';
import ResultCard from './components/ResultCard';
import { runCNN } from './algorithms/cnn';
import { runRandomForest, hybridFusion } from './algorithms/randomForest';
import { DISEASE_COLORS } from './constants';

const TABS = [
  { id: 'cnn',    label: '🧠 CNN',           color: '#22c55e' },
  { id: 'rf',     label: '🌲 Random Forest', color: '#fbbf24' },
  { id: 'fusion', label: '⚡ Hybrid Fusion', color: '#a78bfa' },
];

const PIPELINE_STEPS = [
  'Image Preprocessing',
  'Feature Extraction',
  'CNN Forward Pass',
  'RF Ensemble',
  'Late Fusion',
];

export default function App() {
  const [image, setImage]         = useState(null); // { src, imageData, fileName, width, height }
  const [stage, setStage]         = useState('idle'); // idle | running | done
  const [progress, setProgress]   = useState(0);
  const [stepIdx, setStepIdx]     = useState(0);
  const [activeTab, setActiveTab] = useState('cnn');
  const [cnnResult, setCnnResult] = useState(null);
  const [rfResult, setRfResult]   = useState(null);
  const [fusionResult, setFusionResult] = useState(null);
  const progressRef = useRef(null);

  // Handle image loaded
  const handleImageLoaded = (imgData) => {
    setImage(imgData);
    setStage('idle');
    setCnnResult(null);
    setRfResult(null);
    setFusionResult(null);
    setProgress(0);
    setStepIdx(0);
  };

  // Start analysis
  const handleAnalyze = () => {
    if (!image) return;
    setStage('running');
    setProgress(0);
    setStepIdx(0);
    setCnnResult(null);
    setRfResult(null);
    setFusionResult(null);
  };

  // Progress animation
  useEffect(() => {
    if (stage !== 'running') return;
    let p = 0;
    progressRef.current = setInterval(() => {
      p += 1.5;
      setProgress(Math.min(p, 100));
      setStepIdx(Math.min(Math.floor((p / 100) * PIPELINE_STEPS.length), PIPELINE_STEPS.length - 1));
      if (p >= 100) {
        clearInterval(progressRef.current);
      }
    }, 35);
    return () => clearInterval(progressRef.current);
  }, [stage]);

  // Compute results when progress reaches 100
  useEffect(() => {
    if (progress < 100 || stage !== 'running') return;
    setTimeout(() => {
      const cnn     = runCNN(image.imageData);
      const rf      = runRandomForest(cnn.pixelStats, cnn.probs);
      const fusion  = hybridFusion(cnn.probs, rf);
      setCnnResult(cnn);
      setRfResult(rf);
      setFusionResult(fusion);
      setStage('done');
    }, 200);
  }, [progress, stage, image]);

  const finalDisease = fusionResult?.prediction;
  const finalColor   = DISEASE_COLORS[finalDisease] || '#22c55e';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030a03',
      color: '#e2e8f0',
      fontFamily: "'Georgia', serif",
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=JetBrains+Mono:wght@300;400;600&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanLine { 0%{top:-5%} 100%{top:105%} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gridDrift { 0%,100%{opacity:0.5} 50%{opacity:0.9} }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #0a140a; }
        ::-webkit-scrollbar-thumb { background: #16a34a; border-radius: 3px; }
        button { font-family: inherit; cursor: pointer; }
      `}</style>

      {/* ── Background Grid ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '44px 44px',
        animation: 'gridDrift 10s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed', top: -120, left: -120, width: 500, height: 500, zIndex: 0,
        background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%)',
        borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: -120, right: -120, width: 600, height: 600, zIndex: 0,
        background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 65%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '28px 18px 60px' }}>

        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: 36, animation: 'fadeIn 0.7s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px', borderRadius: 30, marginBottom: 16,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.28)',
            fontSize: 10, color: '#4ade80', letterSpacing: 3,
            fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            Hybrid Deep Learning System · v2.5
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(26px,5vw,54px)',
            fontWeight: 900, letterSpacing: -1, lineHeight: 1.05,
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 35%, #fbbf24 70%, #f97316 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 12,
          }}>
            Plant Disease Detection
          </h1>
          <p style={{ color: '#4b5563', fontSize: 14, maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
            Upload a real leaf image for automated diagnosis using&nbsp;
            <span style={{ color: '#4ade80' }}>Convolutional Neural Networks</span> fused with&nbsp;
            <span style={{ color: '#fbbf24' }}>Random Forest</span> ensemble classifiers
          </p>
        </header>

        {/* ── Main Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 300px) 1fr',
          gap: 20, alignItems: 'start',
        }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Upload Panel */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(34,197,94,0.18)',
              borderRadius: 16, padding: 18,
              animation: 'fadeIn 0.7s ease 0.1s both',
            }}>
              <div style={{
                fontSize: 10, color: '#4b5563', marginBottom: 12,
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase', letterSpacing: 2,
              }}>
                Upload Leaf Image
              </div>
              <ImageUploader onImageLoaded={handleImageLoaded} disabled={stage === 'running'} />
            </div>

            {/* Image Preview */}
            {image && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: 14, position: 'relative', overflow: 'hidden',
                animation: 'fadeIn 0.5s ease',
              }}>
                {stage === 'running' && (
                  <div style={{
                    position: 'absolute', left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg,transparent,#22c55e,transparent)',
                    animation: 'scanLine 1.2s linear infinite', zIndex: 2,
                  }} />
                )}
                <div style={{ fontSize: 10, color: '#4b5563', marginBottom: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Sample Preview
                </div>
                <img
                  src={image.src}
                  alt="Uploaded leaf"
                  style={{
                    width: '100%', height: 200, objectFit: 'cover',
                    borderRadius: 10, display: 'block',
                    border: stage === 'done' ? `2px solid ${finalColor}` : '1px solid rgba(255,255,255,0.06)',
                    transition: 'border 0.4s ease',
                  }}
                />
                <div style={{ fontSize: 10, color: '#374151', marginTop: 8, fontFamily: 'monospace' }}>
                  📁 {image.fileName} · {image.width}×{image.height}px
                </div>
                {stage === 'done' && finalDisease && (
                  <div style={{
                    marginTop: 10, padding: '6px 14px', borderRadius: 20,
                    background: `${finalColor}18`, border: `1px solid ${finalColor}55`,
                    fontSize: 12, color: finalColor, fontWeight: 700,
                    fontFamily: "'Syne', sans-serif", animation: 'fadeIn 0.4s ease',
                    textAlign: 'center',
                  }}>
                    ✓ {finalDisease}
                  </div>
                )}
              </div>
            )}

            {/* Analyze Button */}
            {image && stage !== 'running' && (
              <button
                onClick={handleAnalyze}
                style={{
                  padding: '14px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg,#166534,#22c55e)',
                  color: '#fff', fontSize: 15,
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: 0.5,
                  boxShadow: '0 0 28px rgba(34,197,94,0.28)',
                  transition: 'all 0.25s',
                  animation: 'fadeIn 0.5s ease',
                }}
                onMouseEnter={e => { e.target.style.filter = 'brightness(1.15)'; e.target.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.target.style.filter = ''; e.target.style.transform = ''; }}
              >
                🔬 {stage === 'done' ? 'Re-Analyze' : 'Run Analysis'}
              </button>
            )}

            {/* Running indicator */}
            {stage === 'running' && (
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.22)',
                animation: 'fadeIn 0.3s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid #22c55e', borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 12, color: '#4ade80', fontFamily: 'monospace' }}>
                    Analyzing... {Math.round(progress)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 5, background: '#0f1f0f', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg,#166534,#4ade80,#fbbf24)',
                    borderRadius: 3, transition: 'width 0.1s linear',
                    boxShadow: '0 0 8px rgba(34,197,94,0.5)',
                  }} />
                </div>
                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {PIPELINE_STEPS.map((step, i) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'monospace' }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: i < stepIdx ? '#22c55e' : i === stepIdx ? '#fbbf24' : '#1f2937',
                        animation: i === stepIdx ? 'pulse 0.8s infinite' : 'none',
                      }} />
                      <span style={{ color: i <= stepIdx ? (i === stepIdx ? '#fbbf24' : '#4ade80') : '#1f2937' }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result Card */}
            {stage === 'done' && fusionResult && (
              <ResultCard
                prediction={fusionResult.prediction}
                cnnConf={Math.max(...(cnnResult?.probs || [0])) * 100}
                rfConf={rfResult?.confidence}
                hybridConf={fusionResult.confidence}
              />
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Idle placeholder */}
            {stage === 'idle' && !image && (
              <div style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 48,
                textAlign: 'center', animation: 'fadeIn 0.7s ease',
              }}>
                <div style={{ fontSize: 56, marginBottom: 18, opacity: 0.3 }}>🔬</div>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontSize: 18, color: '#1f2937', marginBottom: 10, fontWeight: 700,
                }}>
                  Upload a Leaf Image to Begin
                </div>
                <p style={{ fontSize: 12, color: '#1f2937', lineHeight: 1.8, maxWidth: 380, margin: '0 auto' }}>
                  The pipeline will extract pixel features, run a CNN forward pass through 5 conv/pool layers,
                  build a 9-tree Random Forest ensemble, then fuse both predictions for the final diagnosis.
                </p>
                <div style={{ marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['CNN Layers', 'Feature Maps', 'Decision Trees', 'Gini Splits', 'Late Fusion'].map(tag => (
                    <span key={tag} style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 10,
                      background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
                      color: '#374151', fontFamily: 'monospace',
                    }}>
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Idle with image */}
            {stage === 'idle' && image && (
              <div style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 36, textAlign: 'center',
                animation: 'fadeIn 0.5s ease',
              }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>🌿</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, color: '#4ade80', marginBottom: 8, fontWeight: 700 }}>
                  Image ready
                </div>
                <p style={{ fontSize: 12, color: '#4b5563' }}>Click <strong style={{ color: '#4ade80' }}>Run Analysis</strong> to start the CNN + RF pipeline.</p>
              </div>
            )}

            {/* Algorithm Tabs */}
            {(stage === 'running' || stage === 'done') && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>
                {/* Tab header */}
                <div style={{ display: 'flex', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        flex: 1, padding: '11px 0', border: 'none',
                        background: activeTab === tab.id ? `${tab.color}12` : 'rgba(255,255,255,0.02)',
                        borderBottom: activeTab === tab.id ? `2.5px solid ${tab.color}` : '2.5px solid rgba(255,255,255,0.05)',
                        color: activeTab === tab.id ? tab.color : '#374151',
                        fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 400,
                        fontFamily: "'Syne', sans-serif",
                        transition: 'all 0.2s',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab body */}
                <div style={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none',
                  borderRadius: '0 0 14px 14px', padding: 22, minHeight: 280,
                }}>
                  {/* CNN Tab */}
                  {activeTab === 'cnn' && (
                    <div key="cnn" style={{ animation: 'fadeIn 0.35s ease' }}>
                      <div style={{
                        fontSize: 11, color: '#4ade80', marginBottom: 14,
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, textTransform: 'uppercase',
                      }}>
                        Convolutional Neural Network — Forward Pass
                      </div>
                      {!cnnResult && (
                        <div style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: 12 }}>
                          Running forward pass<span style={{ animation: 'pulse 1s infinite' }}>…</span>
                        </div>
                      )}
                      {cnnResult && <CNNVisualizer cnnResult={cnnResult} />}
                    </div>
                  )}

                  {/* RF Tab */}
                  {activeTab === 'rf' && (
                    <div key="rf" style={{ animation: 'fadeIn 0.35s ease' }}>
                      <div style={{
                        fontSize: 11, color: '#fbbf24', marginBottom: 14,
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, textTransform: 'uppercase',
                      }}>
                        Random Forest — 9-Tree Ensemble
                      </div>
                      {!rfResult && (
                        <div style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: 12 }}>
                          Growing decision trees<span style={{ animation: 'pulse 1s infinite' }}>…</span>
                        </div>
                      )}
                      {rfResult && <RFVisualizer rfResult={rfResult} />}
                    </div>
                  )}

                  {/* Fusion Tab */}
                  {activeTab === 'fusion' && (
                    <div key="fusion" style={{ animation: 'fadeIn 0.35s ease' }}>
                      <div style={{
                        fontSize: 11, color: '#a78bfa', marginBottom: 14,
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, textTransform: 'uppercase',
                      }}>
                        Hybrid Late Fusion — CNN ⊕ Random Forest
                      </div>
                      {!fusionResult && (
                        <div style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: 12 }}>
                          Fusing model outputs<span style={{ animation: 'pulse 1s infinite' }}>…</span>
                        </div>
                      )}
                      {fusionResult && (
                        <HybridFusion
                          cnnResult={cnnResult}
                          rfResult={rfResult}
                          fusionResult={fusionResult}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer style={{
          textAlign: 'center', marginTop: 50,
          fontSize: 10, color: '#111', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
        }}>
          CNN (VGG-16 inspired · 5 conv/pool layers) + Random Forest (9 trees · Gini impurity) · Late Fusion α=0.6
        </footer>
      </div>
    </div>
  );
}
