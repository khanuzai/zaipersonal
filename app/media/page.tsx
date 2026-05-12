export default function MediaPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
        style={{
          fontSize: "clamp(180px, 30vw, 420px)",
          fontFamily: "var(--font-geist-mono)",
          fontWeight: 700,
          color: "rgba(240,240,240,0.034)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        08
      </div>
      <p
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "10px",
          letterSpacing: "0.38em",
          color: "rgba(240,240,240,0.28)",
          textTransform: "uppercase",
        }}
      >
        Media
      </p>
    </main>
  );
}
