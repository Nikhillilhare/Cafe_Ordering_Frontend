"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

type StatCardTone =
  | "indigo"
  | "cyan"
  | "emerald"
  | "amber"
  | "rose";

type AdminStatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: StatCardTone;
  index?: number;

  trend?: {
    label: string;
    positive: boolean;
  };
};

const toneStyles: Record<
  StatCardTone,
  {
    icon: string;
    glow: string;
    line: string;
    chart: string;
  }
> = {
  indigo: {
    icon: "bg-orange-100 text-[#9a4214]",
    glow: "bg-orange-200/50",
    line: "stroke-[#da6c24]",
    chart: "text-[#c65d1c]",
  },
  cyan: {
    icon: "bg-cyan-100 text-cyan-700",
    glow: "bg-cyan-200/45",
    line: "stroke-cyan-500",
    chart: "text-cyan-600",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-700",
    glow: "bg-emerald-200/45",
    line: "stroke-emerald-500",
    chart: "text-emerald-600",
  },
  amber: {
    icon: "bg-amber-100 text-amber-700",
    glow: "bg-amber-200/50",
    line: "stroke-amber-500",
    chart: "text-amber-600",
  },
  rose: {
    icon: "bg-rose-100 text-rose-700",
    glow: "bg-rose-200/50",
    line: "stroke-rose-500",
    chart: "text-rose-600",
  },
};

export default function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "indigo",
  index = 0,
  trend,
}: AdminStatCardProps) {
  const reduceMotion = useHydratedReducedMotion();
  const styles = toneStyles[tone];

  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 18,
              scale: 0.98,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        delay: reduceMotion ? 0 : index * 0.06,
        duration: 0.4,
        ease: "easeOut",
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -4,
              scale: 1.01,
            }
      }
      className="group relative min-h-36 overflow-hidden rounded-2xl border border-[#ead9ca] bg-white/80 p-5 shadow-[0_12px_35px_rgba(104,55,24,0.08)] backdrop-blur-xl"
    >
      <div
        className={[
          "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-70 blur-3xl transition duration-500 group-hover:scale-125",
          styles.glow,
        ].join(" ")}
      />

      <div className="relative flex h-full items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#76675d]">
            {title}
          </p>

          <motion.p
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.92,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: reduceMotion
                ? 0
                : 0.12 + index * 0.06,
            }}
            className="mt-1 text-3xl font-extrabold tracking-tight text-[#23140d]"
          >
            {value}
          </motion.p>

          {trend ? (
            <div
              className={[
                "mt-3 inline-flex items-center gap-1 text-xs font-bold",
                trend.positive
                  ? "text-emerald-600"
                  : "text-rose-600",
              ].join(" ")}
            >
              {trend.positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}

              {trend.label}
            </div>
          ) : (
            <p className="mt-3 max-w-32 text-xs leading-5 text-[#99887c]">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <motion.div
            whileHover={
              reduceMotion
                ? undefined
                : {
                    rotate: -5,
                    scale: 1.08,
                  }
            }
            className={[
              "flex h-12 w-12 items-center justify-center rounded-xl",
              styles.icon,
            ].join(" ")}
          >
            <Icon className="h-6 w-6" />
          </motion.div>

          <svg
            viewBox="0 0 72 34"
            className="h-8 w-16 overflow-visible opacity-80"
            aria-hidden="true"
          >
            <path
              d="M2 29C11 27 12 20 21 22C30 24 31 12 40 15C50 18 52 4 70 3"
              fill="none"
              className={styles.line}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M2 29C11 27 12 20 21 22C30 24 31 12 40 15C50 18 52 4 70 3"
              fill="none"
              className={styles.line}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.08"
            />
          </svg>
        </div>
      </div>
    </motion.article>
  );
}