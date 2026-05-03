"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const isHovering = useRef(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const springConfig = { stiffness: 900, damping: 42 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  // Dot follows instantly
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const hoverable = t.closest("a, button, [data-hover]");
      isHovering.current = !!hoverable;

      if (dotRef.current) {
        dotRef.current.style.transform = `scale(${hoverable ? 0 : 1})`;
      }
      if (ringRef.current) {
        ringRef.current.style.width = hoverable ? "40px" : "16px";
        ringRef.current.style.height = hoverable ? "40px" : "16px";
        ringRef.current.style.borderColor = hoverable
          ? "rgba(240,240,240,0.9)"
          : "rgba(240,240,240,0.5)";
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleOver);
    };
  }, [cursorX, cursorY, dotX, dotY]);

  return (
    <>
      {/* Dot — instant */}
      <motion.div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999]"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: "rgba(240,240,240,0.9)",
          transition: "transform 0.15s ease",
        }}
      />
      {/* Ring — spring-lagged */}
      <motion.div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[99998]"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "1px solid rgba(240,240,240,0.5)",
          transition: "width 0.2s ease, height 0.2s ease, border-color 0.2s ease",
        }}
      />
    </>
  );
}
