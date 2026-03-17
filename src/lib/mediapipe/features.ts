import type { LandmarkFrame, Landmark } from "../signs/types";
import { getLandmark, distance2D } from "./landmarks";

export interface DetectedFeatures {
  handsDetected: number;
  dominantHand: {
    avgScore: number;
    estimatedRegion: string | null;
    fingersExtended: string[];
  } | null;
  movement: {
    type: string;
    magnitude: number;
  } | null;
  duration: number;
  frameCount: number;
}

const FINGER_TIPS = ["INDEX_TIP", "MIDDLE_TIP", "RING_TIP", "PINKY_TIP"] as const;
const FINGER_MCPS = ["INDEX_MCP", "MIDDLE_MCP", "RING_MCP", "PINKY_MCP"] as const;
const FINGER_NAMES = ["index", "middle", "ring", "pinky"] as const;

/** Extract high-level features from recorded landmark frames */
export function extractFeatures(
  frames: LandmarkFrame[],
  duration: number
): DetectedFeatures {
  if (frames.length === 0) {
    return {
      handsDetected: 0,
      dominantHand: null,
      movement: null,
      duration,
      frameCount: 0,
    };
  }

  // Count hands across frames
  const handCounts = frames.map((f) => f.hands.length);
  const maxHands = Math.max(...handCounts);
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
  const dominantScore = Math.max(avgRight, avgLeft);

  // Analyze dominant hand features from middle frame
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
      fingersExtended: detectExtendedFingers(lm),
    };
  }

  // Analyze movement from wrist trajectory
  const movement = analyzeMovement(frames, dominantHandedness);

  return {
    handsDetected: Math.round(avgHands),
    dominantHand,
    movement,
    duration,
    frameCount: frames.length,
  };
}

/** Estimate hand region relative to body (face area) */
function estimateRegion(landmarks: Landmark[]): string {
  const wrist = getLandmark(landmarks, "WRIST");
  // MediaPipe coordinates: 0,0 is top-left, 1,1 is bottom-right
  // Thresholds tuned for typical webcam framing (head+torso visible).
  if (wrist.y < 0.2) return "above head";
  if (wrist.y < 0.45) return "face/head";
  if (wrist.y < 0.65) return "chest";
  if (wrist.y < 0.85) return "waist";
  return "below frame";
}

/** Detect which fingers are extended */
function detectExtendedFingers(landmarks: Landmark[]): string[] {
  const extended: string[] = [];

  // Check thumb (compare tip-to-CMC distance vs IP-to-CMC)
  const thumbTip = getLandmark(landmarks, "THUMB_TIP");
  const thumbCmc = getLandmark(landmarks, "THUMB_CMC");
  const thumbIp = getLandmark(landmarks, "THUMB_IP");
  if (distance2D(thumbTip, thumbCmc) > distance2D(thumbIp, thumbCmc) * 1.2) {
    extended.push("thumb");
  }

  // Check other fingers (tip should be further from wrist than MCP when extended)
  const wrist = getLandmark(landmarks, "WRIST");
  for (let i = 0; i < 4; i++) {
    const tip = getLandmark(landmarks, FINGER_TIPS[i]);
    const mcp = getLandmark(landmarks, FINGER_MCPS[i]);
    if (distance2D(tip, wrist) > distance2D(mcp, wrist) * 1.1) {
      extended.push(FINGER_NAMES[i]);
    }
  }

  return extended;
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
  const totalDisplacement = Math.sqrt(
    (wristPositions[wristPositions.length - 1].x - wristPositions[0].x) ** 2 +
      (wristPositions[wristPositions.length - 1].y - wristPositions[0].y) ** 2
  );

  // Total path length
  let pathLength = 0;
  for (let i = 1; i < wristPositions.length; i++) {
    pathLength += Math.sqrt(
      (wristPositions[i].x - wristPositions[i - 1].x) ** 2 +
        (wristPositions[i].y - wristPositions[i - 1].y) ** 2
    );
  }

  // Classify movement
  const straightness = totalDisplacement / (pathLength || 1);

  let type: string;
  if (pathLength < 0.02) {
    type = "minimal/stationary";
  } else if (straightness > 0.7) {
    type = "straight/linear";
  } else if (straightness < 0.3) {
    // Check for oscillation (repeated movement)
    const xValues = wristPositions.map((p) => p.x);
    const directionChanges = countDirectionChanges(xValues);
    if (directionChanges >= 3) {
      type = "oscillating/repeated";
    } else {
      type = "circular/arc";
    }
  } else {
    type = "curved";
  }

  return { type, magnitude: pathLength };
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
