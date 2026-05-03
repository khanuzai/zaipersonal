"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 1.5s fade in + 2s hold = 3.5s before we start exit
    const t = setTimeout(() => {
      setVisible(false);
      // exit animation is 1s, then fire onComplete
      setTimeout(onComplete, 1000);
    }, 3500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          className="fixed inset-0 z-[99990] flex items-center justify-center bg-[#080808]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          {/* Bat signal — extremely faint, behind the text */}
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0.045 }}
          >
            <BatSignal />
          </div>

          {/* "A ZAI PRODUCTION" */}
          <motion.p
            className="relative font-mono text-[11px] text-off-white tracking-[0.55em] uppercase font-thin select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            A ZAI PRODUCTION
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BatSignal() {
  return (
    <svg
      viewBox="0 0 400 400"
      width="420"
      height="420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft searchlight circle */}
      <circle
        cx="200"
        cy="200"
        r="180"
        fill="url(#searchlight)"
        opacity="0.6"
      />
      {/* Bat silhouette */}
      <path
        d="
          M200 195
          C185 175 155 160 120 155
          C130 168 138 178 140 188
          C125 182 105 183 88 192
          C105 190 118 191 127 197
          C112 208 106 225 114 240
          C126 220 148 210 165 215
          C177 220 188 232 194 244
          C196 238 198 230 200 226
          C202 230 204 238 206 244
          C212 232 223 220 235 215
          C252 210 274 220 286 240
          C294 225 288 208 273 197
          C282 191 295 190 312 192
          C295 183 275 182 260 188
          C262 178 270 168 280 155
          C245 160 215 175 200 195Z
        "
        fill="white"
        opacity="0.9"
      />
      <defs>
        <radialGradient id="searchlight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="60%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
