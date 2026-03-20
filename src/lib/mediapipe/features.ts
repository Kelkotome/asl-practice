import type { LandmarkFrame, Landmark } from "../signs/types";
import { getLandmark, distance2D, distance, LANDMARK_NAMES } from "./landmarks";
import type { LandmarkName } from "./landmarks";

export interface FingerState {
  extended: boolean;
  curl: "straight" | "slightly bent" | "bent" | "fully curled";
  angle: number; // MCP-PIP-DIP angle in degrees
}

export interface DetectedFeatures {
  handsDetected: number;
  dominantHand: {
    avgScore: number;
    estimatedRegion: string | null;
    fingers: Record<string, FingerState>;
    fingersExtended: string[];
    fingerSpread: "spread apart" | "together" | "mixed";
    palmOrientation: string;
  } | null;
  nonDominantHand: {
    avgScore: number;
    fingers: Record<string, FingerState>;
    fingersExtended: string[];
    palmOrientation: string;
  } | null;
  movement: {
    type: string;
    magnitude: number;
    direction: string | null;
    speed: string;
  } | null;
  duration: number;
  frameCount: number;
}

const FINGER_TIPS = ["INDEX_TIP", "MIDDLE_TIP", "RING_TIP", "PINKY_TIP"] as const;
const FINGER_PIPS = ["INDEX_PIP", "MIDDLE_PIP", "RING_PIP", "PINKY_PIP"] as const;
const FINGER_DIPS = ["INDEX_DIP", "MIDDLE_DIP", "RING_DIP", "PINKY_DIP"] as const;
const FINGER_MCPS = ["INDEX_MCP", "MIDDLE_MCP", "RING_MCP", "PINKY_MCP"] as const;
const FINGER_NAMES = ["index", "middle", "ring", "pinky"] as const;

/** Calculate angle at joint B given three points A-B-C (in degrees) */
function jointAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2);
  if (magBA === 0 || magBC === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/** Classify curl from PIP joint angle */
function classifyCurl(angle: number): FingerState["curl"] {
  if (angle > 155) return "straight";
  if (angle > 120) return "slightly bent";
  if (angle > 80) return "bent";
  return "fully curled";
}

/** Analyze a single finger across multiple frames */
function analyzeFingerMultiFrame(
  frames: LandmarkFrame[],
  handedness: string,
  fingerIndex: number
): FingerState {
  const angles: number[] = [];
  const extensions: boolean[] = [];

  for (const frame of frames) {
    const hand = frame.hands.find((h) => h.handedness === handedness);
    if (!hand || hand.landmarks.length !== 21) continue;
    const lm = hand.landmarks;

    const mcp = getLandmark(lm, FINGER_MCPS[fingerIndex] as LandmarkName);
    const pip = getLandmark(lm, FINGER_PIPS[fingerIndex] as LandmarkName);
    const dip = getLandmark(lm, FINGER_DIPS[fingerIndex] as LandmarkName);
    const tip = getLandmark(lm, FINGER_TIPS[fingerIndex] as LandmarkName);
    const wrist = getLandmark(lm, "WRIST");

    // PIP angle (MCP-PIP-DIP)
    const angle = jointAngle(mcp, pip, dip);
    angles.push(angle);

    // Extension check
    extensions.push(distance2D(tip, wrist) > distance2D(mcp, wrist) * 1.1);
  }

  if (angles.length === 0) {
    return { extended: false, curl: "fully curled", angle: 0 };
  }

  const avgAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
  const extCount = extensions.filter(Boolean).length;

  return {
    extended: extCount > extensions.length * 0.5,
    curl: classifyCurl(avgAngle),
    angle: Math.round(avgAngle),
  };
}

/** Analyze thumb across multiple frames */
function analyzeThumbMultiFrame(
  frames: LandmarkFrame[],
  handedness: string
): FingerState {
  const extensions: boolean[] = [];
  const angles: number[] = [];

  for (const frame of frames) {
    const hand = frame.hands.find((h) => h.handedness === handedness);
    if (!hand || hand.landmarks.length !== 21) continue;
    const lm = hand.landmarks;

    const tip = getLandmark(lm, "THUMB_TIP");
    const cmc = getLandmark(lm, "THUMB_CMC");
    const ip = getLandmark(lm, "THUMB_IP");
    const mcp = getLandmark(lm, "THUMB_MCP");

    extensions.push(distance2D(tip, cmc) > distance2D(ip, cmc) * 1.2);
    angles.push(jointAngle(cmc, mcp, ip));
  }

  if (angles.length === 0) {
    return { extended: false, curl: "fully curled", angle: 0 };
  }

  const avgAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
  const extCount = extensions.filter(Boolean).length;

  return {
    extended: extCount > extensions.length * 0.5,
    curl: classifyCurl(avgAngle),
    angle: Math.round(avgAngle),
  };
}

/** Detect palm orientation from the palm normal vector */
function detectPalmOrientation(landmarks: Landmark[]): string {
  const wrist = getLandmark(landmarks, "WRIST");
  const indexMcp = getLandmark(landmarks, "INDEX_MCP");
  const pinkyMcp = getLandmark(landmarks, "PINKY_MCP");
  const middleMcp = getLandmark(landmarks, "MIDDLE_MCP");

  // Two vectors on the palm plane
  const v1 = {
    x: indexMcp.x - wrist.x,
    y: indexMcp.y - wrist.y,
    z: indexMcp.z - wrist.z,
  };
  const v2 = {
    x: pinkyMcp.x - wrist.x,
    y: pinkyMcp.y - wrist.y,
    z: pinkyMcp.z - wrist.z,
  };

  // Cross product = palm normal
  const normal = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };

  // Determine primary orientation from the normal
  const absX = Math.abs(normal.x);
  const absY = Math.abs(normal.y);
  const absZ = Math.abs(normal.z);

  // Also check finger direction (wrist to middle finger MCP)
  const fingerDir = {
    x: middleMcp.x - wrist.x,
    y: middleMcp.y - wrist.y,
  };

  if (absZ > absX && absZ > absY) {
    return normal.z > 0 ? "facing camera" : "facing away";
  } else if (absX > absY) {
    return normal.x > 0 ? "facing right" : "facing left";
  } else {
    return normal.y > 0 ? "facing down" : "facing up";
  }
}

