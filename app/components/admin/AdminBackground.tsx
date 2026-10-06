"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

type AdminBackgroundProps = {
  children: ReactNode;
};

export default function AdminBackground({
  children,
}: AdminBackgroundProps) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f8f1e9] text-[#2b160d]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 40, -20, 0],
                  y: [0, -30, 20, 0],
                  scale: [1, 1.1, 0.96, 1],
                }
          }
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-orange-300/25 blur-[110px]"
        />

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, -35, 20, 0],
                  y: [0, 30, -20, 0],
                  scale: [1, 0.94, 1.08, 1],
                }
          }
          transition={{
            duration: 24,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -bottom-48 left-[25%] h-[36rem] w-[36rem] rounded-full bg-amber-200/35 blur-[120px]"
        />

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.15, 0.28, 0.15],
                  scale: [1, 1.12, 1],
                }
          }
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute left-[45%] top-[22%] h-80 w-80 rounded-full bg-[#b85c24]/15 blur-[100px]"
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(84,38,16,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(84,38,16,0.35) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#f0d8c3]/30" />
      </div>

      {/* Complete admin application renders here */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}