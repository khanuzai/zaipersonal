"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Friend {
  name: string;
  university: string;
  program: string;
  photo: string;
  rotation: number;   // deg, between -6 and +6
  topOffset: number;  // px, 0–40 — breaks grid uniformity
  siteUrl: string | null;
}

// ── Swap in real info here ────────────────────────────────────────────────────
const FRIENDS: Friend[] = [
  {
    name: "Alex Chen",
    university: "UWaterloo",
    program: "CS",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
    rotation: -4,
    topOffset: 20,
    siteUrl: null,
  },
  {
    name: "Sarah Kim",
    university: "UofT",
    program: "Engineering",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80",
    rotation: 5,
    topOffset: 35,
    siteUrl: null,
  },
  {
    name: "Omar Hassan",
    university: "Waterloo",
    program: "Math",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400&q=80",
    rotation: -6,
    topOffset: 8,
    siteUrl: null,
  },
  {
    name: "Priya Patel",
    university: "McMaster",
    program: "Life Sci",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80",
    rotation: 3,
    topOffset: 28,
    siteUrl: null,
  },
  {
    name: "Marcus Johnson",
    university: "UWaterloo",
    program: "CS/BBA",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80",
    rotation: -2,
    topOffset: 12,
    siteUrl: null,
  },
  {
    name: "Fatima Al-Rashid",
    university: "Ryerson",
    program: "Business",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80",
    rotation: 6,
    topOffset: 38,
    siteUrl: null,
  },
  {
    name: "Daniel Park",
    university: "UWaterloo",
    program: "SE",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80",
    rotation: -5,
    topOffset: 5,
    siteUrl: null,
  },
  {
    name: "Aisha Mohammed",
    university: "UofT",
    program: "CS",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80",
    rotation: 4,
    topOffset: 22,
    siteUrl: null,
  },
];

export default function Friends() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const cleanups: (() => void)[] = [];

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const rot = FRIENDS[i].rotation;

      // Drop in from slightly above with rotation wobble
      gsap.set(card, {
        y: -45,
        opacity: 0,
        rotation: rot + (i % 2 === 0 ? 5 : -5),
      });

      ScrollTrigger.create({
        trigger: card,
        start: "top 92%",
        once: true,
        onEnter: () => {
          gsap.to(card, {
            y: 0,
            opacity: 1,
            rotation: rot,
            duration: 0.72,
            delay: (i % 4) * 0.1,
            ease: "back.out(1.5)",
          });
        },
      });

      // Hover: lift + rotation moves toward 0, shadow handled via React events
      const onEnter = () =>
        gsap.to(card, {
          y: -8,
          rotation: rot * 0.15,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      const onLeave = () =>
        gsap.to(card, {
          y: 0,
          rotation: rot,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      className="relative min-h-screen px-6 md:px-12 lg:px-14"
      style={{ paddingTop: "108px", paddingBottom: "100px" }}
    >
      {/* Ghost watermark — 1% opacity only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
        style={{
          fontSize: "clamp(180px, 30vw, 420px)",
          fontFamily: "var(--font-geist-mono)",
          fontWeight: 700,
          color: "rgba(240,240,240,0.01)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        05
      </div>

      {/* Section label */}
      <div style={{ position: "absolute", top: "84px", left: "24px" }}>
        <p
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "10px",
            letterSpacing: "0.38em",
            color: "rgba(240,240,240,0.28)",
            lineHeight: 1,
          }}
        >
          friends
        </p>
        <p
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "9px",
            letterSpacing: "0.22em",
            color: "rgba(240,240,240,0.14)",
            marginTop: "7px",
          }}
        >
          people who matter
        </p>
      </div>

      {/* Polaroid grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        style={{ gap: "28px", marginTop: "56px" }}
      >
        {FRIENDS.map((friend, i) => (
          <div key={friend.name} style={{ marginTop: `${friend.topOffset}px` }}>
            <div
              ref={(el) => { cardsRef.current[i] = el; }}
              onClick={
                friend.siteUrl
                  ? () => window.open(friend.siteUrl!, "_blank", "noopener noreferrer")
                  : undefined
              }
              style={{
                background: "#F5F0E8",
                padding: "10px 10px 22px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                cursor: friend.siteUrl ? "pointer" : "default",
                transition: "box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 14px 44px rgba(0,0,0,0.65)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.4)";
              }}
            >
              {/* Photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={friend.photo}
                alt={friend.name}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Handwritten label */}
              <div style={{ paddingTop: "10px", textAlign: "center" }}>
                <p
                  style={{
                    fontFamily: "var(--font-caveat)",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    lineHeight: 1.15,
                  }}
                >
                  {friend.name}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-caveat)",
                    fontSize: "15px",
                    color: "rgba(26,26,26,0.48)",
                    lineHeight: 1.3,
                    marginTop: "3px",
                  }}
                >
                  {friend.university} · {friend.program}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p
        style={{
          textAlign: "center",
          fontFamily: "var(--font-geist-mono)",
          fontSize: "11px",
          color: "rgba(240,240,240,0.30)",
          letterSpacing: "0.22em",
          marginTop: "80px",
        }}
      >
        and counting
      </p>
    </section>
  );
}