/** Detect finger spread by measuring distances between adjacent fingertips */
function detectFingerSpread(landmarks: Landmark[]): "spread apart" | "together" | "mixed" {
  const tips = FINGER_TIPS.map((name) => getLandmark(landmarks, name as LandmarkName));
  const mcps = FINGER_MCPS.map((name) => getLandmark(landmarks, name as LandmarkName));

  // Measure tip-to-tip distances relative to hand size
  const handScale = distance2D(getLandmark(landmarks, "WRIST"), getLandmark(landmarks, "MIDDLE_MCP"));
  if (handScale === 0) return "mixed";

  const gaps: number[] = [];
  for (let i = 0; i < tips.length - 1; i++) {
    gaps.push(distance2D(tips[i], tips[i + 1]) / handScale);
  }

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

  if (avgGap > 0.5) return "spread apart";
  if (avgGap < 0.25) return "together";
  return "mixed";
}

/** Extract high-level features from recorded landmark frames */
export function extractFeatures(
  frames: LandmarkFrame[],
  duration: number
): DetectedFeatures {
  if (frames.length === 0) {
    return {
      handsDetected: 0,
      dominantHand: null,
      nonDominantHand: null,
      movement: null,
      duration,
      frameCount: 0,
    };
  }

  // Count hands across frames
  const handCounts = frames.map((f) => f.hands.length);
  const avgHands = handCounts.reduce((a, b) => a + b, 0) / handCounts.length;

  // Find dominant hand (highest avg confidence across frames)
  const rightScores: number[] = [];
  const leftScores: number[] = [];
  for (const frame of frames) {
    for (const hand of frame.hands) {
      if (hand.handedness === "Right") rightScores.push(hand.score);
      else leftScores.push(hand.score);
    }
  }

  const avgRight =
    rightScores.length > 0
      ? rightScores.reduce((a, b) => a + b, 0) / rightScores.length
      : 0;
  const avgLeft =
    leftScores.length > 0
      ? leftScores.reduce((a, b) => a + b, 0) / leftScores.length
      : 0;

  const dominantHandedness = avgRight >= avgLeft ? "Right" : "Left";
  const nonDominantHandedness = dominantHandedness === "Right" ? "Left" : "Right";
  const dominantScore = Math.max(avgRight, avgLeft);
  const nonDominantScore = Math.min(avgRight, avgLeft);

  // Multi-frame finger analysis for dominant hand
  const thumbState = analyzeThumbMultiFrame(frames, dominantHandedness);
  const fingerStates: Record<string, FingerState> = { thumb: thumbState };
  for (let i = 0; i < 4; i++) {
    fingerStates[FINGER_NAMES[i]] = analyzeFingerMultiFrame(frames, dominantHandedness, i);
  }

  const fingersExtended = Object.entries(fingerStates)
    .filter(([, s]) => s.extended)
    .map(([name]) => name);

  // Get palm orientation and finger spread from middle frame
  const midFrame = frames[Math.floor(frames.length / 2)];
  const dominantHandData = midFrame.hands.find(
    (h) => h.handedness === dominantHandedness
  );

  let dominantHand: DetectedFeatures["dominantHand"] = null;
  if (dominantHandData && dominantHandData.landmarks.length === 21) {
    const lm = dominantHandData.landmarks;
    dominantHand = {
      avgScore: dominantScore,
      estimatedRegion: estimateRegion(lm),
      fingers: fingerStates,
      fingersExtended,
      fingerSpread: detectFingerSpread(lm),
      palmOrientation: detectPalmOrientation(lm),
    };
  }

  // Non-dominant hand analysis
  let nonDominantHand: DetectedFeatures["nonDominantHand"] = null;
  if (nonDominantScore > 0.3) {
    const ndThumb = analyzeThumbMultiFrame(frames, nonDominantHandedness);
    const ndFingers: Record<string, FingerState> = { thumb: ndThumb };
    for (let i = 0; i < 4; i++) {
      ndFingers[FINGER_NAMES[i]] = analyzeFingerMultiFrame(frames, nonDominantHandedness, i);
    }

    const ndMidHand = midFrame.hands.find(
      (h) => h.handedness === nonDominantHandedness
    );

    nonDominantHand = {
      avgScore: nonDominantScore,
      fingers: ndFingers,
      fingersExtended: Object.entries(ndFingers)
        .filter(([, s]) => s.extended)
        .map(([name]) => name),
      palmOrientation: ndMidHand && ndMidHand.landmarks.length === 21
        ? detectPalmOrientation(ndMidHand.landmarks)
        : "unknown",
    };
  }

  // Analyze movement from wrist trajectory
  const movement = analyzeMovement(frames, dominantHandedness);

  return {
    handsDetected: Math.round(avgHands),
    dominantHand,
    nonDominantHand,
    movement,
    duration,
    frameCount: frames.length,
  };
}

