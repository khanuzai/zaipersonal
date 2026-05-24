"use client";

import { useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bat {
  x0: number; y0: number;         // spawn point (near CN Tower)
  cx1: number; cy1: number;       // bezier control point 1
  cx2: number; cy2: number;       // bezier control point 2
  x1: number; y1: number;         // off-screen end point
  t: number;                      // flight progress 0→1
  speed: number;                  // t increment per frame
  delayFrames: number;            // stagger before departing
  flapPhase: number;              // sine wave phase for wing animation
  flapFreq: number;               // flap speed
  wingspan: number;               // px
  done: boolean;
}

// ── Cubic bezier interpolation ────────────────────────────────────────────────

function bz(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
}

// ── Draw a single bat silhouette ──────────────────────────────────────────────

function drawBat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ws: number,         // wingspan
  flapPhase: number,
  alpha: number,
) {
  if (alpha < 0.01) return;
  const hw = ws * 0.5;
  const bh = ws * 0.13;
  const tipY = Math.sin(flapPhase) * hw * 0.42;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#1c1c1c";

  // Left wing — upper bezier then lower bezier back to body
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - hw*0.32, y - bh,         x - hw*0.88, y + tipY - bh*0.5, x - hw, y + tipY);
  ctx.bezierCurveTo(x - hw*0.62, y + tipY + bh*1.3, x - hw*0.2, y + bh*0.9,    x, y);
  ctx.fill();

  // Right wing (mirrored)
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + hw*0.32, y - bh,         x + hw*0.88, y + tipY - bh*0.5, x + hw, y + tipY);
  ctx.bezierCurveTo(x + hw*0.62, y + tipY + bh*1.3, x + hw*0.2, y + bh*0.9,    x, y);
  ctx.fill();

  ctx.restore();
}

// ── Create a bat with a randomized bezier flight path ────────────────────────

