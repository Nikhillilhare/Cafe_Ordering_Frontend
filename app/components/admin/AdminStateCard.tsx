"use client";

import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

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
  }
> = {
  indigo: {
    icon: "bg-indigo-500/15 text-indigo-300 ring-indigo-400/20",
    glow: "bg-indigo-500/10",
    line: "from-indigo-500 to-violet-500",
  },

  cyan: {
    icon: "bg-cyan-500/15 text-cyan-300 ring-cyan-400/20",
    glow: "bg-cyan-500/10",
    line: "from-cyan-500 to-blue-500",
  },

  emerald: {
    icon: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
    glow: "bg-emerald-500/10",
    line: "from-emerald-500 to-teal-500",
  },

  amber: {
    icon: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
    glow: "bg-amber-500/10",
    line: "from-amber-500 to-orange-500",
  },

  rose: {
    icon: "bg-rose-500/15 text-rose-300 ring-rose-400/20",
    glow: "bg-rose-500/10",
    line: "from-rose-500 to-pink-500",
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
  const reduceMotion: boolean = useReducedMotion() ?? false;
  const styles = toneStyles[tone];

  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 22,
              scale: 0.97,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        delay: reduceMotion ? 0 : index * 0.07,
        duration: 0.42,
        ease: "easeOut",
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -5,
              transition: {
                duration: 0.2,
              },
            }
      }
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/65 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6"
    >
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl transition duration-500 group-hover:scale-125",
          styles.glow,
        ].join(" ")}
      />

      <div
        className={[
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-70",
          styles.line,
        ].join(" ")}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <motion.p
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.9,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: reduceMotion ? 0 : 0.15 + index * 0.07,
              duration: 0.35,
            }}
            className="mt-3 text-3xl font-bold tracking-tight text-white"
          >
            {value}
          </motion.p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <motion.div
          whileHover={
            reduceMotion
              ? undefined
              : {
                  rotate: -6,
                  scale: 1.08,
                }
          }
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1",
            styles.icon,
          ].join(" ")}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
      </div>

      {trend && (
        <div
          className={[
            "relative mt-5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            trend.positive
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-rose-500/10 text-rose-300",
          ].join(" ")}
        >
          {trend.positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}

          {trend.label}
        </div>
      )}
    </motion.article>
  );
}