/** Estimate hand region relative to body (face area) */
function estimateRegion(landmarks: Landmark[]): string {
  const wrist = getLandmark(landmarks, "WRIST");
  if (wrist.y < 0.2) return "above head";
  if (wrist.y < 0.45) return "face/head";
  if (wrist.y < 0.65) return "chest";
  if (wrist.y < 0.85) return "waist";
  return "below frame";
}

/** Analyze wrist movement trajectory across frames */
function analyzeMovement(
  frames: LandmarkFrame[],
  handedness: string
): DetectedFeatures["movement"] {
  const wristPositions: { x: number; y: number; t: number }[] = [];

  for (const frame of frames) {
    const hand = frame.hands.find((h) => h.handedness === handedness);
    if (hand && hand.landmarks.length === 21) {
      wristPositions.push({
        x: hand.landmarks[0].x,
        y: hand.landmarks[0].y,
        t: frame.timestamp,
      });
    }
  }

  if (wristPositions.length < 3) return null;

  // Total displacement
  const dx = wristPositions[wristPositions.length - 1].x - wristPositions[0].x;
  const dy = wristPositions[wristPositions.length - 1].y - wristPositions[0].y;
  const totalDisplacement = Math.sqrt(dx ** 2 + dy ** 2);

  // Total path length
  let pathLength = 0;
  for (let i = 1; i < wristPositions.length; i++) {
    pathLength += Math.sqrt(
      (wristPositions[i].x - wristPositions[i - 1].x) ** 2 +
        (wristPositions[i].y - wristPositions[i - 1].y) ** 2
    );
  }

  // Movement direction (from net displacement)
  let direction: string | null = null;
  if (totalDisplacement > 0.03) {
    const angle = (Math.atan2(-dy, dx) * 180) / Math.PI; // negative dy because y is inverted
    if (angle > -22.5 && angle <= 22.5) direction = "right";
    else if (angle > 22.5 && angle <= 67.5) direction = "up-right";
    else if (angle > 67.5 && angle <= 112.5) direction = "up";
    else if (angle > 112.5 && angle <= 157.5) direction = "up-left";
    else if (angle > 157.5 || angle <= -157.5) direction = "left";
    else if (angle > -157.5 && angle <= -112.5) direction = "down-left";
    else if (angle > -112.5 && angle <= -67.5) direction = "down";
    else direction = "down-right";
  }

  // Speed classification
  const durationSec = (wristPositions[wristPositions.length - 1].t - wristPositions[0].t) / 1000;
  const speed = durationSec > 0 ? pathLength / durationSec : 0;
  let speedLabel: string;
  if (speed < 0.05) speedLabel = "very slow/still";
  else if (speed < 0.15) speedLabel = "slow";
  else if (speed < 0.4) speedLabel = "moderate";
  else speedLabel = "fast";

  // Classify movement type
  const straightness = totalDisplacement / (pathLength || 1);

  let type: string;
  if (pathLength < 0.02) {
    type = "minimal/stationary";
  } else if (straightness > 0.7) {
    type = "straight/linear";
  } else if (straightness < 0.3) {
    const xValues = wristPositions.map((p) => p.x);
    const yValues = wristPositions.map((p) => p.y);
    const xChanges = countDirectionChanges(xValues);
    const yChanges = countDirectionChanges(yValues);
    if (xChanges >= 3 || yChanges >= 3) {
      type = "oscillating/repeated";
    } else {
      type = "circular/arc";
    }
  } else {
    type = "curved";
  }

  return { type, magnitude: pathLength, direction, speed: speedLabel };
}

function countDirectionChanges(values: number[]): number {
  let changes = 0;
  for (let i = 2; i < values.length; i++) {
    const prevDir = Math.sign(values[i - 1] - values[i - 2]);
    const currDir = Math.sign(values[i] - values[i - 1]);
    if (prevDir !== 0 && currDir !== 0 && prevDir !== currDir) {
      changes++;
    }
  }
  return changes;
}
