"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function AmbientUi() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.2 });

  useEffect(() => {
    if (reduceMotion || sessionStorage.getItem("aa-intro-seen")) return;
    let timeoutId = 0;
    const frameId = window.requestAnimationFrame(() => {
      setVisible(true);
      timeoutId = window.setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("aa-intro-seen", "1");
      }, 900);
    });
    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [reduceMotion]);

  return (
    <>
      <motion.div className="fixed left-0 top-0 z-[100] h-[2px] w-full origin-left bg-[linear-gradient(90deg,#0077b8,#20c4e8)]" style={{ scaleX }} />
      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed inset-0 z-[120] grid place-items-center bg-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.78 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="relative h-28 w-40">
              <Image src="/brand/aa-mark.png" alt="AA Design & Media" fill sizes="160px" className="object-contain" priority />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
