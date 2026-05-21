"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import FluidSimulation from "@/components/ui/fluid-simulation";
import { AnimatedButton } from "@/components/ui/animated-button";

export default function Resume() {
  useEffect(() => {
    document.body.style.backgroundColor = "#FFFFFF";
    document.documentElement.style.backgroundColor = "#FFFFFF";
    document.body.classList.add("resume-cursor");
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
      document.body.classList.remove("resume-cursor");
    };
  }, []);

  return (
    // Transparent — white comes from body background set above.
    // FluidSimulation canvas sits at z-index 0 (fixed, behind).
    // This div is position:relative → paints on top of the fixed canvas.
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FluidSimulation />

      {/* Ghost watermark */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          fontSize: "clamp(180px, 30vw, 420px)",
          fontFamily: "var(--font-geist-mono)",
          fontWeight: 700,
          color: "#E0E0E0",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        04
      </motion.div>

      {/* Section label */}
      <motion.p
        style={{
          position: "absolute",
          top: "120px",
          left: "4rem",
          fontFamily: "var(--font-geist-mono)",
          fontSize: "10px",
          letterSpacing: "0.38em",
          color: "rgba(13,27,42,0.40)",
          textTransform: "lowercase",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        resume
      </motion.p>

      {/* Center content — explicit z-index so buttons always clear the canvas */}
      <motion.div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <p
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "12px",
            letterSpacing: "0.32em",
            color: "rgba(13,27,42,0.30)",
            textTransform: "lowercase",
            marginBottom: "16px",
          }}
        >
          select a document
        </p>

        <AnimatedButton href="/khan1.pdf" label="cs resume" download="khan1.pdf" />
        <AnimatedButton href="/bus1.pdf" label="business resume" download="bus1.pdf" />
      </motion.div>
    </div>
  );
}
