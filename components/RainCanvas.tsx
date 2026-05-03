"use client";

import { useEffect, useRef, useCallback } from "react";

interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number;
  opacity: number;
}

const ANGLE  = 15 * (Math.PI / 180);
const SIN_A  = Math.sin(ANGLE);
const COS_A  = Math.cos(ANGLE);

function sr(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function makeDrops(W: number, H: number): Drop[] {
  return Array.from({ length: 520 }, (_, i) => ({
    x:       sr(i * 3.7) * (W + 300) - 150,
    y:       sr(i * 7.3) * H,
    len:     12 + sr(i * 11.1) * 16,
    speed:   5  + sr(i * 17.3) * 6,
    opacity: 0.04 + sr(i * 23.1) * 0.12,
  }));
}

function step(ctx: CanvasRenderingContext2D, drops: Drop[], W: number, H: number) {
  ctx.save();
  ctx.lineWidth = 0.85;

  for (const d of drops) {
    d.x += d.speed * SIN_A;
    d.y += d.speed * COS_A;

    if (d.y > H + d.len) {
      d.y  = -d.len - Math.random() * 120;
      d.x  = Math.random() * (W + 300) - 150;
    }

    ctx.strokeStyle = `rgba(200,220,240,${d.opacity})`;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - d.len * SIN_A, d.y - d.len * COS_A);
    ctx.stroke();
  }

  ctx.restore();
}

export default function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef  = useRef<Drop[]>([]);
  const rafRef    = useRef<number>(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    step(ctx, dropsRef.current, canvas.width, canvas.height);
    rafRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      dropsRef.current = makeDrops(canvas.width, canvas.height);
    };

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      init();
      rafRef.current = requestAnimationFrame(render);
    };

    window.addEventListener("resize", onResize);
    init();
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}
