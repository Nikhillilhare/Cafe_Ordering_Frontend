"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  Menu,
  ShieldCheck,
} from "lucide-react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

import {
  CoffeeBeansArtwork,
  CoffeeCupArtwork,
} from "./CoffeeArtwork";
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
    title: "Menu Items",
    description: "Manage prices, availability and menu details.",
  },
  "/admin/categories": {
    title: "Categories",
    description: "Organize the sections of your cafe menu.",
  },
  "/admin/settings": {
    title: "Cafe Settings",
    description: "Update cafe branding and ordering preferences.",
  },
};

function formatRole(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => {
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "A";
}

export default function AdminHeader({
  cafeName,
  cafeSlug,
  adminName,
  adminRole,
  onOpenMobileNavigation,
}: AdminHeaderProps) {
  const pathname = usePathname() ?? "/admin";
  const reduceMotion = useHydratedReducedMotion();

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
      className="sticky top-0 z-30 overflow-hidden border-b border-[#dfcbbb]/80 bg-[#fffaf5]/85 px-4 py-5 shadow-[0_8px_28px_rgba(87,42,18,0.08)] backdrop-blur-2xl sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-[#fffaf5] via-[#fff7ef]/90 to-[#d4a47d]/45" />

  <motion.div
    animate={
      reduceMotion
        ? undefined
        : {
            x: [0, 14, 0],
            y: [0, -5, 0],
          }
    }
    transition={{
      duration: 10,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    }}
    className="absolute -right-12 -top-14 h-56 w-[34rem] opacity-75"
  >
    <CoffeeBeansArtwork className="h-full w-full" />
  </motion.div>

  <div className="absolute inset-0 bg-gradient-to-r from-[#fffaf5] via-[#fffaf5]/75 to-transparent" />
</div>

      <div className="relative flex items-center justify-between gap-4">
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dfcbbb] bg-white/80 text-[#542510] shadow-sm transition hover:border-orange-300 hover:bg-orange-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          <div className="relative hidden h-14 w-16 shrink-0 sm:block lg:hidden">
  <CoffeeCupArtwork className="absolute inset-0 h-full w-full drop-shadow-md" />
</div>

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
              className="truncate text-2xl font-extrabold tracking-tight text-[#2b160d] sm:text-3xl"
            >
              {currentPage.title}
            </motion.h1>

            <p className="hidden truncate text-sm text-[#68707a] sm:block">
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
              className="hidden items-center gap-2 rounded-2xl border border-[#dfcbbb] bg-white/80 px-5 py-3 text-sm font-bold text-[#3c2013] shadow-[0_8px_20px_rgba(101,48,19,0.08)] transition hover:border-orange-300 hover:bg-orange-50 md:flex"
            >
              View cafe
              <ExternalLink className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.button
            type="button"
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -2,
                  }
            }
            whileTap={
              reduceMotion
                ? undefined
                : {
                    scale: 0.95,
                  }
            }
            aria-label="Notifications"
            className="relative hidden h-12 w-12 items-center justify-center rounded-2xl border border-[#dfcbbb] bg-white/80 text-[#4a2818] shadow-sm transition hover:border-orange-300 hover:bg-orange-50 sm:flex"
          >
            <Bell className="h-5 w-5" />

            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </motion.button>

          <motion.div
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -2,
                  }
            }
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#dfcbbb] bg-white/85 p-1.5 pr-3 shadow-[0_8px_20px_rgba(101,48,19,0.08)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-[#9d4214] text-sm font-bold text-white shadow-lg shadow-orange-900/20">
              {getInitials(adminName)}
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-40 truncate text-sm font-bold text-[#2f190f]">
                {adminName}
              </p>

              <div className="flex items-center gap-1 text-xs text-[#68707a]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                {formatRole(adminRole)}
              </div>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-[#765541] sm:block" />
          </motion.div>
        </div>
      </div>

      <div className="relative mt-3 flex items-center justify-between border-t border-[#eaded4] pt-3 sm:hidden">
        <p className="truncate text-xs font-semibold text-[#765541]">
          {cafeName}
        </p>

        <Link
          href={`/cafe/${cafeSlug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-bold text-[#b4531d]"
        >
          View cafe
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </motion.header>
  );
}