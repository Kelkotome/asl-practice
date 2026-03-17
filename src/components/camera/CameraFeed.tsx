"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import type { LandmarkFrame } from "@/lib/signs/types";
import HandOverlay from "./HandOverlay";
import CaptureButton from "./CaptureButton";

interface CameraFeedProps {
  onRecordingComplete: (frames: LandmarkFrame[], duration: number) => void;
}

export default function CameraFeed({ onRecordingComplete }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<
    { x: number; y: number; z: number }[][] | null
  >(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 });

  const recordedFrames = useRef<LandmarkFrame[]>([]);
  const recordingStart = useRef<number>(0);
  const lastSampleTime = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  // Initialize MediaPipe
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { getHandLandmarker } = await import("@/lib/mediapipe/setup");
        const detector = await getHandLandmarker();
        if (!cancelled) setHandLandmarker(detector);
      } catch (err) {
        console.error("MediaPipe init failed:", err);
        if (!cancelled) setError("Failed to load hand detection model. Please try a different browser.");
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setVideoSize({
          width: videoRef.current.videoWidth || 640,
          height: videoRef.current.videoHeight || 480,
        });
        setIsStreaming(true);
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  // Detection loop
  useEffect(() => {
    if (!isStreaming || !handLandmarker || !videoRef.current) return;

    let running = true;

    function detect() {
      if (!running || !videoRef.current || !handLandmarker) return;

      const now = performance.now();
      const result = handLandmarker.detectForVideo(videoRef.current, now);

      // Update overlay
      if (result.landmarks && result.landmarks.length > 0) {
        setCurrentLandmarks(result.landmarks);
      } else {
        setCurrentLandmarks(null);
      }

      // Sample during recording (every 200ms = ~5fps)
      if (isRecording && now - lastSampleTime.current >= 200) {
        lastSampleTime.current = now;
        if (result.landmarks && result.landmarks.length > 0) {
          const frame: LandmarkFrame = {
            timestamp: now - recordingStart.current,
            hands: result.landmarks.map((lm, i) => ({
              landmarks: lm.map((p) => ({ x: p.x, y: p.y, z: p.z })),
              handedness: result.handedness?.[i]?.[0]?.categoryName || "Unknown",
              score: result.handedness?.[i]?.[0]?.score || 0,
            })),
          };
          recordedFrames.current.push(frame);
        }
      }

      animFrameRef.current = requestAnimationFrame(detect);
    }

    detect();
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isStreaming, handLandmarker, isRecording]);

  const handleStartRecording = useCallback(() => {
    recordedFrames.current = [];
    recordingStart.current = performance.now();
    lastSampleTime.current = 0;
    setIsRecording(true);
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    const duration = (performance.now() - recordingStart.current) / 1000;
    onRecordingComplete(recordedFrames.current, duration);
  }, [onRecordingComplete]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950 rounded-lg p-6 text-center">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isStreaming && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
          <button
            onClick={startCamera}
            disabled={!handLandmarker}
            className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {handLandmarker ? "Start Camera" : "Loading hand detection..."}
          </button>
        </div>
      )}
      <div className={`relative rounded-lg overflow-hidden bg-black ${!isStreaming ? "hidden" : ""}`}>
        <video
          ref={videoRef}
          className="w-full"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
        />
        <div style={{ transform: "scaleX(-1)" }}>
          <HandOverlay
            landmarks={currentLandmarks}
            width={videoSize.width}
            height={videoSize.height}
          />
        </div>
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Recording
          </div>
        )}
      </div>

      {isStreaming && (
        <CaptureButton
          isRecording={isRecording}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
        />
      )}
    </div>
  );
}
