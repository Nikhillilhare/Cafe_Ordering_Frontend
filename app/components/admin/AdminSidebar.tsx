"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  Coffee,
  Grid2X2,
  LayoutDashboard,
  ListOrdered,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Settings,
  X,
} from "lucide-react";

import AdminLogoutButton from "./AdminLogoutButton";

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
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  function isActive(href: string): boolean {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      <div
        className={[
          "flex h-20 items-center border-b border-white/10",
          collapsed ? "justify-center px-3" : "justify-between px-5",
        ].join(" ")}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
        >
          <motion.div
            whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.06 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/40"
          >
            <Coffee className="h-5 w-5 text-white" />
          </motion.div>

          {!collapsed && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0"
            >
              <p className="truncate font-bold text-white">
                {cafeName}
              </p>

              <p className="text-xs text-slate-500">Admin workspace</p>
            </motion.div>
          )}
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-3">
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
                      x: -14,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: index * 0.055,
                duration: 0.3,
              }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={[
                  "group relative flex items-center rounded-xl text-sm font-semibold transition duration-200",
                  collapsed
                    ? "justify-center p-3"
                    : "gap-3 px-4 py-3",
                  active
                    ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-indigo-200"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
                ].join(" ")}
              >
                {active && (
                  <motion.span
                    layoutId={mobile ? "mobile-active-nav" : "active-nav"}
                    className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-indigo-400"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 34,
                    }}
                  />
                )}

                <Icon
                  className={[
                    "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    active ? "text-indigo-300" : "",
                  ].join(" ")}
                />

                {!collapsed && <span>{item.label}</span>}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
          >
            <p className="truncate text-sm font-semibold text-white">
              {adminName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatRole(adminRole)}
            </p>
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
              "mt-2 flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-white/[0.05] hover:text-white",
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
    </>
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
  const reduceMotion = useReducedMotion();

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 272,
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-slate-950/75 backdrop-blur-2xl lg:flex"
      >
        <SidebarContent
          cafeName={cafeName}
          adminName={adminName}
          adminRole={adminRole}
          collapsed={collapsed}
          onToggleCollapsed={() => onCollapsedChange(!collapsed)}
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
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
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
              className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] flex-col border-r border-white/10 bg-slate-950/95 shadow-2xl shadow-black/60 backdrop-blur-2xl lg:hidden"
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