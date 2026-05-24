"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Quote {
  text: string;
  lang: "en" | "ur";
}

const QUOTES: Quote[] = [
  { text: "good die young, fuck, im still alive !", lang: "en" },
  { text: "میرے ساتھ صرف میں اور میرا رب چل رہا ہے", lang: "ur" },
  { text: "loyalty is rare، وفادار کوئی نہیں ملتا", lang: "ur" },
  { text: "mera record dekh, im not to fuck around with !", lang: "en" },
  { text: "ضرورت اور خواہش میں فرق رکھتا ہوں", lang: "ur" },
  { text: "تجھے لگتا ہے سب کچھ بتا چکا میں، میں نے کاغذ پہ غم تو اتارے ہی نہیں", lang: "ur" },
  { text: "تیری محفلوں میں لوگ بہت، میری محفلوں میں سوگ بہت", lang: "ur" },
  { text: "ایک ہی گلی سے نکلے تھے میں اور وہ، اس کے گھر خوشی گئی میرے گھر غم گیا", lang: "ur" },
  { text: "تم پہ ایک اور نظم لکھی، بولو کیا عنوان رکھوں؟", lang: "ur" },
  { text: "میرے ساتھ صرف میں اور میرا رب چل رہا ہے", lang: "ur" },
  { text: "اس کے در پہ کوئی خواہش ادھوری نہیں ہوتی", lang: "ur" },
  { text: "تم آنے کی آواز جو دو، میں بھاری دسترخوان رکھوں", lang: "ur" },
  { text: "تم کو دیکھنے کے دس بہانے روز کرتے", lang: "ur" },
  { text: "مرد رکھ ہی نہیں سکتا کچھ ماں سے پہلے", lang: "ur" },
  { text: "١٢٥ کی ٹنکی سے پیٹرول تھا سونگھتا", lang: "ur" },
];

export default function Quotes() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRefs  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      quoteRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 50, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "power4.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
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
        paddingTop: "160px",
        paddingBottom: "160px",
      }}
    >
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
        quotes
      </motion.p>

      {/* Quotes list */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
        }}
      >
        {QUOTES.map((q, i) => (
          <React.Fragment key={i}>

            {/* Quote + glow wrapper */}
            <div
              ref={(el) => { quoteRefs.current[i] = el; }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "680px",
                textAlign: q.lang === "ur" ? "right" : "center",
              }}
            >
              {/* Radial glow — sits behind the text */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "-80px -100px",
                  background:
                    "radial-gradient(ellipse at center, rgba(240,240,240,0.045) 0%, transparent 68%)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              <p
                style={
                  q.lang === "ur"
                    ? {
                        position: "relative",
                        zIndex: 1,
                        fontFamily: "var(--font-urdu), serif",
                        fontSize: "26px",
                        color: "#E0E0E0",
                        fontWeight: 400,
                        lineHeight: 2.1,
                        direction: "rtl",
                      }
                    : {
                        position: "relative",
                        zIndex: 1,
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "19px",
                        color: "#E0E0E0",
                        fontWeight: 300,
                        lineHeight: 1.8,
                      }
                }
              >
                {q.text}
              </p>
            </div>

            {/* Divider — barely visible line between quotes */}
            {i < QUOTES.length - 1 && (
              <div
                style={{
                  width: "100%",
                  maxWidth: "680px",
                  padding: "80px 0",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "1px",
                    backgroundColor: "rgba(240,240,240,0.08)",
                  }}
                />
              </div>
            )}

          </React.Fragment>
        ))}

        {/* Footer */}
        <p
          style={{
            marginTop: "140px",
            fontFamily: "var(--font-geist-mono)",
            fontSize: "10px",
            color: "rgba(240,240,240,0.30)",
            letterSpacing: "0.22em",
            textAlign: "center",
          }}
        >
          — words that stayed
        </p>
      </div>
    </main>
  );
}
