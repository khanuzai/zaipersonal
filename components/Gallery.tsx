"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Photo {
  src: string;
  alt: string;
  caption: string;
}

// ── Swap these URLs for real photos later ─────────────────────────────────────
const PHOTOS: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80",
    alt: "city skyline at night",
    caption: "toronto, somewhere past midnight",
  },
  {
    src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80",
    alt: "crowded city street",
    caption: "last day of summer",
  },
  {
    src: "https://images.unsplash.com/photo-1480714378702-5d0a9618e5f2?auto=format&fit=crop&w=800&q=80",
    alt: "tokyo night street",
    caption: "never went back",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    alt: "mountain landscape",
    caption: "worth the drive",
  },
  {
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80",
    alt: "portrait in low light",
    caption: "3am somewhere good",
  },
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    alt: "forest path sunlight",
    caption: "the long way home",
  },
  {
    src: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=600&q=80",
    alt: "city street at night",
    caption: "january light",
  },
  {
    src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80",
    alt: "aerial mountain view",
    caption: "same sky, different city",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    alt: "portrait close up",
    caption: "before everything changed",
  },
  {
    src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    alt: "new york city street",
    caption: "the city doesn't sleep",
  },
  {
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
    alt: "portrait golden hour",
    caption: "rooftop, late july",
  },
  {
    src: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
    alt: "city street blur at night",
    caption: "we stayed too long",
  },
  {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    alt: "portrait candid",
    caption: "2am, still going",
  },
  {
    src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
    alt: "moody lake landscape",
    caption: "didn't want it to end",
  },
  {
    src: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80",
    alt: "hands close up",
    caption: "keep this one",
  },
  {
    src: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=800&q=80",
    alt: "night drive city lights",
    caption: "last night in this city",
  },
  {
    src: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80",
    alt: "person in low light",
    caption: "the window seat",
  },
  {
    src: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?auto=format&fit=crop&w=800&q=80",
    alt: "travel landscape",
    caption: "just before dawn",
  },
  {
    src: "https://images.unsplash.com/photo-1476234251651-f353703a034d?auto=format&fit=crop&w=600&q=80",
    alt: "coffee close up",
    caption: "empty streets, full heart",
  },
  {
    src: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=800&q=80",
    alt: "winter city street",
    caption: "toronto, winter 2024",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function PhotoCard({ photo }: { photo: Photo }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-gallery-photo
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        breakInside: "avoid",
        marginBottom: "12px",
        borderRadius: "4px",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={photo.alt}
        style={{
          width: "100%",
          display: "block",
          borderRadius: "4px",
          filter: hovered ? "brightness(1.1)" : "brightness(1)",
          transition: "filter 0.3s ease",
          transform: "none",
          animation: "none",
          willChange: "filter",
        }}
      />

      {/* Caption overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "36px 14px 14px",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          borderRadius: "0 0 4px 4px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "11px",
            color: "#ffffff",
            margin: 0,
            letterSpacing: "0.12em",
          }}
        >
          {photo.caption}
        </p>
      </div>
    </div>
  );
}

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll("[data-gallery-photo]");
      if (!cards) return;

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 32, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.1,
            delay: (i % 3) * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              once: true,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={sectionRef}
      style={{
        minHeight: "100vh",
        backgroundColor: "#080808",
        position: "relative",
        paddingTop: "140px",
        paddingBottom: "120px",
      }}
    >
      {/* Ghost watermark — 1% opacity, barely there */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
          userSelect: "none",
          fontSize: "clamp(180px, 30vw, 420px)",
          fontFamily: "var(--font-geist-mono)",
          fontWeight: 700,
          color: "rgba(240,240,240,0.01)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        06
      </div>

      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          position: "absolute",
          top: "120px",
          left: "4rem",
          fontFamily: "var(--font-geist-mono)",
          fontSize: "10px",
          letterSpacing: "0.38em",
          color: "rgba(240,240,240,0.28)",
          textTransform: "lowercase",
          zIndex: 10,
        }}
      >
        gallery
      </motion.p>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1200px",
          margin: "0 auto",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        {/* Tone-setter */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "11px",
            color: "rgba(240,240,240,0.25)",
            textAlign: "center",
            letterSpacing: "0.22em",
            marginBottom: "48px",
          }}
        >
          moments worth keeping
        </motion.p>

        {/* Masonry grid — CSS columns */}
        <div
          style={{
            columns: "3 280px",
            columnGap: "12px",
          }}
        >
          {PHOTOS.map((photo, i) => (
            <PhotoCard key={i} photo={photo} />
          ))}
        </div>

        {/* Footer */}
        <p
          style={{
            marginTop: "80px",
            fontFamily: "var(--font-geist-mono)",
            fontSize: "10px",
            color: "rgba(240,240,240,0.20)",
            letterSpacing: "0.22em",
            textAlign: "center",
          }}
        >
          and more to come
        </p>
      </div>
    </main>
  );
}
