import { DISEASES, DISEASE_COLORS } from "../constants";

const DISEASE_CLASSES = DISEASES;

function FeatureMapGrid({ maps, color, size }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: 72, justifyContent: 'center' }}>
      {maps.slice(0, 12).map((fm, i) => {
        const intensity = Math.min(1, Math.max(0, fm.value));
        return (
          <div
            key={i}
            title={`${fm.name}: ${fm.value.toFixed(3)}`}
            style={{
              width: size, height: size,
              background: `${color}${Math.round(intensity * 220 + 20).toString(16).padStart(2, '0')}`,
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'background 0.4s',
            }}
          />
        );
      })}
    </div>
  );
}

export default function CNNVisualizer({ cnnResult }) {
  if (!cnnResult) return null;
  const { layers, layerNames, probs } = cnnResult;

  const layerColors = ['#22c55e', '#facc15', '#22c55e', '#facc15', '#4ade80'];
  const layerSizes  = [9, 12, 9, 12, 10];

  return (
    <div>
      {/* Architecture Flow */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        overflowX: 'auto', paddingBottom: 8,
        scrollbarWidth: 'thin',
      }}>
        {/* Input block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
          <div style={{ fontSize: 9, color: '#4b5563', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>Input</div>
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'linear-gradient(135deg,#052e16,#14532d,#22c55e)',
            border: '1px solid rgba(34,197,94,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>🌿</div>
          <div style={{ fontSize: 8, color: '#374151', marginTop: 4, fontFamily: 'monospace' }}>224×224×3</div>
        </div>

        {layers.map((layer, li) => (
          <div key={li} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ color: '#1f2937', fontSize: 16, margin: '0 4px' }}>→</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
              <div style={{
                fontSize: 8, color: '#4b5563', marginBottom: 6, textAlign: 'center',
                fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap',
              }}>
                {layerNames[li]}
              </div>
              <FeatureMapGrid maps={layer} color={layerColors[li]} size={layerSizes[li]} />
              <div style={{ fontSize: 8, color: '#374151', marginTop: 4, fontFamily: 'monospace' }}>
                {layerNames[li].startsWith('MaxPool') ? '↓ 2×2 stride' : `${layer.length} filters`}
              </div>
            </div>
          </div>
        ))}

        <div style={{ color: '#1f2937', fontSize: 16, margin: '0 4px' }}>→</div>

        {/* FC + Softmax */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 }}>
          <div style={{ fontSize: 8, color: '#4b5563', marginBottom: 6, fontFamily: 'monospace', textTransform: 'uppercase' }}>FC + Softmax</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 100 }}>
            {probs.map((p, i) => {
              const cls = DISEASE_CLASSES[i];
              const col = DISEASE_COLORS[cls] || '#22c55e';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    height: 8,
                    width: `${Math.max(6, p * 88)}px`,
                    background: col,
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 8, color: '#6b7280', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                    {(p * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Formula Row */}
      <div style={{
        marginTop: 14, padding: '10px 14px',
        background: 'rgba(34,197,94,0.04)', borderLeft: '3px solid #16a34a',
        borderRadius: '0 8px 8px 0', lineHeight: 1.9,
        fontSize: 10, color: '#6b7280', fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span style={{ color: '#4ade80' }}>Conv:</span>&nbsp;
        (f * I)(x,y) = Σᵢ Σⱼ f(i,j) · I(x+i, y+j) + b
        &emsp;
        <span style={{ color: '#facc15' }}>ReLU:</span>&nbsp;
        σ(x) = max(0, x)
        &emsp;
        <span style={{ color: '#60a5fa' }}>Softmax:</span>&nbsp;
        P(yᵢ) = eˢⁱ / Σⱼ eˢʲ
        <br />
        <span style={{ color: '#f97316' }}>BatchNorm:</span>&nbsp;
        x̂ = (x − μ) / √(σ² + ε)
        &emsp;
        <span style={{ color: '#a78bfa' }}>MaxPool:</span>&nbsp;
        y(i,j) = max{'{'}x(i·s+m, j·s+n){'}'}
      </div>

      {/* Pixel Stats */}
      {cnnResult.pixelStats && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'R mean', val: cnnResult.pixelStats.rMean, color: '#ef4444' },
            { label: 'G mean', val: cnnResult.pixelStats.gMean, color: '#22c55e' },
            { label: 'B mean', val: cnnResult.pixelStats.bMean, color: '#3b82f6' },
            { label: 'Green dom.', val: cnnResult.pixelStats.greenDominance + 0.5, color: '#4ade80' },
            { label: 'Brightness', val: cnnResult.pixelStats.brightness, color: '#fbbf24' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '4px 10px', borderRadius: 8,
              background: `${s.color}0f`, border: `1px solid ${s.color}30`,
              fontSize: 10, color: s.color, fontFamily: 'monospace',
            }}>
              {s.label}: <strong>{Math.max(0, Math.min(1, s.val)).toFixed(3)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}