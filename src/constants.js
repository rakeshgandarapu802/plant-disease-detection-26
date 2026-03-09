export const DISEASES = [
  'Healthy',
  'Early Blight',
  'Late Blight',
  'Powdery Mildew',
  'Leaf Rust',
  'Leaf Spot',
];

export const DISEASE_COLORS = {
  Healthy:         '#22c55e',
  'Early Blight':  '#f59e0b',
  'Late Blight':   '#ef4444',
  'Powdery Mildew':'#a78bfa',
  'Leaf Rust':     '#f97316',
  'Leaf Spot':     '#06b6d4',
};

export const DISEASE_ICONS = {
  Healthy:         '🌿',
  'Early Blight':  '🍂',
  'Late Blight':   '🍃',
  'Powdery Mildew':'❄️',
  'Leaf Rust':     '🟠',
  'Leaf Spot':     '🔵',
};

export const DISEASE_DESCRIPTIONS = {
  Healthy:         'No disease detected. The plant appears healthy with normal chlorophyll levels.',
  'Early Blight':  'Alternaria solani infection. Dark brown spots with concentric rings on lower leaves.',
  'Late Blight':   'Phytophthora infestans. Water-soaked lesions turning dark; highly destructive.',
  'Powdery Mildew':'Fungal infection with white powdery coating on leaf surfaces.',
  'Leaf Rust':     'Puccinia spp. Orange-yellow pustules on leaf undersides.',
  'Leaf Spot':     'Various pathogens causing circular spots with defined margins.',
};

export const SEVERITY = {
  Healthy:         { level: 'None',     color: '#22c55e', pct: 0   },
  'Early Blight':  { level: 'Moderate', color: '#f59e0b', pct: 45  },
  'Late Blight':   { level: 'Severe',   color: '#ef4444', pct: 80  },
  'Powdery Mildew':{ level: 'Mild',     color: '#a78bfa', pct: 30  },
  'Leaf Rust':     { level: 'Moderate', color: '#f97316', pct: 55  },
  'Leaf Spot':     { level: 'Mild',     color: '#06b6d4', pct: 25  },
};
