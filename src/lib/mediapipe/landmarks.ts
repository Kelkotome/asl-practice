import type { Landmark } from "../signs/types";

/** MediaPipe hand landmark indices */
export const LANDMARK_NAMES = [
  "WRIST",
  "THUMB_CMC",
  "THUMB_MCP",
  "THUMB_IP",
  "THUMB_TIP",
  "INDEX_MCP",
  "INDEX_PIP",
  "INDEX_DIP",
  "INDEX_TIP",
  "MIDDLE_MCP",
  "MIDDLE_PIP",
  "MIDDLE_DIP",
  "MIDDLE_TIP",
  "RING_MCP",
  "RING_PIP",
  "RING_DIP",
  "RING_TIP",
  "PINKY_MCP",
  "PINKY_PIP",
  "PINKY_DIP",
  "PINKY_TIP",
] as const;

export type LandmarkName = (typeof LANDMARK_NAMES)[number];

/** Get a specific landmark by name */
export function getLandmark(
  landmarks: Landmark[],
  name: LandmarkName
): Landmark {
  return landmarks[LANDMARK_NAMES.indexOf(name)];
}

/** Euclidean distance between two landmarks */
export function distance(a: Landmark, b: Landmark): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
  );
}

/** 2D distance (ignore Z which is noisy from single camera) */
export function distance2D(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Normalize landmarks relative to wrist (0,0) and hand scale */
export function normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const scale = distance(wrist, middleMcp) || 1;

  return landmarks.map((l) => ({
    x: (l.x - wrist.x) / scale,
    y: (l.y - wrist.y) / scale,
    z: (l.z - wrist.z) / scale,
  }));
}
