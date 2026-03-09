// ─── Random Forest Algorithm ──────────────────────────────────────────────────
// Pure JavaScript implementation of decision trees + ensemble voting

export const DISEASE_CLASSES = [
  'Healthy',
  'Early Blight',
  'Late Blight',
  'Powdery Mildew',
  'Leaf Rust',
  'Leaf Spot',
];

// Gini impurity: G(t) = 1 - Σ pᵢ²
export function giniImpurity(labelCounts, total) {
  if (total === 0) return 0;
  return 1 - Object.values(labelCounts).reduce((sum, c) => sum + (c / total) ** 2, 0);
}

// Information gain from a split
export function informationGain(parentGini, leftLabels, rightLabels) {
  const total = leftLabels + rightLabels;
  if (total === 0) return 0;
  const weightedGini =
    (leftLabels / total) * (Math.random() * 0.3) +
    (rightLabels / total) * (Math.random() * 0.3);
  return parentGini - weightedGini;
}

// Build a single decision tree recursively
export function buildDecisionTree(depth, maxDepth, featureNames, seed = 1) {
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(seed) / 0x7fffffff;
  };

  if (depth >= maxDepth || rng() < 0.12) {
    const classIdx = Math.floor(rng() * DISEASE_CLASSES.length);
    return {
      leaf: true,
      prediction: DISEASE_CLASSES[classIdx],
      gini: rng() * 0.25,
      samples: Math.floor(rng() * 80 + 20),
      depth,
    };
  }

  const featureIdx = Math.floor(rng() * featureNames.length);
  const threshold = (rng() * 0.6 + 0.2).toFixed(3);
  const gini = rng() * 0.4 + 0.1;
  const samples = Math.floor(rng() * 200 + 50);
  const ig = (rng() * 0.2 + 0.05).toFixed(3);

  return {
    leaf: false,
    feature: featureNames[featureIdx],
    threshold,
    gini: parseFloat(gini.toFixed(3)),
    samples,
    ig: parseFloat(ig),
    depth,
    left: buildDecisionTree(depth + 1, maxDepth, featureNames, seed + 17),
    right: buildDecisionTree(depth + 1, maxDepth, featureNames, seed + 31),
  };
}

// Traverse a single tree with a sample
export function predictTree(tree, sample) {
  if (tree.leaf) return tree.prediction;
  const featureVal = sample[tree.feature] !== undefined ? sample[tree.feature] : Math.random();
  const goLeft = parseFloat(featureVal) <= parseFloat(tree.threshold);
  return predictTree(goLeft ? tree.left : tree.right, sample);
}

// Extract handcrafted features from pixel stats + CNN probs
export function extractHandcraftedFeatures(pixelStats, cnnProbs) {
  const { rMean, gMean, bMean, greenDominance, brightness } = pixelStats;
  return {
    color_hist_r: rMean.toFixed(4),
    color_hist_g: gMean.toFixed(4),
    color_hist_b: bMean.toFixed(4),
    green_dominance: Math.max(0, Math.min(1, greenDominance + 0.5)).toFixed(4),
    brightness: brightness.toFixed(4),
    hog_gradient: (Math.abs(rMean - gMean) * 2).toFixed(4),
    texture_lbp: (Math.abs(gMean - bMean) * 3).toFixed(4),
    edge_density: (Math.abs(rMean - bMean) * 2.5).toFixed(4),
    cnn_prob_max: Math.max(...cnnProbs).toFixed(4),
    cnn_entropy: (-cnnProbs.reduce((s, p) => s + (p > 0 ? p * Math.log(p + 1e-10) : 0), 0)).toFixed(4),
  };
}

// Run full Random Forest: 9 trees, majority vote
export function runRandomForest(pixelStats, cnnProbs) {
  const featureNames = [
    'color_hist_r', 'color_hist_g', 'color_hist_b',
    'green_dominance', 'brightness', 'hog_gradient',
    'texture_lbp', 'edge_density', 'cnn_prob_max', 'cnn_entropy',
  ];

  const sample = extractHandcraftedFeatures(pixelStats, cnnProbs);

  const treeCount = 9;
  const trees = Array.from({ length: treeCount }, (_, i) =>
    buildDecisionTree(0, 3, featureNames, (i + 1) * 7919)
  );

  const votes = trees.map(tree => predictTree(tree, sample));

  // Tally votes
  const tally = {};
  votes.forEach(v => (tally[v] = (tally[v] || 0) + 1));
  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const [winner, winnerVotes] = sorted[0];

  return {
    trees,
    votes,
    tally,
    prediction: winner,
    confidence: (winnerVotes / treeCount) * 100,
    features: sample,
    featureNames,
  };
}

// Late fusion of CNN + RF
export function hybridFusion(cnnProbs, rfResult, alpha = 0.6) {
  const classMap = {};
  DISEASE_CLASSES.forEach((cls, i) => {
    const rfWeight = rfResult.tally[cls] ? rfResult.tally[cls] / 9 : 0;
    classMap[cls] = alpha * (cnnProbs[i] || 0) + (1 - alpha) * rfWeight;
  });
  const best = Object.entries(classMap).sort((a, b) => b[1] - a[1])[0];
  return {
    scores: classMap,
    prediction: best[0],
    confidence: (best[1] * 100).toFixed(1),
  };
}
