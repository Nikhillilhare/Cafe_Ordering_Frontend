"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ExternalLink,
  Menu,
  ShieldCheck,
} from "lucide-react";

type AdminHeaderProps = {
  cafeName: string;
  cafeSlug: string;
  adminName: string;
  adminRole: string;
  onOpenMobileNavigation: () => void;
};

type PageDetails = {
  title: string;
  description: string;
};

const pageDetails: Record<string, PageDetails> = {
  "/admin": {
    title: "Dashboard",
    description: "An overview of your cafe operations.",
  },

  "/admin/orders": {
    title: "Orders",
    description: "Review and update customer orders.",
  },

  "/admin/menu": {
    title: "Menu items",
    description: "Manage prices, availability and menu details.",
  },

  "/admin/categories": {
    title: "Categories",
    description: "Organize the sections of your cafe menu.",
  },

  "/admin/settings": {
    title: "Cafe settings",
    description: "Update cafe branding and ordering preferences.",
  },
};

function formatRole(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "A";
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function AdminHeader({
  cafeName,
  cafeSlug,
  adminName,
  adminRole,
  onOpenMobileNavigation,
}: AdminHeaderProps) {
  const pathname: string = usePathname() ?? "/admin";
  const reduceMotion: boolean = useReducedMotion() ?? false;

  const currentPage =
    pageDetails[pathname] ?? pageDetails["/admin"];

  return (
    <motion.header
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: -14,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <motion.button
            type="button"
            onClick={onOpenMobileNavigation}
            whileTap={
              reduceMotion
                ? undefined
                : {
                    scale: 0.92,
                  }
            }
            aria-label="Open admin navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          <div className="min-w-0">
            <motion.h1
              key={`${pathname}-title`}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -8,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="truncate text-xl font-bold text-white sm:text-2xl"
            >
              {currentPage.title}
            </motion.h1>

            <p className="hidden truncate text-sm text-slate-500 sm:block">
              {currentPage.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -2,
                  }
            }
          >
            <Link
              href={`/cafe/${cafeSlug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white md:flex"
            >
              View cafe
              <ExternalLink className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="hidden h-8 w-px bg-white/10 sm:block" />

          <motion.div
            whileHover={
              reduceMotion
                ? undefined
                : {
                    scale: 1.02,
                  }
            }
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-1.5 pr-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-950/40">
              {getInitials(adminName)}
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-32 truncate text-sm font-semibold text-white">
                {adminName}
              </p>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                {formatRole(adminRole)}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between sm:hidden">
        <p className="truncate text-xs text-slate-500">
          {cafeName}
        </p>

        <Link
          href={`/cafe/${cafeSlug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-300"
        >
          View cafe
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </motion.header>
  );
}