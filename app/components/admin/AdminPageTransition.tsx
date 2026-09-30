"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

type AdminPageTransitionProps = {
  children: ReactNode;
};

export default function AdminPageTransition({
  children,
}: AdminPageTransitionProps) {
  const pathname: string = usePathname() ?? "/admin";
  const reduceMotion: boolean = useReducedMotion() ?? false;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 14,
                filter: "blur(5px)",
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        exit={
          reduceMotion
            ? undefined
            : {
                opacity: 0,
                y: -8,
                filter: "blur(3px)",
              }
        }
        transition={{
          duration: reduceMotion ? 0 : 0.3,
          ease: "easeOut",
        }}
        className="min-h-0 flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}