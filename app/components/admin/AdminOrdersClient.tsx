"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  motion,
  type Variants,
} from "motion/react";
import {
  ChevronRight,
  Clock3,
  CreditCard,
  Filter,
  ReceiptText,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

const AdminOrderDetailsDrawer = dynamic(
  () => import("./AdminOrderDetailsDrawer"),
  {
    ssr: false,
  },
);

import {  
  markManualPaymentPaid,
  updateAdminOrderStatus,
  type AdminOrderData,
  type AdminOrderStatus,
  type AdminPaymentStatus,
} from "@/lib/client/adminOrders";

type AdminOrdersClientProps = {
  initialOrders: AdminOrderData[];
  initialSelectedOrderId?: string | null;
};

type OrderStatusFilter = "ALL" | AdminOrderStatus;
type PaymentStatusFilter = "ALL" | AdminPaymentStatus;

const orderStatusOptions: OrderStatusFilter[] = [
  "ALL",
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

const paymentStatusOptions: PaymentStatusFilter[] = [
  "ALL",
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];

const orderContainerVariants: Variants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.045,
    },
  },
};

const orderItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
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

function formatStatus(status: string): string {
  if (status === "ALL") {
    return "All";
  }

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

    case "ACCEPTED":
      return "border-violet-400/20 bg-violet-500/10 text-violet-300";

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

export default function AdminOrdersClient({
  initialOrders,
  initialSelectedOrderId = null,
}: AdminOrdersClientProps) {
  const reduceMotion = useHydratedReducedMotion();

  const [orders, setOrders] =
    useState<AdminOrderData[]>(initialOrders);

  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatusFilter>("ALL");

  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<PaymentStatusFilter>("ALL");

  const [selectedOrderId, setSelectedOrderId] =
    useState<string | null>(initialSelectedOrderId);

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  const [
  updatingPaymentOrderId,
  setUpdatingPaymentOrderId,
] = useState<string | null>(null);  

  const [drawerError, setDrawerError] =
    useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.customerName
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.customerPhone
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.id
          .toLowerCase()
          .includes(normalizedSearch) ||
        getShortOrderId(order.id)
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesOrderStatus =
        orderStatusFilter === "ALL" ||
        order.orderStatus === orderStatusFilter;

      const matchesPaymentStatus =
        paymentStatusFilter === "ALL" ||
        order.paymentStatus === paymentStatusFilter;

      return (
        matchesSearch &&
        matchesOrderStatus &&
        matchesPaymentStatus
      );
    });
  }, [
    orders,
    search,
    orderStatusFilter,
    paymentStatusFilter,
  ]);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ??
    null;

  const filtersActive =
    search.trim() !== "" ||
    orderStatusFilter !== "ALL" ||
    paymentStatusFilter !== "ALL";

  function resetFilters() {
    setSearch("");
    setOrderStatusFilter("ALL");
    setPaymentStatusFilter("ALL");
  }

  function openOrder(orderId: string) {
    setDrawerError(null);
    setSelectedOrderId(orderId);
  }

  function closeOrder() {
    if (updatingOrderId || updatingPaymentOrderId) {
      return;
    }

    setDrawerError(null);
    setSelectedOrderId(null);
  }

  async function handleUpdateStatus(
    status: AdminOrderStatus,
  ) {
    if (!selectedOrder || updatingOrderId) {
      return;
    }

    setUpdatingOrderId(selectedOrder.id);
    setDrawerError(null);

    try {
      const response = await updateAdminOrderStatus(
        selectedOrder.id,
        status,
      );

      const updatedAt =
        response.order.updatedAt ?? new Date().toISOString();

      setOrders((currentOrders) => {
        return currentOrders.map((order) => {
          if (order.id !== selectedOrder.id) {
            return order;
          }

          return {
            ...order,
            orderStatus: response.order.orderStatus,
            paymentStatus: response.order.paymentStatus,
            updatedAt,
          };
        });
      });
    } catch (caughtError) {
      setDrawerError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update the order.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleMarkPaymentPaid() {
  if (
    !selectedOrder ||
    updatingOrderId ||
    updatingPaymentOrderId
  ) {
    return;
  }

  setUpdatingPaymentOrderId(selectedOrder.id);
  setDrawerError(null);

  try {
    const response = await markManualPaymentPaid(
      selectedOrder.id,
    );

    const updatedAt =
      response.order.updatedAt ?? new Date().toISOString();

    setOrders((currentOrders) => {
      return currentOrders.map((order) => {
        if (order.id !== selectedOrder.id) {
          return order;
        }

        return {
          ...order,
          paymentStatus: response.order.paymentStatus,
          updatedAt,
        };
      });
    });
  } catch (caughtError) {
    setDrawerError(
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to verify the payment.",
    );
  } finally {
    setUpdatingPaymentOrderId(null);
  }
}

  return (
    <>
      <div className="space-y-6">
        <motion.section
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 14,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-3xl border border-white/10 bg-slate-900/65 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6"
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                  <ReceiptText className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Customer orders
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredOrders.length} of {orders.length} orders
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_170px_170px]">
              <label className="relative">
                <span className="sr-only">Search orders</span>

                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search name, phone or order..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>

              <label className="relative">
                <span className="sr-only">
                  Filter order status
                </span>

                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <select
                  value={orderStatusFilter}
                  onChange={(event) =>
                    setOrderStatusFilter(
                      event.target.value as OrderStatusFilter,
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-300 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                >
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="relative">
                <span className="sr-only">
                  Filter payment status
                </span>

                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <select
                  value={paymentStatusFilter}
                  onChange={(event) =>
                    setPaymentStatusFilter(
                      event.target
                        .value as PaymentStatusFilter,
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-300 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                >
                  {paymentStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filtersActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          )}
        </motion.section>

        {filteredOrders.length === 0 ? (
          <motion.section
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-3xl border border-white/10 bg-slate-900/65 px-6 py-16 text-center shadow-xl shadow-black/10 backdrop-blur-xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
              <ReceiptText className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              No matching orders
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

            {filtersActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-400"
              >
                Reset filters
              </button>
            )}
          </motion.section>
        ) : (
          <motion.section
            variants={
              reduceMotion
                ? undefined
                : orderContainerVariants
            }
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "visible"}
            className="grid gap-4"
          >
            {filteredOrders.map((order) => {
              const itemCount = order.items.reduce(
                (total, item) => total + item.quantity,
                0,
              );

              return (
                <motion.button
                  key={order.id}
                  type="button"
                  variants={
                    reduceMotion
                      ? undefined
                      : orderItemVariants
                  }
                  onClick={() => openOrder(order.id)}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -3,
                        }
                  }
                  className="group grid w-full gap-5 rounded-3xl border border-white/10 bg-slate-900/65 p-5 text-left shadow-lg shadow-black/10 transition hover:border-indigo-400/25 hover:bg-slate-900/85 sm:p-6 lg:grid-cols-[1.2fr_0.65fr_0.85fr_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 transition group-hover:scale-105 group-hover:bg-indigo-500/20">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">
                          {order.customerName}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
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

                    <p className="mt-1 text-lg font-bold text-white">
                      {formatCurrency(order.totalAmount)}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"}
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

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatStatus(order.paymentMethod)}
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition group-hover:border-indigo-400/30 group-hover:bg-indigo-500/10 group-hover:text-indigo-300">
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.section>
        )}
      </div>

      <AdminOrderDetailsDrawer
  order={selectedOrder}
  isUpdating={updatingOrderId !== null}
  isUpdatingPayment={updatingPaymentOrderId !== null}
  error={drawerError}
  onClose={closeOrder}
  onUpdateStatus={handleUpdateStatus}
  onMarkPaymentPaid={handleMarkPaymentPaid}
/>
    </>
  );
}