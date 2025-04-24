"use client";

import React, { useEffect, useState } from "react";
import { Waves } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

interface IframeStreamPlayerProps {
  ipAddress: string;
  title?: string;
  allowFullscreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const IframeStreamPlayer: React.FC<IframeStreamPlayerProps> = ({
  ipAddress,
  title = "Video Stream",
  allowFullscreen = true,
  className = "",
  style = {},
}) => {
  const [isIrFeed, setIsIrFeed] = useState(false);
  const [streamUrl, setStreamUrl] = useState(
    `http://${ipAddress}:8889/color/low/`
  );

  useEffect(() => {
    if (isIrFeed) {
      setStreamUrl(`http://${ipAddress}:8889/mono`);
    } else {
      setStreamUrl(`http://${ipAddress}:8889/color/low/`);
    }
  }, [isIrFeed, ipAddress]);

  return (
    <div className={`w-full h-full ${className}`} style={{ ...style }}>
      <Toggle
        className="absolute top-2 right-2 z-10 bg-muted/50 hover:bg-muted"
        pressed={isIrFeed}
        onPressedChange={(pressed) => {
          setIsIrFeed(pressed);
        }}
      >
        <Waves className="text-primary" />
      </Toggle>
      <iframe
        src={streamUrl}
        title={title}
        className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-full pointer-events-none"
        frameBorder={0}
        allowFullScreen={allowFullscreen}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default IframeStreamPlayer;
