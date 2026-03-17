"use client";

import { useEffect, useRef } from "react";

interface ReferencePlayerProps {
  videoId: string;
  signName: string;
}

export default function ReferencePlayer({
  videoId,
  signName,
}: ReferencePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import lite-youtube-embed CSS and register custom element
    import("lite-youtube-embed/src/lite-yt-embed.css");
    import("lite-youtube-embed");
  }, []);

  return (
    <div ref={containerRef} className="rounded-lg overflow-hidden">
      <div
        dangerouslySetInnerHTML={{
          __html: `<lite-youtube videoid="${videoId}" playlabel="Watch ${signName} in ASL"></lite-youtube>`,
        }}
      />
    </div>
  );
}
