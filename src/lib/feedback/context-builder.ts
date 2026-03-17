import type { SignDetail, LandmarkFrame } from "../signs/types";
import { extractFeatures, type DetectedFeatures } from "../mediapipe/features";

/**
 * Build deterministic context string from sign data + detected features.
 * Ported from lex_enrichment.py:80-122 (build_lex_context_for_prompt).
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

function formatDetectedFeatures(f: DetectedFeatures): string {
  const lines: string[] = [
    "USER'S ATTEMPT (from MediaPipe landmarks):",
    "NOTE: Hand region is estimated relative to the camera frame, NOT the body. Camera framing varies widely — do NOT critique hand location/region unless it clearly contradicts the reference. Focus feedback on handshape, movement, and fingers instead.",
  ];

  lines.push(`- Hands detected: ${f.handsDetected}`);

  if (f.dominantHand) {
    lines.push(
      `- Dominant hand confidence: ${f.dominantHand.avgScore.toFixed(2)}`
    );
    if (f.dominantHand.estimatedRegion)
      lines.push(`- Hand region (frame-relative, unreliable): ${f.dominantHand.estimatedRegion}`);
    if (f.dominantHand.fingersExtended)
      lines.push(
        `- Fingers extended: ${f.dominantHand.fingersExtended.join(", ")}`
      );
  }

  if (f.movement) {
    lines.push(`- Movement type: ${f.movement.type}`);
    lines.push(`- Movement magnitude: ${f.movement.magnitude.toFixed(3)}`);
  }

  lines.push(`- Duration: ${f.duration.toFixed(1)}s`);
  lines.push(`- Frames captured: ${f.frameCount}`);

  return lines.join("\n");
}
