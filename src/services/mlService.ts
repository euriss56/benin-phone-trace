import * as tf from "@tensorflow/tfjs";

const MODEL_NAME = "imei-risk-model";
const IDB_KEY = `indexeddb://${MODEL_NAME}`;

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
}

export interface TrainingResult {
  accuracy: number;
  loss: number;
  epochs: number;
  samples: number;
  durationMs: number;
}

export interface TrainingData {
  imei: string;
  risk_score: number;
  result: string;
  city?: string;
  brand?: string;
}

// Extract numeric features from raw data
function extractFeatures(data: TrainingData[]): { xs: tf.Tensor2D; ys: tf.Tensor2D } {
  const features: number[][] = [];
  const labels: number[][] = [];

  for (const d of data) {
    const imeiDigits = d.imei.replace(/\D/g, "");
    if (imeiDigits.length < 8) continue;

    // Features: IMEI digit patterns, length, checksum-like features
    const digitSum = imeiDigits.split("").reduce((s, c) => s + parseInt(c), 0);
    const firstDigits = parseInt(imeiDigits.slice(0, 6)) / 1000000;
    const midDigits = parseInt(imeiDigits.slice(6, 10)) / 10000;
    const imeiLength = imeiDigits.length / 20;
    const evenOddRatio =
      imeiDigits.split("").filter((_, i) => i % 2 === 0).reduce((s, c) => s + parseInt(c), 0) /
      (imeiDigits.split("").filter((_, i) => i % 2 !== 0).reduce((s, c) => s + parseInt(c), 0) || 1);
    const normalizedEvenOdd = Math.min(evenOddRatio / 5, 1);

    features.push([
      firstDigits,
      midDigits,
      imeiLength,
      digitSum / 135, // max possible ~135 for 15 digits of 9
      normalizedEvenOdd,
    ]);

    // Label: binary classification (stolen or not)
    const isStolen = d.result === "Volé" || d.risk_score >= 70 ? 1 : 0;
    labels.push([isStolen, 1 - isStolen]);
  }

  return {
    xs: tf.tensor2d(features),
    ys: tf.tensor2d(labels),
  };
}

function createModel(): tf.Sequential {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [5], units: 16, activation: "relu" }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 8, activation: "relu" }));
  model.add(tf.layers.dense({ units: 2, activation: "softmax" }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

export async function trainModel(
  data: TrainingData[],
  epochs: number = 50,
  onProgress?: (p: TrainingProgress) => void
): Promise<TrainingResult> {
  const start = performance.now();

  if (data.length < 5) {
    throw new Error("Pas assez de données pour l'entraînement (minimum 5 échantillons)");
  }

  const { xs, ys } = extractFeatures(data);
  const model = createModel();

  let finalLoss = 0;
  let finalAcc = 0;

  await model.fit(xs, ys, {
    epochs,
    batchSize: Math.min(32, Math.floor(data.length / 2)),
    validationSplit: 0.2,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        finalLoss = logs?.loss ?? 0;
        finalAcc = logs?.acc ?? 0;
        onProgress?.({
          epoch: epoch + 1,
          totalEpochs: epochs,
          loss: finalLoss,
          accuracy: finalAcc,
        });
      },
    },
  });

  // Save model to IndexedDB
  await model.save(IDB_KEY);

  xs.dispose();
  ys.dispose();
  model.dispose();

  return {
    accuracy: finalAcc,
    loss: finalLoss,
    epochs,
    samples: data.length,
    durationMs: performance.now() - start,
  };
}

export async function predictRisk(imei: string): Promise<{ riskScore: number; isStolen: boolean } | null> {
  try {
    const model = await tf.loadLayersModel(IDB_KEY);
    const imeiDigits = imei.replace(/\D/g, "");
    if (imeiDigits.length < 8) return null;

    const digitSum = imeiDigits.split("").reduce((s, c) => s + parseInt(c), 0);
    const firstDigits = parseInt(imeiDigits.slice(0, 6)) / 1000000;
    const midDigits = parseInt(imeiDigits.slice(6, 10)) / 10000;
    const imeiLength = imeiDigits.length / 20;
    const evenOddRatio =
      imeiDigits.split("").filter((_, i) => i % 2 === 0).reduce((s, c) => s + parseInt(c), 0) /
      (imeiDigits.split("").filter((_, i) => i % 2 !== 0).reduce((s, c) => s + parseInt(c), 0) || 1);
    const normalizedEvenOdd = Math.min(evenOddRatio / 5, 1);

    const input = tf.tensor2d([[firstDigits, midDigits, imeiLength, digitSum / 135, normalizedEvenOdd]]);
    const prediction = model.predict(input) as tf.Tensor;
    const values = await prediction.data();

    input.dispose();
    prediction.dispose();
    model.dispose();

    const stolenProb = values[0];
    return {
      riskScore: Math.round(stolenProb * 100),
      isStolen: stolenProb > 0.5,
    };
  } catch {
    return null;
  }
}

export async function hasStoredModel(): Promise<boolean> {
  try {
    const models = await tf.io.listModels();
    return IDB_KEY in models;
  } catch {
    return false;
  }
}

export async function deleteStoredModel(): Promise<void> {
  try {
    await tf.io.removeModel(IDB_KEY);
  } catch {
    // Model may not exist
  }
}
