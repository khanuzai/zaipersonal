"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { href: "/about",      label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects",   label: "Projects" },
  { href: "/resume",     label: "Resume" },
  { href: "/gallery",    label: "Gallery" },
  { href: "/friends",    label: "Friends" },
  { href: "/media",      label: "Media" },
  { href: "/quotes",     label: "Quotes" },
  { href: "/links",      label: "Links" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-8 py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
    >
      <Link
        href="/"
        className="font-mono text-[11px] tracking-[0.3em] text-off-white/80 hover:text-off-white transition-colors duration-200 uppercase shrink-0"
      >
        ZAI
      </Link>
      <ul className="flex items-center gap-6">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`font-mono text-[11px] tracking-[0.18em] transition-colors duration-200 uppercase ${
                  active
                    ? "text-off-white/90"
                    : "text-off-white/60 hover:text-off-white"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
