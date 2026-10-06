"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "READY":
      return "border-sky-200 bg-sky-50 text-sky-700";

    case "PREPARING":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "ACCEPTED":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "FAILED":
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "REFUNDED":
      return "border-slate-200 bg-slate-50 text-slate-600";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-orange-200 bg-orange-50 text-orange-700";
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

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
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

  const totalQuantity =
    order?.items.reduce(
      (total, item) => total + item.quantity,
      0,
    ) ?? 0;

  return createPortal(
    <AnimatePresence>
      {order && (
        <>
          <motion.button
            type="button"
            aria-label="Close order details"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() => {
              if (!busy) {
                onClose();
              }
            }}
            className="fixed inset-0 z-[90] cursor-default bg-[#2a1309]/35 backdrop-blur-[3px]"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-drawer-title"
            initial={
              reduceMotion
                ? false
                : {
                    x: "100%",
                  }
            }
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 34,
            }}
            className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-2xl flex-col border-l border-[#e4d0bf] bg-[#fffaf5] shadow-[-22px_0_60px_rgba(54,24,8,0.22)]"
          >
            <header className="relative overflow-hidden border-b border-[#eadbcf] bg-gradient-to-br from-white via-orange-50/80 to-[#f3d2b7]/70 p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-orange-300/25 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#ba531b]">
                    Order details
                  </p>

                  <h2
                    id="order-drawer-title"
                    className="mt-2 text-2xl font-extrabold text-[#29160d]"
                  >
                    #{getShortOrderId(order.id)}
                  </h2>

                  <p className="mt-1 text-sm text-[#827066]">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={onClose}
                  aria-label="Close order details"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfcbbb] bg-white/80 text-[#765849] shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-[#9c4517] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative mt-5 grid grid-cols-2 gap-3">
                <div
                  className={[
                    "rounded-2xl border p-4",
                    getStatusClasses(
                      order.orderStatus,
                    ),
                  ].join(" ")}
                >
                  <p className="text-xs font-medium opacity-75">
                    Order status
                  </p>

                  <p className="mt-1 font-extrabold">
                    {formatStatus(
                      order.orderStatus,
                    )}
                  </p>
                </div>

                <div
                  className={[
                    "rounded-2xl border p-4",
                    getStatusClasses(
                      order.paymentStatus,
                    ),
                  ].join(" ")}
                >
                  <p className="text-xs font-medium opacity-75">
                    Payment status
                  </p>

                  <p className="mt-1 font-extrabold">
                    {formatStatus(
                      order.paymentStatus,
                    )}
                  </p>
                </div>
              </div>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-5 [scrollbar-width:thin] [scrollbar-color:#d7bba5_transparent] sm:p-6">
              <section className="rounded-2xl border border-[#eadbcf] bg-white p-5 shadow-[0_8px_24px_rgba(83,42,18,0.05)]">
                <div className="flex items-center gap-2 text-sm font-bold text-[#63412e]">
                  <UserRound className="h-4 w-4 text-[#b65019]" />
                  Customer
                </div>

                <p className="mt-4 text-lg font-extrabold text-[#29160d]">
                  {order.customerName}
                </p>

                <a
                  href={`tel:${order.customerPhone}`}
                  className="mt-2 inline-flex items-center gap-2 text-sm text-[#7f6b5e] transition hover:text-[#a84414]"
                >
                  <Phone className="h-4 w-4" />
                  {order.customerPhone}
                </a>
              </section>

              <section className="rounded-2xl border border-[#eadbcf] bg-white p-5 shadow-[0_8px_24px_rgba(83,42,18,0.05)]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#63412e]">
                    <ReceiptText className="h-4 w-4 text-[#b65019]" />
                    Order items
                  </div>

                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                    {totalQuantity}{" "}
                    {totalQuantity === 1
                      ? "item"
                      : "items"}
                  </span>
                </div>

                <div className="mt-4 divide-y divide-[#eee2d8]">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-bold text-[#2b160d]">
                          {item.itemName}
                        </p>

                        <p className="mt-1 text-xs text-[#8b796e]">
                          {item.quantity} ×{" "}
                          {formatCurrency(
                            item.unitPrice,
                          )}
                        </p>
                      </div>

                      <p className="font-extrabold text-[#3e2416]">
                        {formatCurrency(
                          item.totalPrice,
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#eadbcf] pt-5">
                  <span className="font-bold text-[#6d5140]">
                    Order total
                  </span>

                  <span className="text-2xl font-extrabold text-[#9c4517]">
                    {formatCurrency(
                      order.totalAmount,
                    )}
                  </span>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#eadbcf] bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#8b796e]">
                    <CreditCard className="h-4 w-4 text-[#b65019]" />
                    Payment method
                  </div>

                  <p className="mt-2 font-bold text-[#2b160d]">
                    {formatStatus(
                      order.paymentMethod,
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#eadbcf] bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#8b796e]">
                    <Clock3 className="h-4 w-4 text-[#b65019]" />
                    Last updated
                  </div>

                  <p className="mt-2 text-sm font-bold text-[#2b160d]">
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
              </section>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700"
                >
                  {error}
                </div>
              )}
            </div>

            <footer className="border-t border-[#eadbcf] bg-white/95 p-5 shadow-[0_-10px_28px_rgba(80,38,16,0.06)] backdrop-blur-xl sm:p-6">
              {canManuallyMarkPaid && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Banknote className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-emerald-900">
                        Manual payment verification
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        Confirm only after receiving and
                        verifying the customer&apos;s{" "}
                        {formatStatus(
                          order.paymentMethod,
                        )}{" "}
                        payment.
                      </p>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void onMarkPaymentPaid()
                    }
                    whileTap={
                      reduceMotion
                        ? undefined
                        : {
                            scale: 0.98,
                          }
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                <div className="mb-5 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                  Payment verified
                </div>
              )}

              {order.paymentMethod === "UPI" &&
                order.paymentStatus !== "PAID" && (
                  <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-800">
                    Online UPI payment status is controlled by
                    the payment gateway and cannot be changed
                    manually.
                  </div>
                )}

              {nextStatuses.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b796e]">
                    Update order status
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {nextStatuses.map((status) => {
                      const cancelling =
                        status === "CANCELLED";

                      return (
                        <motion.button
                          key={status}
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void onUpdateStatus(
                              status,
                            )
                          }
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
                              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "bg-gradient-to-r from-[#b8561d] to-[#8c3811] text-white shadow-lg shadow-orange-900/15 hover:from-[#a14918] hover:to-[#752d0d]",
                          ].join(" ")}
                        >
                          {isUpdating ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : cancelling ? (
                            <XCircle className="h-4 w-4" />
                          ) : status ===
                            "COMPLETED" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <PackageCheck className="h-4 w-4" />
                          )}

                          {
                            statusButtonLabels[
                              status
                            ]
                          }
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#eadbcf] bg-[#faf5f1] p-4 text-sm font-bold text-[#796255]">
                  {order.orderStatus ===
                  "COMPLETED" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600" />
                  )}

                  This order is{" "}
                  {formatStatus(
                    order.orderStatus,
                  )}
                  .
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