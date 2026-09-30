"use client";

import { motion, useReducedMotion } from "motion/react";

type AdminBackgroundProps = {
  children: React.ReactNode;
};

export default function AdminBackground({
  children,
}: AdminBackgroundProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.10) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 90%)",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 50, 10, 0],
                y: [0, 20, 60, 0],
                scale: [1, 1.12, 0.96, 1],
              }
        }
        transition={{
          duration: 14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -40, -10, 0],
                y: [0, -30, 40, 0],
                scale: [1, 0.94, 1.1, 1],
              }
        }
        transition={{
          duration: 16,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 35, -25, 0],
                y: [0, -25, -10, 0],
              }
        }
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}