"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function GrainOverlay() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (pathname === "/resume") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 256;
    canvas.width = SIZE;
    canvas.height = SIZE;

    let frameId: ReturnType<typeof setTimeout>;

    const paint = () => {
      const img = ctx.createImageData(SIZE, SIZE);
      const data = img.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      frameId = setTimeout(paint, 80);
    };

    paint();
    return () => clearTimeout(frameId);
  }, [pathname]);

  if (pathname === "/resume") return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="grain-overlay"
      style={{ mixBlendMode: "overlay" }}
    />
  );
}
