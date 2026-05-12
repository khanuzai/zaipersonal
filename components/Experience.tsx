"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Entry {
  company: string;
  role: string;
  period: string;
  description?: string;
  bullets?: string[];
  tech?: string[];
  tag?: string;
}

const ENTRIES: Entry[] = [
  {
    company: "LeapAP Inc.",
    role: "Software Engineering Intern",
    period: "May 2026 – Aug 2026",
    description: "all week one btw.",
    bullets: [
      "Built 2 parsers and 3 scrapers integrating 5 billing portals and processing 20+ invoices in production within the first week of onboarding",
      "Resolved 2 triage incidents by debugging scraper failures using Grafana and Graylog, identifying root causes such as bot detection blocks and malformed HTML structures",
      "Shipped 20+ commits to production via GitLab, contributing to a high-velocity deploy pipeline that pushes to prod multiple times daily",
      "Engineered bot detection circumvention logic and invoice parsing pipelines using Node.js and Puppeteer, handling edge cases across portals with varying layouts",
    ],
    tech: ["Node.js", "Puppeteer", "GitLab", "Grafana", "Graylog", "Docker", "AWS"],
  },
  {
    company: "PixelsBoost",
    role: "Software Development Engineer",
    period: "Sep 2025 – Dec 2025",
    bullets: [
      "Delivered 5 full-stack client websites to production serving 2,000+ monthly users",
      "Integrated Stripe ($15K+ monthly transactions), Google Maps, and SendGrid while maintaining 99.5% uptime",
      "Boosted performance by 42%, improving Lighthouse scores from 68 to 87, reducing bounce rate by 18%",
    ],
    tech: ["React", "JavaScript", "HTML/CSS", "Stripe", "Google Maps API", "Cloudflare"],
  },
  {
    company: "Fast Webs",
    role: "Software Engineering Intern",
    period: "May 2024 – Aug 2024",
    bullets: [
      "Engineered 12 production UI components across 3 web applications",
      "Reduced bundle size by 120KB through code splitting, achieving 35% performance improvement",
      "Delivered 18 tickets across 12 Agile sprints with 100% sprint completion rate",
    ],
    tech: ["React", "Node.js", "PostgreSQL", "JavaScript", "Jira"],
  },
];

// ─── Bold metric numbers in bullet text ─────────────────────────────────────
const METRIC_SPLIT = /(\$[\d,]+[KkMmBb]+\+?|\d[\d,]*(?:\.\d+)?(?:[KkMmGgBb][Bb]?)?\+?%?)/g;
const METRIC_TEST  = /^(?:\$[\d,]+[KkMmBb]+\+?|\d[\d,]*(?:\.\d+)?(?:[KkMmGgBb][Bb]?)?\+?%?)$/;

