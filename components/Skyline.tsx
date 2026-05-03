"use client";

import { useEffect, useRef, useCallback } from "react";

function drawBatSignal(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const originX    = W * 0.52;
  const originY    = H * 0.27;
  const beamLen    = H * 0.65;
  const halfSpread = W * 0.30;

  ctx.save();
  ctx.filter = "blur(50px)";

  const leftGrad = ctx.createLinearGradient(0, 0, -halfSpread * 0.40, beamLen * 0.94);
  leftGrad.addColorStop(0,    "rgba(184,212,232,0.26)");
  leftGrad.addColorStop(0.20, "rgba(184,212,232,0.14)");
  leftGrad.addColorStop(0.55, "rgba(184,212,232,0.055)");
  leftGrad.addColorStop(1,    "rgba(184,212,232,0)");
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX - halfSpread, originY + beamLen);
  ctx.lineTo(originX + halfSpread * 0.067, originY + beamLen);
  ctx.closePath();
  ctx.fillStyle = leftGrad;
  ctx.fill();

  const rightGrad = ctx.createLinearGradient(0, 0, halfSpread * 0.40, beamLen * 0.94);
  rightGrad.addColorStop(0,    "rgba(184,212,232,0.26)");
  rightGrad.addColorStop(0.20, "rgba(184,212,232,0.14)");
  rightGrad.addColorStop(0.55, "rgba(184,212,232,0.055)");
  rightGrad.addColorStop(1,    "rgba(184,212,232,0)");
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX - halfSpread * 0.067, originY + beamLen);
  ctx.lineTo(originX + halfSpread, originY + beamLen);
  ctx.closePath();
  ctx.fillStyle = rightGrad;
  ctx.fill();

  ctx.restore();

  const scatterLayers = [
    { spread: 0.16, op: 0.048 },
    { spread: 0.24, op: 0.038 },
    { spread: 0.34, op: 0.028 },
    { spread: 0.44, op: 0.018 },
    { spread: 0.56, op: 0.010 },
  ];

  scatterLayers.forEach(({ spread, op }) => {
    const sh = halfSpread * (spread / 0.30);
    const sg = ctx.createLinearGradient(originX, originY - H * 0.04, originX, originY + beamLen);
    sg.addColorStop(0,    `rgba(184,212,232,${op * 2.4})`);
    sg.addColorStop(0.22, `rgba(184,212,232,${op})`);
    sg.addColorStop(0.60, `rgba(184,212,232,${op * 0.38})`);
    sg.addColorStop(1,    "rgba(184,212,232,0)");
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(originX, originY - H * 0.04);
    ctx.lineTo(originX - sh, originY + beamLen);
    ctx.lineTo(originX + sh, originY + beamLen);
    ctx.closePath();
    ctx.fillStyle = sg;
    ctx.fill();
    ctx.restore();
  });

  drawBatSymbol(ctx, originX, originY + beamLen, H * 0.034);

  const glows = [
    { r: H * 0.09, op: 0.20 },
    { r: H * 0.17, op: 0.09 },
    { r: H * 0.28, op: 0.042 },
    { r: H * 0.44, op: 0.016 },
  ];

  glows.forEach(({ r, op }) => {
    const rg = ctx.createRadialGradient(originX, originY, 0, originX, originY, r);
    rg.addColorStop(0,   `rgba(184,212,232,${op})`);
    rg.addColorStop(0.4, `rgba(184,212,232,${op * 0.5})`);
    rg.addColorStop(1,   "rgba(184,212,232,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  });
}

function drawBatSymbol(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  const s = size;
  ctx.save();
  ctx.globalAlpha = 0.046;
  ctx.fillStyle   = "#020205";
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.38);
  ctx.bezierCurveTo(cx - s * 0.22, cy + s * 0.22, cx - s * 0.82, cy - s * 0.28, cx - s, cy + s * 0.04);
  ctx.bezierCurveTo(cx - s * 0.88, cy - s * 0.58, cx - s * 0.52, cy - s * 0.48, cx - s * 0.24, cy - s * 0.06);
  ctx.bezierCurveTo(cx - s * 0.16, cy - s * 0.48, cx - s * 0.06, cy - s * 0.58, cx, cy - s * 0.26);
  ctx.bezierCurveTo(cx + s * 0.06, cy - s * 0.58, cx + s * 0.16, cy - s * 0.48, cx + s * 0.24, cy - s * 0.06);
  ctx.bezierCurveTo(cx + s * 0.52, cy - s * 0.48, cx + s * 0.88, cy - s * 0.58, cx + s, cy + s * 0.04);
  ctx.bezierCurveTo(cx + s * 0.82, cy - s * 0.28, cx + s * 0.22, cy + s * 0.22, cx, cy + s * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function Skyline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBatSignal(ctx, canvas.width, canvas.height);
    rafRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
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
      className="absolute inset-0 w-full h-full pointer-events-none z-[10]"
    />
  );
}
