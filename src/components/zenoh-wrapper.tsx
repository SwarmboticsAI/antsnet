"use client";

import dynamic from "next/dynamic";

// ZenohProvider must be client-side only because it depends on .wasm
const ZenohProvider = dynamic(() => import("@/providers/zenoh-provider"), {
  ssr: false,
});

export function ZenohWrapper({ children }: { children: React.ReactNode }) {
  return <ZenohProvider>{children}</ZenohProvider>;
}
