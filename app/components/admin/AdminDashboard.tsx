"use client";

import Link from "next/link";
import {
  motion,
  type Variants,
} from "motion/react";
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  IndianRupee,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

import AdminStatCard from "./AdminStatCard";
import { CoffeeBeansArtwork } from "./CoffeeArtwork";

export type DashboardStatistics = {
  totalOrders: number;
  newOrders: number;
  paidOrders: number;
  totalRevenue: number;
};

export type DashboardRecentOrder = {
  id: string;
  customerName: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
};

type AdminDashboardProps = {
  adminName: string;
  cafeName: string;
  statistics: DashboardStatistics;
  recentOrders: DashboardRecentOrder[];
};

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function getShortOrderId(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => {
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function getOrderStatusClasses(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";

    case "READY":
      return "bg-sky-100 text-sky-700";

    case "PREPARING":
      return "bg-blue-100 text-blue-700";

    case "CANCELLED":
      return "bg-rose-100 text-rose-700";

    case "ACCEPTED":
      return "bg-violet-100 text-violet-700";

    default:
      return "bg-orange-100 text-orange-700";
  }
}

function getPaymentStatusClasses(status: string): string {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700";

    case "FAILED":
      return "bg-rose-100 text-rose-700";

    case "CANCELLED":
      return "bg-orange-100 text-orange-700";

    case "REFUNDED":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

const recentOrdersContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
};

const recentOrderItem: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: "easeOut",
    },
  },
};

export default function AdminDashboard({
  adminName,
  cafeName,
  statistics,
  recentOrders,
}: AdminDashboardProps) {
  const reduceMotion = useHydratedReducedMotion();

  const firstName =
    adminName.trim().split(/\s+/)[0] || "Admin";

  return (
    <div className="space-y-6">
      <motion.section
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 16,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.42,
          ease: "easeOut",
        }}
        className="relative overflow-hidden rounded-3xl border border-[#e7d4c4] bg-[linear-gradient(120deg,rgba(255,253,250,0.96),rgba(255,242,228,0.88),rgba(227,178,137,0.62))] p-6 shadow-[0_18px_45px_rgba(99,51,22,0.10)] backdrop-blur-xl sm:p-7"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 12, 0],
                  y: [0, -5, 0],
                }
          }
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-24 -top-20 h-72 w-[36rem] opacity-55"
        >
          <CoffeeBeansArtwork className="h-full w-full" />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#fffaf5] via-[#fffaf5]/90 to-transparent" />

        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#c05b1f]">
            {cafeName}
          </p>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#2a160d] sm:text-4xl">
            Welcome back, {firstName}.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75665d] sm:text-base">
            Here is the latest overview of your cafe orders,
            payments and customer activity.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#9c4517] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-900/15 transition hover:-translate-y-0.5 hover:bg-[#7d3511]"
            >
              Manage orders

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/admin/menu"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d9c3b2] bg-white/70 px-4 py-2.5 text-sm font-bold text-[#4a2818] transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50"
            >
              Manage menu
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Total orders"
          value={statistics.totalOrders}
          description="All orders received by this cafe"
          icon={ReceiptText}
          tone="indigo"
          index={0}
        />

        <AdminStatCard
          title="New orders"
          value={statistics.newOrders}
          description="Orders waiting for admin action"
          icon={Clock3}
          tone="amber"
          index={1}
        />

        <AdminStatCard
          title="Paid orders"
          value={statistics.paidOrders}
          description="Successfully completed payments"
          icon={CircleDollarSign}
          tone="emerald"
          index={2}
        />

        <AdminStatCard
          title="Paid revenue"
          value={formatCurrency(statistics.totalRevenue)}
          description="Revenue from paid orders"
          icon={IndianRupee}
          tone="cyan"
          index={3}
        />
      </section>

      <motion.section
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 18,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: reduceMotion ? 0 : 0.16,
          duration: 0.42,
        }}
        className="overflow-hidden rounded-3xl border border-[#e7d8cc] bg-white/80 shadow-[0_16px_45px_rgba(93,48,21,0.09)] backdrop-blur-xl"
      >
        <div className="flex flex-col gap-4 border-b border-[#eee0d5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#2b160d]">
              Recent orders
            </h2>

            <p className="mt-1 text-sm text-[#88776c]">
              Latest orders received by {cafeName}.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="group inline-flex items-center gap-2 text-sm font-bold text-[#ad4c17] transition hover:text-[#7d3511]"
          >
            View all orders

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <ShoppingBag className="h-6 w-6" />
            </div>

            <h3 className="mt-4 font-bold text-[#2b160d]">
              No orders yet
            </h3>

            <p className="mt-2 text-sm text-[#88776c]">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          <motion.div
            variants={
              reduceMotion
                ? undefined
                : recentOrdersContainer
            }
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "visible"}
            className="divide-y divide-[#eee0d5]"
          >
            {recentOrders.map((order) => (
              <motion.div
                key={order.id}
                variants={
                  reduceMotion
                    ? undefined
                    : recentOrderItem
                }
                className="group grid gap-4 px-5 py-4 transition hover:bg-orange-50/65 sm:px-6 lg:grid-cols-[1.2fr_0.65fr_0.9fr_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-[#a94917]">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#2b160d]">
                        {order.customerName}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-[#918075]">
                        #{getShortOrderId(order.id)} ·{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#99887c]">
                    Order total
                  </p>

                  <p className="mt-1 font-extrabold text-[#24130c]">
                    {formatCurrency(order.totalAmount)}
                  </p>

                  <p className="mt-1 text-xs text-[#99887c]">
                    {formatStatus(order.paymentMethod)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold",
                      getOrderStatusClasses(order.orderStatus),
                    ].join(" ")}
                  >
                    {formatStatus(order.orderStatus)}
                  </span>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold",
                      getPaymentStatusClasses(
                        order.paymentStatus,
                      ),
                    ].join(" ")}
                  >
                    {formatStatus(order.paymentStatus)}
                  </span>
                </div>

                <Link
                  href={`/admin/orders?order=${encodeURIComponent(
                    order.id,
                  )}`}
                  className="inline-flex items-center justify-center rounded-xl border border-[#dfcbbb] bg-white px-3 py-2 text-sm font-bold text-[#6f3416] transition hover:border-orange-400 hover:bg-orange-50"
                >
                  Details
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}