function boldMetrics(text: string) {
  const parts = text.split(METRIC_SPLIT);
  return parts.map((part, idx) =>
    METRIC_TEST.test(part) ? (
      <strong key={idx} style={{ color: "rgba(240,240,240,0.88)", fontWeight: 600 }}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

// ─── Positioning constants ───────────────────────────────────────────────────
//  Timeline wrapper paddingLeft = 7rem
//  Line sits at left: 4rem within wrapper
//  Content area starts at 7rem → gap = 3rem
//  Dot left = calc(-3rem - 3.5px)  →  dot center lands exactly on the line
const LINE_LEFT   = "4rem";
const DOT_LEFT    = "calc(-3rem - 3.5px)";
const WRAPPER_PL  = "7rem";
const WRAPPER_PR  = "4rem";
const LABEL_PL    = "4rem"; // aligns label with the timeline line

export default function Experience() {
  const sectionRef   = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const timelineRef  = useRef<HTMLDivElement>(null);
  const entryRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const companyRefs  = useRef<(HTMLSpanElement | null)[]>([]);
  const dotRefs      = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ── Establish initial states ──────────────────────────────────────────
      gsap.set(timelineRef.current,  { scaleY: 0, transformOrigin: "top center" });
      gsap.set(companyRefs.current.filter(Boolean),  { y: "110%" });
      gsap.set(dotRefs.current.filter(Boolean),      { scale: 0 });

      // ── Watermark settles in ──────────────────────────────────────────────
      gsap.to(watermarkRef.current, {
        opacity: 1, scale: 1,
        duration: 2.2, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
      });

      // ── Timeline line draws as you scroll through the section ─────────────
      gsap.to(timelineRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 62%",
          end: "bottom 82%",
          scrub: 1.4,
        },
      });

      // ── Per-entry: fire when each entry crosses 85% of viewport ──────────
      ENTRIES.forEach((_, i) => {
        const entry = entryRefs.current[i];
        if (!entry) return;

        const tl = gsap.timeline({
          scrollTrigger: { trigger: entry, start: "top 85%", once: true },
        });

        // Dot: appears with a back-ease pop, then pulses once
        tl.to(dotRefs.current[i],   { scale: 1, opacity: 1, duration: 0.38, ease: "back.out(3)" }, 0);
        tl.to(dotRefs.current[i],   { scale: 1.9, duration: 0.20, ease: "power2.out" }, 0.38);
        tl.to(dotRefs.current[i],   { scale: 1,   duration: 0.32, ease: "power2.in"  }, 0.58);

        // Content block: slides in from right + blur clears
        tl.to(contentRefs.current[i], {
          x: 0, filter: "blur(0px)", opacity: 1,
          duration: 0.92, ease: "power3.out",
        }, 0.04);

        // Company name: curtain lifts up from beneath overflow clip
        tl.to(companyRefs.current[i], {
          y: "0%", duration: 0.78, ease: "power3.out",
        }, 0.07);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ paddingTop: "160px", paddingBottom: "160px" }}
    >
      {/* ── Ghost "02" watermark ────────────────────────────────────────── */}
      <div
        ref={watermarkRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
        style={{
          fontSize: "clamp(160px, 28vw, 420px)",
          fontFamily: "var(--font-geist-mono)",
          fontWeight: 700,
          color: "rgba(240,240,240,0.034)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          userSelect: "none",
          opacity: 0,
          transform: "scale(1.08)",
        }}
      >
        02
      </div>

      {/* ── Chapter label ───────────────────────────────────────────────── */}
      <p
        style={{
          paddingLeft: LABEL_PL,
          paddingRight: WRAPPER_PR,
          fontFamily: "var(--font-geist-mono)",
          fontSize: "10px",
          letterSpacing: "0.38em",
          color: "rgba(240,240,240,0.28)",
          textTransform: "uppercase",
          marginBottom: "72px",
        }}
      >
        Experience
      </p>

      {/* ── Timeline wrapper ────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          paddingLeft: WRAPPER_PL,
          paddingRight: WRAPPER_PR,
        }}
      >
        {/* Vertical timeline line */}
        <div
          style={{ position: "absolute", left: LINE_LEFT, top: 0, bottom: 0, width: "1px" }}
        >
          <div
            ref={timelineRef}
            style={{
              height: "100%",
              width: "1px",
              background:
                "linear-gradient(to bottom, rgba(240,240,240,0.18) 0%, rgba(240,240,240,0.09) 65%, rgba(240,240,240,0.03) 100%)",
              transform: "scaleY(0)",
              transformOrigin: "top center",
            }}
          />
        </div>

        {/* ── Entries stack ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
          {ENTRIES.map((entry, i) => (
            <div
              key={entry.company}
              ref={(el) => { entryRefs.current[i] = el; }}
              style={{ position: "relative" }}
            >
              {/* ── Timeline dot ─────────────────────────────────────── */}
              <div
                ref={(el) => { dotRefs.current[i] = el; }}
                style={{
                  position: "absolute",
                  left: DOT_LEFT,
                  top: "10px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: entry.tag === "INCOMING"
                    ? "rgba(184,212,232,0.80)"
                    : "rgba(240,240,240,0.48)",
                  boxShadow: entry.tag === "INCOMING"
                    ? "0 0 10px 2px rgba(184,212,232,0.22)"
                    : "none",
                  opacity: 0,
                  transform: "scale(0)",
                }}
              />

              {/* ── Content block ─────────────────────────────────────── */}
              <div
                ref={(el) => { contentRefs.current[i] = el; }}
                style={{ opacity: 0, transform: "translateX(65px)", filter: "blur(8px)" }}
              >
                {/* Header: role (top, prominent) + tag | period */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "5px",
                  }}
                >
                  {/* Role title + INCOMING tag */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {/* overflow-hidden wrapper clips the curtain lift */}
                    <div
                      style={{
                        overflow: "hidden",
                        display: "inline-block",
                        lineHeight: 1.05,
                      }}
                    >
                      <span
                        ref={(el) => { companyRefs.current[i] = el; }}
                        style={{
                          fontFamily: "var(--font-geist-mono)",
                          fontSize: "clamp(18px, 2vw, 26px)",
                          fontWeight: 700,
                          color: "rgba(240,240,240,0.95)",
                          display: "inline-block",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          transform: "translateY(110%)",
                        }}
                      >
                        {entry.role}
                      </span>
                    </div>

                    {entry.tag === "INCOMING" && (
                      <span
                        style={{
                          fontFamily: "var(--font-geist-mono)",
                          fontSize: "9px",
                          letterSpacing: "0.3em",
                          padding: "3px 10px",
                          border: "1px solid rgba(184,212,232,0.18)",
                          borderRadius: "2px",
                          textTransform: "uppercase",
                          animation: "incomingGlow 2.8s ease-in-out infinite",
                          display: "inline-block",
                        }}
                      >
                        Incoming
                      </span>
                    )}
                  </div>

                  {/* Period */}
                  <span
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "10px",
                      letterSpacing: "0.08em",
                      color: "rgba(240,240,240,0.62)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.period}
                  </span>
                </div>

                {/* Company name — secondary, sits below the role */}
                <p
                  style={{
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "rgba(240,240,240,0.72)",
                    letterSpacing: "0.01em",
                    marginBottom: "18px",
                  }}
                >
                  {entry.company}
                </p>

                {/* Description — INCOMING only, cold accent left border */}
                {entry.description && (
                  <p
                    style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: "13px",
                      fontWeight: 300,
                      color: "rgba(240,240,240,0.54)",
                      lineHeight: 1.78,
                      paddingLeft: "14px",
                      borderLeft: "1px solid rgba(184,212,232,0.22)",
                    }}
                  >
                    {entry.description}
                  </p>
                )}

                {/* Bullets */}
                {entry.bullets && (
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "9px",
                    }}
                  >
                    {entry.bullets.map((b, j) => (
                      <li
                        key={j}
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            fontSize: "11px",
                            color: "rgba(240,240,240,0.20)",
                            flexShrink: 0,
                            lineHeight: "1.72",
                          }}
                        >
                          —
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-geist-sans)",
                            fontSize: "13px",
                            fontWeight: 300,
                            color: "rgba(240,240,240,0.57)",
                            lineHeight: 1.72,
                          }}
                        >
                          {boldMetrics(b)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tech tags — flat monospace, dot-separated */}
                {entry.tech && (
                  <div style={{ marginTop: "16px" }}>
                    {entry.tech.map((t, j) => (
                      <span key={j}>
                        <span
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            fontSize: "10px",
                            letterSpacing: "0.04em",
                            color: "rgba(240,240,240,0.58)",
                          }}
                        >
                          {t}
                        </span>
                        {j < (entry.tech?.length ?? 0) - 1 && (
                          <span
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                              fontSize: "10px",
                              color: "rgba(240,240,240,0.14)",
                              margin: "0 9px",
                            }}
                          >
                            ·
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
