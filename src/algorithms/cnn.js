// ─── CNN Algorithm ────────────────────────────────────────────────────────────
// Pure JavaScript simulation of a VGG-16 inspired CNN forward pass

export function relu(x) {
  return Math.max(0, x);
}

export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

// Simulate convolution layer: input activations → feature maps
export function convLayer(inputActivations, filterCount, layerName, stride = 1) {
  return Array.from({ length: filterCount }, (_, filterIdx) => {
    // Weighted sum over input with learned-like random weights
    const weights = inputActivations.map(() => (Math.random() - 0.5) * 0.4);
    const bias = (Math.random() - 0.5) * 0.1;
    const preActivation =
      inputActivations.reduce((sum, v, i) => sum + v * weights[i], 0) / inputActivations.length + bias;
    return {
      name: `${layerName}_F${filterIdx + 1}`,
      preActivation,
      value: relu(preActivation),
      filterIdx,
    };
  });
}

// Max pooling: reduce spatial resolution, keep strongest activations
export function maxPool(featureMaps) {
  const pooled = [];
  for (let i = 0; i < featureMaps.length - 1; i += 2) {
    const a = featureMaps[i].value;
    const b = featureMaps[i + 1].value;
    pooled.push({
      ...featureMaps[i],
      name: `Pool_${featureMaps[i].name}`,
      value: Math.max(a, b) * 0.97, // slight attenuation from pooling
      pooled: true,
    });
  }
  return pooled;
}

// Batch normalization (simplified)
export function batchNorm(featureMaps) {
  const vals = featureMaps.map(f => f.value);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
  const std = Math.sqrt(variance + 1e-8);
  return featureMaps.map(f => ({
    ...f,
    value: relu((f.value - mean) / std), // BN + ReLU
  }));
}

// Flatten feature maps into 1D vector
export function flatten(featureMaps) {
  return featureMaps.map(f => f.value);
}

// Fully connected layer: flat vector → logits
export function fullyConnected(flatInput, outputSize) {
  return Array.from({ length: outputSize }, (_, i) => {
    const weights = flatInput.map(() => (Math.random() - 0.5) * 0.3);
    const bias = (Math.random() - 0.5) * 0.05;
    return flatInput.reduce((sum, v, j) => sum + v * weights[j], 0) + bias;
  });
}

// Dropout simulation (inference mode, no-op for visualization)
export function dropout(features, rate = 0.5) {
  return features.map(f => ({ ...f, value: f.value * (1 - rate * 0.1) }));
}

// Extract pseudo pixel stats from a real image (ImageData)
export function extractPixelFeatures(imageData) {
  const { data, width, height } = imageData;
  const features = [];
  const step = Math.max(1, Math.floor((width * height) / 64));

  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (let i = 0; i < data.length; i += 4 * step) {
    rSum += data[i] / 255;
    gSum += data[i + 1] / 255;
    bSum += data[i + 2] / 255;
    features.push(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
    count++;
  }

  const rMean = rSum / count;
  const gMean = gSum / count;
  const bMean = bSum / count;

  // Compute green dominance (healthy = high green channel)
  const greenDominance = gMean - (rMean + bMean) / 2;

  return {
    features: features.slice(0, 48),
    rMean, gMean, bMean, greenDominance,
    brightness: (rMean + gMean + bMean) / 3,
  };
}

// Full CNN forward pass
export function runCNN(imageData) {
  const { features, rMean, gMean, bMean, greenDominance, brightness } =
    extractPixelFeatures(imageData);

  // Layer 1: Conv block 1
  const conv1 = convLayer(features.slice(0, 16), 8, 'C1');
  const bn1 = batchNorm(conv1);
  const pool1 = maxPool(bn1);

  // Layer 2: Conv block 2
  const conv2 = convLayer(pool1.map(f => f.value), 16, 'C2');
  const bn2 = batchNorm(conv2);
  const pool2 = maxPool(bn2);

  // Layer 3: Conv block 3
  const conv3 = convLayer(pool2.map(f => f.value), 8, 'C3');
  const bn3 = batchNorm(conv3);

  // Flatten + FC layers
  const flat = flatten(bn3);
  const fc1 = fullyConnected(flat, 12).map(v => relu(v));
  const dropped = dropout(fc1.map(v => ({ value: v })), 0.3).map(f => f.value);
  const fc2 = fullyConnected(dropped, 6);
  const probs = softmax(fc2);

  return {
    layers: [conv1, pool1, conv2, pool2, conv3],
    layerNames: ['Conv1 (3×3, 8f)', 'MaxPool1 (2×2)', 'Conv2 (3×3, 16f)', 'MaxPool2 (2×2)', 'Conv3 (3×3, 8f)'],
    probs,
    pixelStats: { rMean, gMean, bMean, greenDominance, brightness },
  };
}
