"use client";

import { useEffect, useRef } from "react";

// Points stored oldest-first: index 0 = tail, index N-1 = tip (cursor)
const TRAIL_MAX = 48;
const TRAIL_DURATION = 700; // ms
const TAIL_HALF = 24; // half-width in px at the tail
const TIP_HALF = 1.5; // half-width in px at the cursor tip
const HUE_STEP = 0.8; // degrees per animation frame

interface Pt {
  x: number;
  y: number;
  hue: number;
  ts: number; // timestamp ms
}

// Smooth perpendicular at index i — uses central difference so joints miter cleanly
function perp(pts: Pt[], i: number): [number, number] {
  const n = pts.length;
  let dx: number, dy: number;
  if (n < 2) return [0, 1];
  if (i === 0) {
    dx = pts[1].x - pts[0].x;
    dy = pts[1].y - pts[0].y;
  } else if (i === n - 1) {
    dx = pts[n - 1].x - pts[n - 2].x;
    dy = pts[n - 1].y - pts[n - 2].y;
  } else {
    dx = pts[i + 1].x - pts[i - 1].x;
    dy = pts[i + 1].y - pts[i - 1].y;
  }
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [-dy / len, dx / len]; // rotate 90°
}

export default function RGBLiquidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptsRef = useRef<Pt[]>([]);
  const hueRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      ptsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        hue: hueRef.current,
        ts: performance.now(),
      });
      if (ptsRef.current.length > TRAIL_MAX) ptsRef.current.shift();
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      // Advance hue every frame — 0.8°/frame ≈ full cycle in ~7.5s at 60fps
      hueRef.current = (hueRef.current + HUE_STEP) % 360;

      const now = performance.now();

      // Prune expired tail points
      ptsRef.current = ptsRef.current.filter(
        (p) => now - p.ts < TRAIL_DURATION,
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pts = ptsRef.current;

      if (pts.length >= 2) {
        const N = pts.length;

        // ── Build left / right outline arrays ─────────────────────────────
        // Each point gets a perpendicular offset based on its position in the trail.
        // t=0 (oldest/tail) → TAIL_HALF wide; t=1 (newest/tip) → TIP_HALF wide.
        const L: { x: number; y: number }[] = [];
        const R: { x: number; y: number }[] = [];

        for (let i = 0; i < N; i++) {
          const t = i / (N - 1); // 0=tail, 1=tip
          const hw = TAIL_HALF + (TIP_HALF - TAIL_HALF) * t; // wide→thin
          const [nx, ny] = perp(pts, i);
          L.push({ x: pts[i].x + nx * hw, y: pts[i].y + ny * hw });
          R.push({ x: pts[i].x - nx * hw, y: pts[i].y - ny * hw });
        }

        // ── Draw trapezoid segments tail→tip ──────────────────────────────
        // Each segment carries the hue from its start-point, so the colour
        // of any given stroke segment persists as that area ages and fades.
        for (let i = 0; i < N - 1; i++) {
          const t = i / (N - 1); // 0=tail, 1=tip
          const age = now - pts[i].ts;
          // Age fade: quadratic so tail vanishes quickly; position boost: tip is brighter
          const ageFade = Math.pow(Math.max(0, 1 - age / TRAIL_DURATION), 1.3);
          const alpha = ageFade * (t * 0.82 + 0.06);
          if (alpha < 0.005) continue;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `hsl(${pts[i].hue}, 100%, 60%)`;
          ctx.beginPath();
          ctx.moveTo(L[i].x, L[i].y);
          // Midpoint bezier on left edge for smooth curve
          const lmx = (L[i].x + L[i + 1].x) / 2;
          const lmy = (L[i].y + L[i + 1].y) / 2;
          ctx.quadraticCurveTo(L[i].x, L[i].y, lmx, lmy);
          ctx.lineTo(L[i + 1].x, L[i + 1].y);
          ctx.lineTo(R[i + 1].x, R[i + 1].y);
          // Midpoint bezier on right edge
          const rmx = (R[i].x + R[i + 1].x) / 2;
          const rmy = (R[i].y + R[i + 1].y) / 2;
          ctx.quadraticCurveTo(R[i + 1].x, R[i + 1].y, rmx, rmy);
          ctx.lineTo(R[i].x, R[i].y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // ── Luminous centerline — smooth bezier through all points ─────────
        // Drawn in a single pass using the midpoint technique.
        // This gives the "fluid paint" brightness along the spine.
        ctx.save();
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = `hsl(${pts[N - 1].hue}, 100%, 78%)`;
        ctx.shadowColor = `hsl(${pts[N - 1].hue}, 100%, 65%)`;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < N - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(pts[N - 1].x, pts[N - 1].y);

        // Fade the centerline: fully opaque at tip, invisible at tail
        const tipAge = now - pts[N - 1].ts;
        const tipFade = Math.max(0, 1 - tipAge / TRAIL_DURATION);
        ctx.globalAlpha = tipFade * 0.88;
        ctx.stroke();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

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
        zIndex: 99999,
      }}
    />
  );
}
