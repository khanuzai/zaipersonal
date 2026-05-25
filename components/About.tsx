"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SENTENCE = "CS at UWaterloo. BBA at Laurier. I build things that feel like something.";
const MARQUEE_SEGMENT = "cs · bba · waterloo · laurier · builder · craft · ";

export default function About() {
  const sectionRef   = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const lineRef      = useRef<HTMLDivElement>(null);
  const wordsRef     = useRef<(HTMLSpanElement | null)[]>([]);
  const [awakened, setAwakened] = useState(false);

  useEffect(() => {
    setAwakened(sessionStorage.getItem("zai_awakened") === "1");
  }, []);

  const words = SENTENCE.split(" ");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(wordsRef.current, { y: 38, filter: "blur(10px)", opacity: 0 });
      gsap.set(watermarkRef.current, { scale: 1.1, opacity: 0 });
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          once: true,
        },
      });

      // Vertical line draws itself down — tight, 0.8s
      tl.to(
        lineRef.current,
        { scaleY: 1, duration: 0.8, ease: "power3.inOut" },
        0,
      );

      // Words slide up with blur clearing, staggered 0.075s
      tl.to(
        wordsRef.current,
        {
          y: 0,
          filter: "blur(0px)",
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.075,
        },
        0.08,
      );

      // Watermark settles into place — scales 1.1 → 1 while fading
      tl.to(
        watermarkRef.current,
        { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" },
        0.3,
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center overflow-hidden"
      style={{ paddingTop: "80px" }}
    >
      {/* Faint radial glow — light source behind the text */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "400px",
          background:
            "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(240,240,240,0.028) 0%, transparent 70%)",
        }}
      />

      {/* Ghost section number watermark */}
      <div
        ref={watermarkRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
        style={{
          fontSize: "clamp(180px, 30vw, 420px)",
          fontFamily: "var(--font-geist-mono)",
          fontWeight: 700,
          color: "rgba(240,240,240,0.034)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          userSelect: "none",
          opacity: 0,
        }}
      >
        01
      </div>

      {/* Vertical line — draws downward on entry */}
      <div
        aria-hidden
        className="absolute top-0 bottom-0"
        style={{ left: "2.5rem", width: "1px" }}
      >
        <div
          ref={lineRef}
          style={{
            width: "1px",
            height: "100%",
            background: "rgba(240,240,240,0.13)",
            transform: "scaleY(0)",
            transformOrigin: "top center",
          }}
        />
      </div>

      {/* Main text — words split for individual animation */}
      <div
        className="relative"
        style={{ paddingLeft: "6rem", paddingRight: "4rem" }}
      >
        <p
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "clamp(20px, 1.8vw, 26px)",
            fontWeight: 300,
            color: "rgba(240,240,240,0.86)",
            lineHeight: 1.6,
            letterSpacing: "0.01em",
            maxWidth: "640px",
          }}
        >
          {words.map((word, i) => (
            <span key={i} style={{ display: "inline" }}>
              <span
                ref={(el) => { wordsRef.current[i] = el; }}
                style={{
                  display: "inline-block",
                  willChange: "transform, filter, opacity",
                }}
              >
                {word}
              </span>
              {i < words.length - 1 && " "}
            </span>
          ))}
        </p>
      </div>

      {/* Hidden portal — only exists if you found the signature */}
      {awakened && (
        <Link
          href="/quotes"
          tabIndex={-1}
          aria-hidden
          style={{
            position: "absolute",
            left: "2.1rem",
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "'Noto Naskh Arabic', serif",
            fontSize: "15px",
            color: "rgba(240,240,240,0.07)",
            textDecoration: "none",
            transition: "color 0.6s ease",
            zIndex: 10,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(240,240,240,0.22)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(240,240,240,0.07)"; }}
        >
          خان
        </Link>
      )}

      {/* Marquee — always running, never triggered by scroll */}
      <div
        aria-hidden
        className="absolute bottom-10 left-0 right-0 overflow-hidden"
        style={{ height: "14px" }}
      >
        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            animation: "marquee 36s linear infinite",
            fontFamily: "var(--font-geist-mono)",
            fontSize: "10px",
            color: "rgba(240,240,240,0.19)",
            letterSpacing: "0.2em",
          }}
        >
          <span style={{ flexShrink: 0 }}>{MARQUEE_SEGMENT.repeat(12)}</span>
          <span style={{ flexShrink: 0 }}>{MARQUEE_SEGMENT.repeat(12)}</span>
        </div>
      </div>
    </section>
  );
}
