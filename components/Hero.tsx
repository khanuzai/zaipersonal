"use client";

import { motion } from "framer-motion";

const SOCIAL_LINKS = [
  { label: "GitHub",   href: "https://github.com/khanuzai" },
  { label: "LinkedIn", href: "https://linkedin.com/in/khanzai" },
  { label: "Twitter",  href: "https://x.com/kh4nzai" },
  { label: "Email",    href: "mailto:abdullah.khan1@uwaterloo.ca" },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function fadeUp(delay: number) {
  return {
    initial:    { opacity: 0, y: 22 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  };
}

export default function Hero() {
  return (
    <section className="relative flex flex-col h-screen overflow-hidden bg-black">

      {/* Toronto skyline photo — bottom 57.5% */}
      <div className="absolute bottom-0 left-0 right-0 h-[57.5%] z-[1] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/JTwYnws.png"
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-bottom"
          style={{ filter: "brightness(0.83) contrast(1.1)" }}
        />
        {/* Top edge melts into pure black */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, #080808 0%, rgba(8,8,8,0.78) 18%, rgba(8,8,8,0.22) 38%, rgba(8,8,8,0) 52%)",
          }}
        />
        {/* Left / right vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(8,8,8,0.75) 0%, rgba(8,8,8,0.18) 16%, transparent 32%, transparent 68%, rgba(8,8,8,0.18) 84%, rgba(8,8,8,0.75) 100%)",
          }}
        />
      </div>

      {/* Radial vignette — spotlights center */}
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

        {/* ABDULLAH KHAN */}
        <motion.p
          className="font-mono font-extralight text-off-white/70 mt-2 tracking-[0.14em] uppercase"
          style={{ fontSize: "clamp(16px, 3.2vw, 52px)" }}
          {...fadeUp(0.15)}
        >
          Abdullah Khan
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="font-mono text-off-white/40 mt-3 tracking-[0.28em] uppercase"
          style={{ fontSize: "clamp(9px, 1vw, 13px)" }}
          {...fadeUp(0.28)}
        >
          CS / BBA @ Waterloo &nbsp;·&nbsp; Builder &nbsp;·&nbsp; Toronto
        </motion.p>

        {/* Social links */}
        <motion.div className="flex gap-6 mt-6" {...fadeUp(0.42)}>
          {SOCIAL_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[12px] tracking-[0.22em] text-off-white/75 hover:text-off-white transition-colors duration-300 uppercase"
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

      {/* Spacer fills the photo region so flex layout matches proportions */}
      <div className="flex-[0_0_57.5%]" />
    </section>
  );
}
