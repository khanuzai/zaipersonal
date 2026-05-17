"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Project {
  number: string;
  name: string;
  description: string;
  bullets: string[];
  tech: string[];
  links: { label: string; href: string }[];
  tag?: string;
}

const PROJECTS: Project[] = [
  {
    number: "01",
    name: "Solar System",
    description:
      "an interactive 3d simulation of the solar system. built to feel like looking out a window, not reading a textbook.",
    bullets: [
      "real-time WebGL experience with all 8 planets, high-resolution textures, custom atmosphere and ring shaders",
      "cinematic intro camera, ambient audio, planet travel on click, autopilot tour mode",
      "built entirely with Three.js and vanilla JavaScript — no frameworks",
    ],
    tech: ["Three.js", "WebGL", "GLSL shaders", "Vite", "JavaScript"],
    links: [{ label: "live", href: "https://spacewebsite-seven.vercel.app" }],
    tag: "a zai production",
  },
  {
    number: "02",
    name: "BookPulse",
    description:
      "real-time book price intelligence — demand analytics and rarity scoring across 5 categories.",
    bullets: [
      "serverless AWS Lambda pipeline triggered hourly via EventBridge, storing raw data in S3 and computing rarity and demand scores across 100+ books",
      "containerized FastAPI backend on AWS ECS Fargate with PostgreSQL on RDS",
      "animated React dashboard with Chart.js visualizations, top movers table, and rarity leaderboard",
    ],
    tech: [
      "React",
      "TypeScript",
      "FastAPI",
      "PostgreSQL",
      "Docker",
      "AWS (Lambda · S3 · RDS · ECS · EventBridge)",
    ],
    links: [{ label: "github", href: "#" }],
  },
  {
    number: "03",
    name: "ASGS",
    description:
      "a full-stack cybersecurity risk modeling platform — quantifies how attack surface expands as complexity scales.",
    bullets: [
      "computes quadratic risk functions R(x) = ax² + bx + c and derivatives using NumPy to identify unsafe growth zones",
      "attack surface scoring engine across 5 threat categories with ranked driver breakdown and actionable recommendations",
      "real-time React dashboard with Recharts visualizing risk curves, growth rates, and danger zones",
    ],
    tech: [
      "Python",
      "React",
      "FastAPI",
      "SQLAlchemy",
      "NumPy",
      "SQLite",
      "Recharts",
      "Pydantic",
    ],
    links: [{ label: "github", href: "#" }],
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(cardRefs.current.filter(Boolean), {
        y: 80,
        opacity: 0,
        filter: "blur(6px)",
      });

      gsap.to(watermarkRef.current, {
        opacity: 1,
        scale: 1,
        duration: 2.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          once: true,
        },
      });

      cardRefs.current.filter(Boolean).forEach((card, i) => {
        gsap.to(card, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "power3.out",
          delay: i * 0.08,
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true,
          },
        });
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
      {/* Ghost watermark */}
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
          transform: "scale(1.08)",
        }}
      >
        03
      </div>

      {/* Section label */}
      <p
        style={{
          paddingLeft: "4rem",
          paddingRight: "4rem",
          fontFamily: "var(--font-geist-mono)",
          fontSize: "10px",
          letterSpacing: "0.38em",
          color: "rgba(240,240,240,0.28)",
          marginBottom: "80px",
          textTransform: "uppercase",
        }}
      >
        projects
      </p>

      {/* Cards stack */}
      <div
        style={{
          paddingLeft: "4rem",
          paddingRight: "4rem",
          display: "flex",
          flexDirection: "column",
          gap: "5rem",
        }}
      >
        {PROJECTS.map((project, i) => (
          <ProjectCard
            key={project.number}
            project={project}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>
    </section>
  );
}

import { forwardRef } from "react";

const ProjectCard = forwardRef<HTMLDivElement, { project: Project }>(
  function ProjectCard({ project }, ref) {
    return (
      <div
        ref={ref}
        className="project-card"
        style={{
          position: "relative",
          borderLeft: "1px solid rgba(240,240,240,0.06)",
          paddingLeft: "3rem",
          paddingTop: "2rem",
          paddingBottom: "2rem",
          transition: "border-color 0.4s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderLeftColor =
            "rgba(184,212,232,0.22)";
          const glow = e.currentTarget.querySelector(
            ".card-glow",
          ) as HTMLDivElement | null;
          if (glow) glow.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderLeftColor =
            "rgba(240,240,240,0.06)";
          const glow = e.currentTarget.querySelector(
            ".card-glow",
          ) as HTMLDivElement | null;
          if (glow) glow.style.opacity = "0";
        }}
      >
        {/* Left border glow */}
        <div
          className="card-glow"
          style={{
            position: "absolute",
            left: "-1px",
            top: 0,
            bottom: 0,
            width: "1px",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(184,212,232,0.5) 40%, rgba(184,212,232,0.5) 60%, transparent 100%)",
            filter: "blur(3px)",
            opacity: 0,
            transition: "opacity 0.4s ease",
            pointerEvents: "none",
          }}
        />

        {/* Header row: number + name | links */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          {/* Number + name */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "18px" }}>
            <span
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "11px",
                letterSpacing: "0.18em",
                color: "rgba(240,240,240,0.24)",
              }}
            >
              {project.number}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "clamp(22px, 3vw, 42px)",
                fontWeight: 700,
                color: "rgba(240,240,240,0.95)",
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              {project.name}
            </h2>
            {project.tag && (
              <span
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.22em",
                  color: "rgba(240,240,240,0.22)",
                  alignSelf: "center",
                  paddingTop: "2px",
                }}
              >
                {project.tag}
              </span>
            )}
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {project.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  color: "rgba(240,240,240,0.38)",
                  textDecoration: "none",
                  transition: "color 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(184,212,232,0.78)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(240,240,240,0.38)";
                }}
              >
                ↗ {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* One-line description */}
        <p
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "13px",
            fontWeight: 300,
            color: "rgba(240,240,240,0.40)",
            letterSpacing: "0.01em",
            lineHeight: 1.6,
            marginBottom: "28px",
            maxWidth: "640px",
          }}
        >
          {project.description}
        </p>

        {/* Bullets */}
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          {project.bullets.map((bullet, j) => (
            <li
              key={j}
              style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "11px",
                  color: "rgba(240,240,240,0.18)",
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
                  color: "rgba(240,240,240,0.55)",
                  lineHeight: 1.72,
                }}
              >
                {bullet}
              </span>
            </li>
          ))}
        </ul>

        {/* Tech stack */}
        <div>
          {project.tech.map((t, j) => (
            <span key={j}>
              <span
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.04em",
                  color: "rgba(240,240,240,0.36)",
                }}
              >
                {t}
              </span>
              {j < project.tech.length - 1 && (
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
      </div>
    );
  },
);
