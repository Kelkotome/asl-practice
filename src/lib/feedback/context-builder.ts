import type { SignDetail, LandmarkFrame } from "../signs/types";
import { extractFeatures, type DetectedFeatures, type FingerState } from "../mediapipe/features";

/**
 * Build deterministic context string from sign data + detected features.
 */
export function buildContext(
  sign: SignDetail,
  landmarks: LandmarkFrame[],
  duration: number
): string {
  const sections: string[] = [];

  // --- Sign reference data ---
  const ref: string[] = ["SIGN REFERENCE DATA (ASL-LEX 2.0):"];
  ref.push(`Sign: ${sign.name.toUpperCase()}`);

  if (sign.lexicalClass) ref.push(`Lexical Class: ${sign.lexicalClass}`);
  if (sign.signType) ref.push(`Sign Type: ${sign.signType}`);

  if (sign.handshape) {
    let handshapeLine = `Handshape: ${sign.handshape}`;
    if (sign.selectedFingers) handshapeLine += ` (${sign.selectedFingers})`;
    if (sign.flexion) handshapeLine += `, ${sign.flexion} flexion`;
    ref.push(handshapeLine);
  }

  if (sign.movement) {
    let moveLine = `Movement: ${sign.movement}`;
    if (sign.repeatedMovement === "TRUE" || sign.repeatedMovement === "Yes")
      moveLine += " (repeated)";
    ref.push(moveLine);
  }

  if (sign.majorLocation) {
    let locLine = `Location: ${sign.majorLocation}`;
    if (sign.minorLocation) locLine += ` (${sign.minorLocation})`;
    if (sign.secondMinorLocation)
      locLine += ` → ${sign.secondMinorLocation}`;
    ref.push(locLine);
  }

  if (sign.contact) ref.push(`Contact: ${sign.contact}`);

  if (sign.nonDominantHandshape)
    ref.push(`Non-dominant hand: ${sign.nonDominantHandshape}`);

  if (sign.iconicity !== null) {
    let iconLine = `Iconicity: ${sign.iconicityLabel || "Unknown"} (${sign.iconicity}/7)`;
    if (sign.iconicityType) iconLine += ` — ${sign.iconicityType}`;
    ref.push(iconLine);
  }

  if (sign.frequency !== null)
    ref.push(
      `Frequency: ${sign.frequencyLabel || "Unknown"} (${sign.frequency}/7)`
    );

  if (sign.isCompound)
    ref.push(`Compound sign (${sign.numMorphemes || "?"} morphemes)`);

  if (sign.ageOfAcquisition !== null)
    ref.push(`Typically learned around ${sign.ageOfAcquisition} months`);

  sections.push(ref.join("\n"));

  // --- Detected features from user's attempt ---
  const features = extractFeatures(landmarks, duration);
  sections.push(formatDetectedFeatures(features));

  // --- Blog link ---
  if (sign.blogUrl)
    sections.push(`Blog tutorial: ${sign.blogUrl}`);

  return sections.join("\n\n");
}

function formatFingerState(name: string, state: FingerState): string {
  return `  ${name}: ${state.extended ? "extended" : "not extended"}, ${state.curl} (${state.angle}°)`;
}

function formatDetectedFeatures(f: DetectedFeatures): string {
  const lines: string[] = [
    "USER'S ATTEMPT (from MediaPipe landmarks):",
    "IMPORTANT: This data is from a webcam using MediaPipe — it is APPROXIMATE and often inaccurate. Camera angle, distance, lighting, and hand orientation all cause detection errors. Finger curl angles can be off by 30-40°. Palm orientation is especially unreliable. Give the learner the benefit of the doubt — if it roughly matches, assume they did it right. Hand region is relative to camera frame, NOT body position.",
  ];

  lines.push(`- Hands detected: ${f.handsDetected}`);

  if (f.dominantHand) {
    lines.push(`\nDominant hand:`);
    lines.push(`- Confidence: ${f.dominantHand.avgScore.toFixed(2)}`);
    if (f.dominantHand.estimatedRegion)
      lines.push(`- Region (frame-relative, unreliable): ${f.dominantHand.estimatedRegion}`);
    lines.push(`- Palm orientation: ${f.dominantHand.palmOrientation}`);
    lines.push(`- Fingers extended: ${f.dominantHand.fingersExtended.length > 0 ? f.dominantHand.fingersExtended.join(", ") : "none"}`);
    lines.push(`- Finger spread: ${f.dominantHand.fingerSpread}`);

    lines.push(`- Finger details:`);
    for (const [name, state] of Object.entries(f.dominantHand.fingers)) {
      lines.push(formatFingerState(name, state));
    }
  }

  if (f.nonDominantHand) {
    lines.push(`\nNon-dominant hand:`);
    lines.push(`- Confidence: ${f.nonDominantHand.avgScore.toFixed(2)}`);
    lines.push(`- Palm orientation: ${f.nonDominantHand.palmOrientation}`);
    lines.push(`- Fingers extended: ${f.nonDominantHand.fingersExtended.length > 0 ? f.nonDominantHand.fingersExtended.join(", ") : "none"}`);

    lines.push(`- Finger details:`);
    for (const [name, state] of Object.entries(f.nonDominantHand.fingers)) {
      lines.push(formatFingerState(name, state));
    }
  }

  if (f.movement) {
    lines.push(`\nMovement:`);
    lines.push(`- Type: ${f.movement.type}`);
    lines.push(`- Magnitude: ${f.movement.magnitude.toFixed(3)}`);
    lines.push(`- Speed: ${f.movement.speed}`);
    if (f.movement.direction)
      lines.push(`- Direction: ${f.movement.direction}`);
  }

  lines.push(`\n- Duration: ${f.duration.toFixed(1)}s`);
  lines.push(`- Frames captured: ${f.frameCount}`);

  return lines.join("\n");
}
