"use client";

import { useEffect, useRef } from "react";

const COLORS      = ["#B8D4E8", "#8BAFC4", "#6B94A8"];
const PIXEL_SIZE  = 6;
const TRAIL_LENGTH = 20;
const FADE_SPEED  = 0.08;

interface Pixel {
  x: number;
  y: number;
  color: string;
  alpha: number;
}

export default function PixelCursorTrail() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const pixelsRef  = useRef<Pixel[]>([]);
  const rafRef     = useRef<number>(0);
  const lastCell   = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      // Snap to pixel grid so squares align cleanly
      const cx = Math.floor(e.clientX / PIXEL_SIZE) * PIXEL_SIZE;
      const cy = Math.floor(e.clientY / PIXEL_SIZE) * PIXEL_SIZE;

      if (cx === lastCell.current.x && cy === lastCell.current.y) return;
      lastCell.current = { x: cx, y: cy };

      pixelsRef.current.push({
        x:     cx,
        y:     cy,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
      });

      if (pixelsRef.current.length > TRAIL_LENGTH) {
        pixelsRef.current.splice(0, pixelsRef.current.length - TRAIL_LENGTH);
      }
    };
    window.addEventListener("mousemove", onMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const alive: Pixel[] = [];
      for (const p of pixelsRef.current) {
        p.alpha -= FADE_SPEED;
        if (p.alpha <= 0) continue;
        alive.push(p);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        ctx.fillRect(p.x, p.y, PIXEL_SIZE, PIXEL_SIZE);
      }
      pixelsRef.current = alive;
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position:      "fixed",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        9999,
      }}
    />
  );
}