function makeBat(W: number, H: number, delayFrames: number): Bat {
  const r = Math.random;

  // Spawn near the top of the CN Tower — center-left of skyline
  const x0 = W * (0.37 + r() * 0.09);
  const y0 = H * (0.56 + r() * 0.07);

  // Spread direction across upper hemisphere, mostly upward
  const angle = (r() - 0.5) * Math.PI * 1.3;
  const dist  = Math.sqrt(W*W + H*H) * (0.42 + r() * 0.52);
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle); // negative = upward in canvas coords

  const x1 = x0 + dx * dist;
  const y1 = y0 + dy * dist;

  // Organic control points — random lateral swerve for each bat
  const cx1 = x0 + dx * dist * 0.27 + (r() - 0.5) * W * 0.30;
  const cy1 = y0 + dy * dist * 0.27 + (r() - 0.5) * H * 0.22;
  const cx2 = x1 + (r() - 0.5) * W * 0.18;
  const cy2 = y1 + (r() - 0.5) * H * 0.14;

  return {
    x0, y0, cx1, cy1, cx2, cy2, x1, y1,
    t: 0,
    speed: 0.0033 + r() * 0.005,
    delayFrames,
    flapPhase: r() * Math.PI * 2,
    flapFreq: 0.08 + r() * 0.07,
    wingspan: 8 + r() * 10,
    done: false,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroBatAnimations() {
  const signalRef = useRef<HTMLCanvasElement>(null);
  const batsRef   = useRef<HTMLCanvasElement>(null);
  const rafSig    = useRef<number>(0);
  const rafBat    = useRef<number>(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile  = window.innerWidth < 768;

    const sigCanvas = signalRef.current;
    const batCanvas = batsRef.current;
    if (!sigCanvas || !batCanvas) return;

    const sCtx = sigCanvas.getContext("2d");
    const bCtx = batCanvas.getContext("2d");
    if (!sCtx || !bCtx) return;

    function fit(c: HTMLCanvasElement) {
      c.width  = window.innerWidth;
      c.height = window.innerHeight;
    }
    fit(sigCanvas);
    fit(batCanvas);

    // ── BAT SIGNAL ────────────────────────────────────────────────────────────
    // Origin: bottom-left. Sweeps from near-vertical to upper-right over 9s.
    const SWEEP_MS  = 9000;
    const ANG_START = 0.02;  // radians from vertical-up, ≈straight up
    const ANG_END   = 1.08;  // sweeps toward upper-right
    const sigT0     = performance.now();

    const drawSignal = (now: number) => {
      const W = sigCanvas.width;
      const H = sigCanvas.height;
      sCtx.clearRect(0, 0, W, H);

      const progress = reduced
        ? 0.44
        : ((now - sigT0) % SWEEP_MS) / SWEEP_MS;
      const ang = ANG_START + (ANG_END - ANG_START) * progress;

      // Searchlight origin — bottom-left corner area
      const ox = W * 0.05;
      const oy = H * 0.94;
      const ddx = Math.sin(ang);
      const ddy = -Math.cos(ang); // negative = upward

      // Clip to sky (top 56% — above the rooftops)
      sCtx.save();
      sCtx.beginPath();
      sCtx.rect(0, 0, W, H * 0.56);
      sCtx.clip();

      const beamLen = Math.sqrt(W*W + H*H) * 1.8;
      const halfCone = 0.13; // ~7.5° half-angle of cone

      // 5 layered passes — very low opacity each, builds up softly
      for (let p = 0; p < 5; p++) {
        const spread = 1 + p * 0.30;
        const a      = 0.056 - p * 0.007;
        const la = ang - halfCone * spread;
        const ra = ang + halfCone * spread;

        const lx = ox + Math.sin(la) * beamLen;
        const ly = oy - Math.cos(la) * beamLen;
        const rx = ox + Math.sin(ra) * beamLen;
        const ry = oy - Math.cos(ra) * beamLen;

        const midX = ox + ddx * beamLen * 0.5;
        const midY = oy + ddy * beamLen * 0.5;
        const grad = sCtx.createLinearGradient(ox, oy, midX, midY);
        grad.addColorStop(0,    `rgba(184,212,232,0)`);
        grad.addColorStop(0.07, `rgba(184,212,232,${(a * 1.5).toFixed(3)})`);
        grad.addColorStop(0.5,  `rgba(184,212,232,${a.toFixed(3)})`);
        grad.addColorStop(1,    `rgba(184,212,232,0)`);

        sCtx.beginPath();
        sCtx.moveTo(ox, oy);
        sCtx.lineTo(lx, ly);
        sCtx.lineTo(rx, ry);
        sCtx.closePath();
        sCtx.fillStyle = grad;
        sCtx.fill();
      }

      // Circular glow where beam hits cloud level (y = H * 0.22)
      const cloudY = H * 0.22;
      if (ddy < 0) { // beam points upward
        const tHit  = (cloudY - oy) / ddy;
        const glowX = ox + ddx * tHit;

        if (glowX > -W * 0.08 && glowX < W * 1.08) {
          const gr   = W * 0.072;
          const glow = sCtx.createRadialGradient(glowX, cloudY, 0, glowX, cloudY, gr);
          glow.addColorStop(0,   "rgba(184,212,232,0.10)");
          glow.addColorStop(0.4, "rgba(184,212,232,0.05)");
          glow.addColorStop(1,   "rgba(184,212,232,0)");
          sCtx.beginPath();
          sCtx.arc(glowX, cloudY, gr, 0, Math.PI * 2);
          sCtx.fillStyle = glow;
          sCtx.fill();

          // Bat silhouette in the signal glow — extremely faint, have to look for it
          drawBat(sCtx, glowX, cloudY, gr * 0.68, 0, 0.05);
        }
      }

      sCtx.restore();
      rafSig.current = requestAnimationFrame(drawSignal);
    };

    rafSig.current = requestAnimationFrame(drawSignal);

    // ── BAT SWARM ─────────────────────────────────────────────────────────────
    const INIT_COUNT    = mobile ? 25 : 70;
    const REPEAT_MIN    = mobile ? 6  : 8;
    const REPEAT_MAX    = mobile ? 10 : 12;
    const INIT_DELAY_FR = 3 * 60; // frames — stagger initial swarm over 3 seconds

    let bats: Bat[] = [];
    let repeatTimer: ReturnType<typeof setTimeout> | null = null;
    let initTimer:   ReturnType<typeof setTimeout> | null = null;

    function spawnSwarm(count: number, maxDelayFrames: number) {
      const W = batCanvas.width;
      const H = batCanvas.height;
      for (let i = 0; i < count; i++) {
        bats.push(makeBat(W, H, Math.floor(Math.random() * maxDelayFrames)));
      }
    }

    function scheduleRepeat() {
      const ms = 45000 + Math.random() * 15000;
      repeatTimer = setTimeout(() => {
        const n = REPEAT_MIN + Math.floor(Math.random() * (REPEAT_MAX - REPEAT_MIN + 1));
        spawnSwarm(n, 2 * 60);
        scheduleRepeat();
      }, ms);
    }

    if (!reduced) {
      // Fire initial swarm shortly after page loads
      initTimer = setTimeout(() => {
        spawnSwarm(INIT_COUNT, INIT_DELAY_FR);
        scheduleRepeat();
      }, 850);
    }

    const drawBats = () => {
      const W = batCanvas.width;
      const H = batCanvas.height;
      bCtx.clearRect(0, 0, W, H);

      const margin = 55;

      for (const bat of bats) {
        if (bat.done) continue;

        if (bat.delayFrames > 0) {
          bat.delayFrames--;
          continue;
        }

        bat.t         += bat.speed;
        bat.flapPhase += bat.flapFreq;

        if (bat.t >= 1) { bat.done = true; continue; }

        const x = bz(bat.t, bat.x0, bat.cx1, bat.cx2, bat.x1);
        const y = bz(bat.t, bat.y0, bat.cy1, bat.cy2, bat.y1);

        // Fade: quick fade-in, slower fade-out, edge attenuation
        const fadeIn  = Math.min(1, bat.t * 7);
        const fadeOut = bat.t > 0.70 ? Math.max(0, 1 - (bat.t - 0.70) / 0.30) : 1;
        const ex = x < margin ? x / margin : x > W - margin ? (W - x) / margin : 1;
        const ey = y < margin ? y / margin : y > H - margin ? (H - y) / margin : 1;
        const alpha = fadeIn * fadeOut * Math.min(1, Math.max(0, ex)) * Math.min(1, Math.max(0, ey));

        drawBat(bCtx, x, y, bat.wingspan, bat.flapPhase, alpha);
      }

      // Prune memory — only when list grows large
      if (bats.length > 300) bats = bats.filter(b => !b.done);

      rafBat.current = requestAnimationFrame(drawBats);
    };

    rafBat.current = requestAnimationFrame(drawBats);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => { fit(sigCanvas); fit(batCanvas); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafSig.current);
      cancelAnimationFrame(rafBat.current);
      if (repeatTimer) clearTimeout(repeatTimer);
      if (initTimer)   clearTimeout(initTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      {/* Bat signal — above photo (z:1), below rain (z:5) */}
      <canvas
        ref={signalRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
      {/* Bats — above rain (z:5), below vignette (z:50) and text (z:60) */}
      <canvas
        ref={batsRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 7,
        }}
      />
    </>
  );
}
