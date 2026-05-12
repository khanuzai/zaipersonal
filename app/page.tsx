"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import Hero from "@/components/Hero";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("zai_loaded");
    if (alreadySeen) {
      setLoaded(true);
    } else {
      setShowLoader(true);
    }
  }, []);

  const handleLoadComplete = useCallback(() => {
    sessionStorage.setItem("zai_loaded", "1");
    setLoaded(true);
  }, []);

  return (
    <>
      {showLoader && <LoadingScreen onComplete={handleLoadComplete} />}

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Hero />
      </motion.main>
    </>
  );
}
