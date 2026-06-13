"use client";

import { motion } from "framer-motion";

export default function LinksPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
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
          color: "rgba(240,240,240,0.034)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        08
      </motion.div>
      <motion.p
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "10px",
          letterSpacing: "0.38em",
          color: "rgba(240,240,240,0.28)",
        }}
      >
        links
      </motion.p>
    </main>
  );
}
