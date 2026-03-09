import { DISEASES, DISEASE_COLORS, DISEASE_ICONS } from "../constants";

const DISEASE_CLASSES = DISEASES;

export default function HybridFusion({ cnnResult, rfResult, fusionResult }) {
  if (!cnnResult || !rfResult || !fusionResult) return null;

  const { scores, prediction, confidence } = fusionResult;
  const finalColor = DISEASE_COLORS[prediction] || '#22c55e';

  return (
    <div>
      {/* Flow Diagram */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{
          padding: '14px 18px', borderRadius: 12, textAlign: 'center', minWidth: 100,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)',
        }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🧠</div>
          <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>CNN</div>
          <div style={{ fontSize: 9, color: '#4b5563', fontFamily: 'monospace' }}>Deep Features</div>
          <div style={{ fontSize: 13, color: '#4ade80', marginTop: 4, fontFamily: 'monospace' }}>
            α = 0.60
          </div>
        </div>

        <div style={{ fontSize: 22, color: '#1f2937' }}>⊕</div>

        <div style={{
          padding: '14px 18px', borderRadius: 12, textAlign: 'center', minWidth: 100,
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
        }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🌲</div>
          <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>Random Forest</div>
          <div style={{ fontSize: 9, color: '#4b5563', fontFamily: 'monospace' }}>Handcrafted</div>
          <div style={{ fontSize: 13, color: '#fbbf24', marginTop: 4, fontFamily: 'monospace' }}>
            (1−α) = 0.40
          </div>
        </div>

        <div style={{ fontSize: 22, color: '#1f2937' }}>→</div>

        <div style={{
          padding: '16px 22px', borderRadius: 12, textAlign: 'center', minWidth: 130,
          background: `${finalColor}12`,
          border: `2px solid ${finalColor}80`,
          boxShadow: `0 0 24px ${finalColor}22`,
        }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{DISEASE_ICONS[prediction] || '🌿'}</div>
          <div style={{ fontSize: 12, color: finalColor, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
            {prediction}
          </div>
          <div style={{ fontSize: 9, color: '#4b5563', fontFamily: 'monospace', marginTop: 2 }}>Hybrid Decision</div>
          <div style={{
            fontSize: 16, color: finalColor, marginTop: 6,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
          }}>
            {confidence}%
          </div>
        </div>
      </div>

      {/* Per-class fusion scores */}
      <div style={{ marginBottom: 18 }}>
        <div style={{
          fontSize: 10, color: '#4b5563', marginBottom: 10,
          fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Fused Class Scores — H(x) = 0.6·P_CNN + 0.4·P_RF
        </div>
        {DISEASE_CLASSES.map((cls, i) => {
          const score = scores[cls] || 0;
          const cnnScore = cnnResult.probs[i] || 0;
          const rfScore = rfResult.tally[cls] ? rfResult.tally[cls] / 9 : 0;
          const color = DISEASE_COLORS[cls] || '#6b7280';
          return (
            <div key={cls} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color, fontFamily: 'monospace' }}>
                  {DISEASE_ICONS[cls]} {cls}
                </span>
                <span style={{ fontSize: 10, color: '#6b7280', fontFamily: 'monospace' }}>
                  CNN:{(cnnScore * 100).toFixed(0)}% · RF:{(rfScore * 100).toFixed(0)}% · Fused:{(score * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ position: 'relative', height: 10, background: '#111', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${cnnScore * 60}%`,
                  background: `${color}60`,
                  borderRadius: 5,
                  transition: 'width 0.8s ease',
                }} />
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${score * 100}%`,
                  background: color,
                  borderRadius: 5,
                  transition: 'width 0.8s ease',
                  opacity: 0.85,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula */}
      <div style={{
        padding: '12px 14px',
        background: 'rgba(167,139,250,0.05)', borderLeft: '3px solid #7c3aed',
        borderRadius: '0 8px 8px 0', lineHeight: 2.0,
        fontSize: 10, color: '#6b7280', fontFamily: "'JetBrains Mono', monospace",
      }}>
        <div>
          <span style={{ color: '#a78bfa' }}>Late Fusion:</span>&nbsp;
          H(x) = α · P_CNN(y|x) + (1 − α) · P_RF(y|x)
        </div>
        <div>
          <span style={{ color: '#4ade80' }}>α = 0.6</span> (CNN weight learned on validation set)&emsp;
          <span style={{ color: '#fbbf24' }}>(1 − α) = 0.4</span> (RF weight)
        </div>
        <div>
          <span style={{ color: '#f97316' }}>Decision:</span>&nbsp;
          ŷ = argmaxᵧ H(x)&emsp;
          <span style={{ color: '#22c55e' }}>Confidence:</span>&nbsp;
          {"max{H(x)} × 100"}
        </div>
      </div>
    </div>
  );
}