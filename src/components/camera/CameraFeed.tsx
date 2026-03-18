"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import type { LandmarkFrame } from "@/lib/signs/types";
import HandOverlay from "./HandOverlay";
import CaptureButton from "./CaptureButton";

interface CameraFeedProps {
  onRecordingComplete: (frames: LandmarkFrame[], duration: number) => void;
  onStateChange?: (state: "idle" | "streaming" | "recording") => void;
}

export default function CameraFeed({ onRecordingComplete, onStateChange }: CameraFeedProps) {
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
        if (!cancelled) setError("mediapipe");
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    // Check if camera API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("no-camera");
      return;
    }

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
        onStateChange?.("streaming");
      }
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setError("no-camera");
      } else if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("denied");
      } else {
        setError("generic");
      }
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
    onStateChange?.("recording");
  }, [onStateChange]);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    onStateChange?.("streaming");
    const duration = (performance.now() - recordingStart.current) / 1000;
    onRecordingComplete(recordedFrames.current, duration);
  }, [onRecordingComplete, onStateChange]);

  if (error === "mediapipe") {
    return (
      <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-6 text-center">
        <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">Hand detection unavailable</p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Could not load the hand tracking model. Try a different browser (Chrome or Edge work best).
        </p>
      </div>
    );
  }

  if (error === "no-camera") {
    return (
      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 text-center">
        <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">No camera detected</p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
          You can still watch the reference video and learn the sign. To practice with AI coaching, connect a webcam or try on a device with a camera.
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Tip: This works great on phones — just open this page on your mobile device.
        </p>
      </div>
    );
  }

  if (error === "denied") {
    return (
      <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-6 text-center">
        <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">Camera access blocked</p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Please allow camera permissions in your browser settings and reload the page. You can still watch the reference video in the meantime.
        </p>
      </div>
    );
  }

  if (error === "generic") {
    return (
      <div className="bg-red-50 dark:bg-red-950 rounded-lg p-6 text-center">
        <p className="font-medium text-red-800 dark:text-red-200 mb-2">Camera error</p>
        <p className="text-sm text-red-700 dark:text-red-300">
          Something went wrong starting the camera. Please reload and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isStreaming && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-video flex flex-col items-center justify-center gap-3 p-4">
          <button
            onClick={startCamera}
            disabled={!handLandmarker}
            aria-label={handLandmarker ? "Start camera for sign practice" : "Loading hand detection model"}
            className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {handLandmarker ? "Start Camera" : "Loading hand detection..."}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Your camera stays private — hand tracking runs in your browser
          </p>
        </div>
      )}
      <div className={`relative rounded-lg overflow-hidden bg-black ${!isStreaming ? "hidden" : ""}`}>
        <video
          ref={videoRef}
          className="w-full"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
          aria-label="Camera feed for sign practice"
        />
        <div style={{ transform: "scaleX(-1)" }}>
          <HandOverlay
            landmarks={currentLandmarks}
            width={videoSize.width}
            height={videoSize.height}
          />
        </div>
        {isRecording && (
          <div
            className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
            aria-live="assertive"
            role="status"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true" />
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
