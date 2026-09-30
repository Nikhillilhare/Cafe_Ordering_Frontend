"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
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

import AdminStatCard from "./AdminStatCard";

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
    year: "numeric",
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
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";

    case "READY":
      return "border-cyan-400/20 bg-cyan-500/10 text-cyan-300";

    case "PREPARING":
      return "border-amber-400/20 bg-amber-500/10 text-amber-300";

    case "CANCELLED":
      return "border-rose-400/20 bg-rose-500/10 text-rose-300";

    default:
      return "border-indigo-400/20 bg-indigo-500/10 text-indigo-300";
  }
}

function getPaymentStatusClasses(status: string): string {
  switch (status) {
    case "PAID":
      return "bg-emerald-500/10 text-emerald-300";

    case "FAILED":
      return "bg-rose-500/10 text-rose-300";

    case "CANCELLED":
      return "bg-amber-500/10 text-amber-300";

    case "REFUNDED":
      return "bg-violet-500/10 text-violet-300";

    default:
      return "bg-slate-500/10 text-slate-400";
  }
}

const recentOrdersContainer: Variants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const recentOrderItem: Variants = {
  hidden: {
    opacity: 0,
    x: -16,
  },

  visible: {
    opacity: 1,
    x: 0,

    transition: {
      duration: 0.35,
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
  const reduceMotion: boolean = useReducedMotion() ?? false;

  const firstName =
    adminName.trim().split(/\s+/)[0] || "Admin";

  return (
    <div className="space-y-8">
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
          duration: 0.45,
          ease: "easeOut",
        }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/15 via-slate-900/75 to-cyan-500/10 p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-8"
      >
        <motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 30, 0],
                  y: [0, -18, 0],
                  scale: [1, 1.08, 1],
                }
          }
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
            {cafeName}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back, {firstName}.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Here is the latest overview of your cafe orders,
            payments and customer activity.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              Manage orders

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/admin/menu"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-indigo-500/10"
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
                y: 24,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: reduceMotion ? 0 : 0.2,
          duration: 0.45,
          ease: "easeOut",
        }}
        className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/65 shadow-xl shadow-black/10 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Recent orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest orders received by {cafeName}.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
          >
            View all orders

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, -7, 0],
                    }
              }
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300"
            >
              <ShoppingBag className="h-7 w-7" />
            </motion.div>

            <h3 className="mt-5 font-semibold text-white">
              No orders yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
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
            className="divide-y divide-white/10"
          >
            {recentOrders.map((order) => (
              <motion.div
                key={order.id}
                variants={
                  reduceMotion ? undefined : recentOrderItem
                }
                className="group grid gap-4 px-5 py-5 transition hover:bg-white/[0.025] sm:px-6 lg:grid-cols-[1fr_0.65fr_0.9fr_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 transition group-hover:scale-105 group-hover:bg-indigo-500/20">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {order.customerName}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        #{getShortOrderId(order.id)} ·{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Order total
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {formatCurrency(order.totalAmount)}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {formatStatus(order.paymentMethod)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={[
                      "rounded-full border px-2.5 py-1 text-xs font-semibold",
                      getOrderStatusClasses(order.orderStatus),
                    ].join(" ")}
                  >
                    {formatStatus(order.orderStatus)}
                  </span>

                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
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
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
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