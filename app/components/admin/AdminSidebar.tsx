"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  Grid2X2,
  LayoutDashboard,
  ListOrdered,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Settings,
  X,
} from "lucide-react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

import AdminLogoutButton from "./AdminLogoutButton";

import {
  CoffeeBeansArtwork,
  CoffeeCupArtwork,
} from "./CoffeeArtwork";

type AdminSidebarProps = {
  cafeName: string;
  adminName: string;
  adminRole: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onMobileClose: () => void;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ReceiptText,
  },
  {
    label: "Menu items",
    href: "/admin/menu",
    icon: ListOrdered,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Grid2X2,
  },
  {
    label: "Cafe settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

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

type SidebarContentProps = {
  cafeName: string;
  adminName: string;
  adminRole: string;
  collapsed: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
  onToggleCollapsed?: () => void;
  onCloseMobile?: () => void;
};

function SidebarContent({
  cafeName,
  adminName,
  adminRole,
  collapsed,
  mobile = false,
  onNavigate,
  onToggleCollapsed,
  onCloseMobile,
}: SidebarContentProps) {
  const pathname = usePathname() ?? "/admin";
  const reduceMotion = useHydratedReducedMotion();

  function isActive(href: string): boolean {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
  aria-hidden="true"
  className="pointer-events-none absolute inset-0 overflow-hidden"
>
  <CoffeeBeansArtwork className="absolute -right-40 top-[29%] h-64 w-[30rem] rotate-12 opacity-35" />

  <CoffeeBeansArtwork className="absolute -bottom-14 -left-36 h-72 w-[32rem] -rotate-12 opacity-25" />

  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#341507]/10 to-[#160904]/55" />
</div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 top-16 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="absolute -left-16 bottom-32 h-52 w-52 rounded-full bg-amber-700/25 blur-3xl" />

        
      
      </div>

      <div
        className={[
          "relative z-10 flex h-28 shrink-0 items-center border-b border-white/10",
          collapsed
            ? "justify-center px-3"
            : "justify-between px-5",
        ].join(" ")}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
        >
          <motion.div
  whileHover={
    reduceMotion
      ? undefined
      : {
          y: -3,
          scale: 1.04,
        }
  }
  className="relative h-16 w-20 shrink-0 overflow-visible sm:h-18 sm:w-24"
>
 <CoffeeCupArtwork className="absolute inset-0 h-full w-full overflow-visible drop-shadow-xl" />
</motion.div>

          {!collapsed && (
            <motion.div
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
              className="min-w-0"
            >
              <p className="truncate text-base font-bold text-white">
                {cafeName}
              </p>

              <p className="mt-0.5 text-xs text-orange-100/65">
                Admin workspace
              </p>
            </motion.div>
          )}
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close admin navigation"
            className="rounded-xl p-2 text-orange-100/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="relative z-10 flex-1 space-y-2 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <motion.div
              key={item.href}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -16,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: index * 0.05,
                duration: 0.3,
              }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={[
                  "group relative flex items-center overflow-hidden rounded-2xl text-sm font-semibold transition duration-300",
                  collapsed
                    ? "justify-center p-3.5"
                    : "gap-3 px-4 py-3.5",
                  active
                    ? "border border-orange-300/35 bg-gradient-to-r from-orange-500/45 to-orange-300/15 text-white shadow-lg shadow-black/20"
                    : "border border-transparent text-orange-50/75 hover:border-white/10 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {active && (
                  <motion.span
                    layoutId={
                      mobile
                        ? "mobile-coffee-active-nav"
                        : "coffee-active-nav"
                    }
                    className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-orange-300"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 35,
                    }}
                  />
                )}

                <Icon
                  className={[
                    "h-5 w-5 shrink-0 transition duration-300 group-hover:scale-110",
                    active
                      ? "text-orange-100"
                      : "text-orange-50/70",
                  ].join(" ")}
                />

                {!collapsed && <span>{item.label}</span>}
              </Link>
            </motion.div>
          );
        })}
      </nav>

            {!collapsed && (
  <motion.div
    initial={
      reduceMotion
        ? false
        : {
            opacity: 0,
            y:8,
          }
    }
    animate={{
      opacity: 1,
      y: 0,
    }}
    whileHover={
      reduceMotion
        ? undefined
        : {
            y: -2,
            scale:1.01,
          }
    }
    className="mb-3 flex items-center gap-3 rounded-2xl border border-white/[0.055] bg-gradient-to-r from-white/[0.07] to-orange-100/[0.025] p-3 shadow-[0_8px_22px_rgba(15,5,2,0.12)] ring-1 ring-inset ring-white/[0.02] backdrop-blur-md transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-[#2b1007]/75 via-[#4a1e0d]/45 to-transparent" />

    <CoffeeBeansArtwork className="absolute -bottom-16 -right-36 h-40 w-[22rem] rotate-6 opacity-25" />

   <CoffeeCupArtwork className="absolute -bottom-1 right-1 h-20 w-28 overflow-visible opacity-90 drop-shadow-xl sm:w-32" />

   <div className="relative z-10 max-w-[8rem] pr-2">
      <p className="text-sm font-bold leading-5 text-white/90">
        Good coffee brings great people
      </p>

      <p className="mt-1 text-[10px] font-medium text-orange-100/55">
        Fresh moments daily
      </p>
    </div>
  </motion.div>
)}

      <div className="relative z-10 shrink-0 bg-gradient-to-b from-transparent via-black/[0.035] to-black/15 p-3 pt-2 backdrop-blur-sm">
        {!collapsed && (
          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 8,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-3 flex items-center gap-3 rounded-2xl border border-white/[0.055] bg-gradient-to-r from-white/[0.07] to-orange-100/[0.025] p-3 shadow-[0_8px_22px_rgba(15,5,2,0,12)] ring-1 ring-inset ring-white/[0.02] backdrop-blur-md transition-all duration-300"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-200/15 bg-gradient-to-br from-[#ee8a2d] to-[#a94816] text-sm font-bold text-white shadow-[0_6px_16px_rgba(30,10,2,0.22)]">
              {getInitials(adminName)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {adminName}
              </p>

              <p className="mt-0.5 text-xs text-orange-100/60">
                {formatRole(adminRole)}
              </p>
            </div>
          </motion.div>
        )}

        <AdminLogoutButton compact={collapsed} />

        {!mobile && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={
              collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className={[
              "mt-2 flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-orange-100/60 transition hover:bg-white/10 hover:text-white",
              collapsed ? "justify-center" : "gap-3",
            ].join(" ")}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminSidebar({
  cafeName,
  adminName,
  adminRole,
  collapsed,
  mobileOpen,
  onCollapsedChange,
  onMobileClose,
}: AdminSidebarProps) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 88 : 286,
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="sticky top-0 z-40 hidden h-dvh shrink-0 self-start flex-col overflow-hidden rounded-r-[2rem] border-r border-orange-200/15 bg-[linear-gradient(160deg,#2a1209_0%,#542510_48%,#241006_100%)] shadow-[18px_0_45px_rgba(68,29,10,0.20)] lg:flex"
      >
        <SidebarContent
          cafeName={cafeName}
          adminName={adminName}
          adminRole={adminRole}
          collapsed={collapsed}
          onToggleCollapsed={() =>
            onCollapsedChange(!collapsed)
          }
        />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-[80] bg-[#241006]/55 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={
                reduceMotion
                  ? false
                  : {
                      x: "-100%",
                    }
              }
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 34,
              }}
              className="fixed inset-y-0 left-0 z-[90] flex w-[min(90vw,360px)] flex-col overflow-hidden rounded-r-[2rem] border-r border-orange-200/20 bg-[linear-gradient(160deg,#2a1209_0%,#542510_48%,#241006_100%)] shadow-2xl lg:hidden"
            >
              <SidebarContent
                cafeName={cafeName}
                adminName={adminName}
                adminRole={adminRole}
                collapsed={false}
                mobile
                onNavigate={onMobileClose}
                onCloseMobile={onMobileClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}