import React, { useEffect, useState } from "react";
import { Waves } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

interface IframeStreamPlayerProps {
  ipAddress: string;
  title?: string;
  allowFullscreen?: boolean;
  cameraFeedString?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const VideoPlayer: React.FC<IframeStreamPlayerProps> = ({
  ipAddress,
  title = "Video Stream",
  allowFullscreen = true,
  cameraFeedString = "color/low",
  className = "",
  style = {},
}) => {
  const [streamUrl, setStreamUrl] = useState(
    `http://${ipAddress}:8889/${cameraFeedString}`
  );

  useEffect(() => {
    setStreamUrl(`http://${ipAddress}:8889/${cameraFeedString}`);
  }, [ipAddress, cameraFeedString]);

  return (
    <div className={`w-full h-full ${className}`} style={{ ...style }}>
      <Toggle
        className="absolute top-2 right-2 z-10 bg-muted/50 hover:bg-muted"
        pressed={streamUrl.includes("mono")}
        onPressedChange={(pressed) => {
          const newFeed = pressed ? "mono" : "color/low";
          setStreamUrl(`http://${ipAddress}:8889/${newFeed}`);
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
