import { DISEASE_COLORS, DISEASE_ICONS, DISEASE_DESCRIPTIONS, SEVERITY } from '../constants';

export default function ResultCard({ prediction, cnnConf, rfConf, hybridConf }) {
  if (!prediction) return null;
  const color = DISEASE_COLORS[prediction] || '#22c55e';
  const icon  = DISEASE_ICONS[prediction] || '🌿';
  const desc  = DISEASE_DESCRIPTIONS[prediction] || '';
  const sev   = SEVERITY[prediction] || { level: 'Unknown', color: '#6b7280', pct: 0 };

  return (
    <div style={{
      background: `${color}0a`,
      border: `1.5px solid ${color}50`,
      borderRadius: 16, padding: 20,
      animation: 'fadeIn 0.5s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `${color}20`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{
            fontSize: 18, color, fontWeight: 900,
            fontFamily: "'Syne', sans-serif", lineHeight: 1.1,
          }}>
            {prediction}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4,
            padding: '2px 10px', borderRadius: 20,
            background: `${sev.color}18`, border: `1px solid ${sev.color}40`,
            fontSize: 10, color: sev.color, fontFamily: 'monospace',
          }}>
            ● Severity: {sev.level}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 12, color: '#9ca3af', lineHeight: 1.7, marginBottom: 16,
        fontFamily: 'Georgia, serif',
      }}>
        {desc}
      </p>

      {/* Confidence bars */}
      {[
        { label: 'CNN', val: cnnConf,    color: '#22c55e' },
        { label: 'RF',  val: rfConf,     color: '#fbbf24' },
        { label: 'Hybrid', val: hybridConf, color: '#a78bfa' },
      ].map(({ label, val, color: c }) => (
        <div key={label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: '#4b5563', fontFamily: 'monospace' }}>{label} Confidence</span>
            <span style={{ fontSize: 10, color: c, fontFamily: 'monospace', fontWeight: 700 }}>{parseFloat(val || 0).toFixed(1)}%</span>
          </div>
          <div style={{ height: 7, background: '#111', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, parseFloat(val || 0))}%`,
              background: c, borderRadius: 4,
              transition: 'width 1s ease',
              boxShadow: `0 0 8px ${c}66`,
            }} />
          </div>
        </div>
      ))}

      {/* Severity meter */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 10, color: '#4b5563', fontFamily: 'monospace' }}>Disease Severity</span>
          <span style={{ fontSize: 10, color: sev.color, fontFamily: 'monospace' }}>{sev.pct}%</span>
        </div>
        <div style={{ height: 7, background: '#111', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${sev.pct}%`,
            background: `linear-gradient(90deg, ${sev.color}88, ${sev.color})`,
            borderRadius: 4, transition: 'width 1s ease 0.3s',
          }} />
        </div>
      </div>
    </div>
  );
}
