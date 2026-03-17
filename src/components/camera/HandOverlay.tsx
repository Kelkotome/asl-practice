"use client";

import { useEffect, useRef } from "react";

interface HandOverlayProps {
  landmarks: { x: number; y: number; z: number }[][] | null;
  width: number;
  height: number;
}

// MediaPipe hand connections
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // index
  [0, 9], [9, 10], [10, 11], [11, 12],  // middle
  [0, 13], [13, 14], [14, 15], [15, 16], // ring
  [0, 17], [17, 18], [18, 19], [19, 20], // pinky
  [5, 9], [9, 13], [13, 17],             // palm
];

export default function HandOverlay({
  landmarks,
  width,
  height,
}: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    const colors = ["#3b82f6", "#ef4444"]; // blue for first hand, red for second

    landmarks.forEach((hand, handIdx) => {
      const color = colors[handIdx % colors.length];

      // Draw connections
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      for (const [i, j] of CONNECTIONS) {
        const a = hand[i];
        const b = hand[j];
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      }

      // Draw landmarks
      for (const lm of hand) {
        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width, height }}
    />
  );
}
