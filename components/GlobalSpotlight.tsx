"use client";

import { usePathname } from "next/navigation";
import { Component as SpotlightCursor } from "@/components/ui/spotlight-cursor";

export default function GlobalSpotlight() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <SpotlightCursor
      config={{
        radius: isHome ? 250 : 200,
        brightness: isHome ? 0.12 : 0.08,
        color: "#B8D4E8",
      }}
    />
  );
}
