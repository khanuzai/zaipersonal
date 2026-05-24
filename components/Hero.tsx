"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import HeroBatAnimations from "@/components/ui/hero-bat-animations";

// ─── Social links ────────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  { label: "github",   href: "https://github.com/khanuzai" },
  { label: "linkedin", href: "https://linkedin.com/in/khanzai" },
  { label: "x",        href: "https://x.com/kh4nzai" },
  { label: "email",    href: "mailto:abdullah.khan1@uwaterloo.ca" },
];

// ─── Entrance animation ──────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function fadeUp(delay: number) {
  return {
    initial:    { opacity: 0, y: 22 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  };
}

// ─── Split-flap word cycler ──────────────────────────────────────────────────
const FLIP_WORDS = [
  "builder",
  "engineer",
  "hacker",
  "mathematician",
  "founder",
  "obsessed",
  "relentless",
];
const CHARSET         = "abcdefghijklmnopqrstuvwxyz";
const SCRAMBLE_FRAMES = 12;
const FRAME_MS        = 42;
const HOLD_MS         = 2000;

function FlipBoardWord() {
  const [text, setText] = useState(FLIP_WORDS[0]);
  const wordIdxRef      = useRef(0);
  const mountedRef      = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const scrambleTo = (target: string, onDone: () => void) => {
      let frame = 0;
      const tick = () => {
        if (!mountedRef.current) return;
        if (frame >= SCRAMBLE_FRAMES) {
          setText(target);
          onDone();
          return;
        }
        const chars = target.split("").map((ch, i) => {
          const settleAt = Math.floor((i / target.length) * SCRAMBLE_FRAMES * 0.65);
          return frame >= settleAt ? ch : CHARSET[Math.floor(Math.random() * CHARSET.length)];
        });
        setText(chars.join(""));
        frame++;
        setTimeout(tick, FRAME_MS);
      };
      tick();
    };

    const cycle = () => {
      if (!mountedRef.current) return;
      setTimeout(() => {
        if (!mountedRef.current) return;
        wordIdxRef.current = (wordIdxRef.current + 1) % FLIP_WORDS.length;
        scrambleTo(FLIP_WORDS[wordIdxRef.current], cycle);
      }, HOLD_MS);
    };

    cycle();
    return () => { mountedRef.current = false; };
  }, []);

  return (
    <motion.p
      className="font-mono text-off-white/65 mt-2 tracking-[0.28em]"
      style={{ fontSize: "clamp(9px, 1vw, 13px)" }}
      {...fadeUp(0.26)}
    >
      {text}
    </motion.p>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <section className="relative flex flex-col h-screen overflow-hidden bg-black">

      {/* Toronto skyline photo — full height, city anchored at bottom */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/JTwYnws.png"
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.83) contrast(1.1)", objectPosition: "center 109%" }}
        />
        {/* Top-fade: blends dark sky into #080808, eliminates hard line */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, #080808 0%, rgba(8,8,8,0.78) 18%, rgba(8,8,8,0.22) 38%, rgba(8,8,8,0) 52%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(8,8,8,0.75) 0%, rgba(8,8,8,0.18) 16%, transparent 32%, transparent 68%, rgba(8,8,8,0.18) 84%, rgba(8,8,8,0.75) 100%)",
          }}
        />
      </div>

      {/* Bat signal + bat swarm canvases */}
      <HeroBatAnimations />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[50]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(8,8,8,0.42) 62%, rgba(8,8,8,0.84) 100%)",
        }}
      />

      {/* Name / info block */}
      <div className="relative z-[60] flex flex-col justify-center flex-1 px-10 md:px-16 pt-28 pb-4">
        {/* ZAI — spread across full width */}
        <motion.div
          className="flex justify-between w-full select-none leading-[0.85]"
          {...fadeUp(0)}
        >
          {["Z", "A", "I"].map((letter) => (
            <span
              key={letter}
              className="font-mono font-thin text-off-white"
              style={{ fontSize: "clamp(72px, 15vw, 230px)" }}
            >
              {letter}
            </span>
          ))}
        </motion.div>

        {/* Name — dominant */}
        <motion.p
          className="font-mono font-extralight mt-3 tracking-[0.14em]"
          style={{ fontSize: "clamp(21px, 3.6vw, 58px)", color: "#B0B0B0" }}
          {...fadeUp(0.1)}
        >
          abdullah khan
        </motion.p>

        {/* Permanent credentials */}
        <motion.p
          className="font-mono text-off-white/65 mt-2 tracking-[0.22em]"
          style={{ fontSize: "clamp(9px, 1vw, 13px)" }}
          {...fadeUp(0.18)}
        >
          cs @ uwaterloo · bba @ laurier
        </motion.p>

        {/* Rotating split-flap word */}
        <FlipBoardWord />

        {/* Social links */}
        <motion.div className="flex gap-6 mt-6" {...fadeUp(0.42)}>
          {SOCIAL_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[12px] tracking-[0.22em] text-off-white/75 hover:text-off-white transition-colors duration-300"
            >
              {label}
            </a>
          ))}
        </motion.div>
      </div>

      {/* Divider line — draws itself in from left */}
      <motion.div
        className="relative z-[60] w-full h-px bg-gotham-light/50"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
        style={{ transformOrigin: "left" }}
      />

      {/* Urdu signature — fixed bottom-right, like a painter's mark */}
      <motion.span
        aria-hidden
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          fontFamily: "'Noto Naskh Arabic', serif",
          fontSize: "21px",
          color: "rgba(240,240,240,0.65)",
          lineHeight: 1,
          pointerEvents: "none",
          zIndex: 60,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.8 }}
      >
        عبداللہ خان
      </motion.span>

      {/* Spacer fills the photo region */}
      <div className="flex-[0_0_57.5%]" />
    </section>
  );
}
