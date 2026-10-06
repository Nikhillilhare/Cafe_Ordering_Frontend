"use client";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  PackageCheck,
  Phone,
  ReceiptText,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

import type {
  AdminOrderData,
  AdminOrderStatus,
} from "@/lib/client/adminOrders";

type AdminOrderDetailsDrawerProps = {
  order: AdminOrderData | null;
  isUpdating: boolean;
   isUpdatingPayment: boolean;
  error: string | null;
  onClose: () => void;
  onUpdateStatus: (
    status: AdminOrderStatus,
  ) => void | Promise<void>;
  onMarkPaymentPaid: () => void | Promise<void>;
};

const allowedTransitions: Record<
  AdminOrderStatus,
  readonly AdminOrderStatus[]
> = {
  NEW: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const statusButtonLabels: Record<
  AdminOrderStatus,
  string
> = {
  NEW: "Mark as new",
  ACCEPTED: "Accept order",
  PREPARING: "Start preparing",
  READY: "Mark as ready",
  COMPLETED: "Complete order",
  CANCELLED: "Cancel order",
};

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
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

function getShortOrderId(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "PAID":
    case "COMPLETED":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";

    case "READY":
      return "border-cyan-400/20 bg-cyan-500/10 text-cyan-300";

    case "PREPARING":
      return "border-amber-400/20 bg-amber-500/10 text-amber-300";

    case "FAILED":
    case "CANCELLED":
      return "border-rose-400/20 bg-rose-500/10 text-rose-300";

    default:
      return "border-indigo-400/20 bg-indigo-500/10 text-indigo-300";
  }
}

export default function AdminOrderDetailsDrawer({
   order,
  isUpdating,
  isUpdatingPayment,
  error,
  onClose,
  onUpdateStatus,
  onMarkPaymentPaid,
}: AdminOrderDetailsDrawerProps) {
  const reduceMotion = useHydratedReducedMotion();

  const busy = isUpdating || isUpdatingPayment;
  useEffect(() => {
    if (!order) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [order, busy, onClose]);

  const nextStatuses = order
    ? allowedTransitions[order.orderStatus]
    : [];

    const canManuallyMarkPaid =
  order !== null &&
  order.paymentStatus !== "PAID" &&
  (order.paymentMethod === "WHATSAPP" ||
    order.paymentMethod === "CASH");    

  return createPortal (
    <AnimatePresence>
      {order && (
        <>
          <motion.button
            type="button"
            aria-label="Close order details"
            initial={false}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
             transition={{
             duration: 0.2,
            }}
            onClick={() => {
              if (!busy) {
                onClose();
              }
            }}
           className="fixed inset-0 z-[90] cursor-default bg-black/65 backdrop-blur-sm"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-drawer-title"
            initial={false}
animate={{
  opacity: 1,
  x: 0,
}}
exit={{
  opacity: 0,
  x: 48,
}}
transition={{
  duration: 0.25,
  ease: "easeOut",
}}
            className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-xl flex-col border-l border-white/10 bg-slate-950 shadow-2xl shadow-black/60"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                  Order details
                </p>

                <h2
                  id="order-drawer-title"
                  className="mt-2 text-2xl font-bold text-white"
                >
                  #{getShortOrderId(order.id)}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                aria-label="Close order details"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              <section className="grid grid-cols-2 gap-3">
                <div
                  className={[
                    "rounded-2xl border p-4",
                    getStatusClasses(order.orderStatus),
                  ].join(" ")}
                >
                  <p className="text-xs opacity-70">Order status</p>

                  <p className="mt-1 font-bold">
                    {formatStatus(order.orderStatus)}
                  </p>
                </div>

                <div
                  className={[
                    "rounded-2xl border p-4",
                    getStatusClasses(order.paymentStatus),
                  ].join(" ")}
                >
                  <p className="text-xs opacity-70">
                    Payment status
                  </p>

                  <p className="mt-1 font-bold">
                    {formatStatus(order.paymentStatus)}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <UserRound className="h-4 w-4 text-indigo-300" />
                  Customer
                </div>

                <p className="mt-4 text-lg font-bold text-white">
                  {order.customerName}
                </p>

                <a
                  href={`tel:${order.customerPhone}`}
                  className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-indigo-300"
                >
                  <Phone className="h-4 w-4" />
                  {order.customerPhone}
                </a>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <ReceiptText className="h-4 w-4 text-indigo-300" />
                    Order items
                  </div>

                  <span className="text-xs text-slate-500">
                    {order.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}{" "}
                    items
                  </span>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {item.itemName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.quantity} ×{" "}
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>

                      <p className="font-bold text-slate-200">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="font-semibold text-slate-300">
                    Total
                  </span>

                  <span className="text-xl font-bold text-white">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CreditCard className="h-4 w-4" />
                    Payment method
                  </div>

                  <p className="mt-2 font-semibold text-white">
                    {formatStatus(order.paymentMethod)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    Last updated
                  </div>

                  <p className="mt-2 text-sm font-semibold text-white">
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
              </section>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200"
                >
                  {error}
                </div>
              )}
            </div>

           <footer className="border-t border-white/10 bg-slate-950/90 p-5 sm:p-6">
  <div className="mb-5">
    {canManuallyMarkPaid && (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
            <Banknote className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">
              Manual payment verification
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Confirm only after receiving and verifying the
              customer&apos;s{" "}
              {formatStatus(order.paymentMethod)} payment.
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          disabled={busy}
          onClick={() => void onMarkPaymentPaid()}
          whileTap={
            reduceMotion
              ? undefined
              : {
                  scale: 0.98,
                }
          }
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUpdatingPayment ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Verifying payment…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Mark payment as paid
            </>
          )}
        </motion.button>
      </div>
    )}

    {order.paymentStatus === "PAID" && (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
        <ShieldCheck className="h-5 w-5" />
        Payment verified
      </div>
    )}

    {order.paymentMethod === "UPI" &&
      order.paymentStatus !== "PAID" && (
        <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-200">
          Online UPI payment status is controlled by the payment gateway
          and cannot be changed manually.
        </div>
      )}
  </div>

  {nextStatuses.length > 0 ? (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        Update order status
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {nextStatuses.map((status) => {
          const cancelling = status === "CANCELLED";

          return (
            <motion.button
              key={status}
              type="button"
              disabled={busy}
              onClick={() => void onUpdateStatus(status)}
              whileTap={
                reduceMotion
                  ? undefined
                  : {
                      scale: 0.97,
                    }
              }
              className={[
                "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                cancelling
                  ? "border border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/15"
                  : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/30",
              ].join(" ")}
            >
              {isUpdating ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : cancelling ? (
                <XCircle className="h-4 w-4" />
              ) : status === "COMPLETED" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <PackageCheck className="h-4 w-4" />
              )}

              {statusButtonLabels[status]}
            </motion.button>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-slate-400">
      {order.orderStatus === "COMPLETED" ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      ) : (
        <XCircle className="h-5 w-5 text-rose-400" />
      )}

      This order is {formatStatus(order.orderStatus)}.
    </div>
  )}
</footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
     document.body,
  );
}