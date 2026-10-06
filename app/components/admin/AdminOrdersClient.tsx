"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Filter,
  ReceiptText,
  Search,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import {
  markManualPaymentPaid,
  updateAdminOrderStatus,
  type AdminOrderData,
  type AdminOrderStatus,
  type AdminPaymentStatus,
} from "@/lib/client/adminOrders";

const AdminOrderDetailsDrawer = dynamic(
  () => import("./AdminOrderDetailsDrawer"),
  {
    ssr: false,
  },
);

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

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "C";
}

function getOrderStatusClasses(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";

    case "READY":
      return "bg-sky-100 text-sky-700";

    case "PREPARING":
      return "bg-blue-100 text-blue-700";

    case "ACCEPTED":
      return "bg-violet-100 text-violet-700";

    case "CANCELLED":
      return "bg-rose-100 text-rose-700";

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

  const statistics = useMemo(() => {
    return {
      total: orders.length,

      paid: orders.filter(
        (order) => order.paymentStatus === "PAID",
      ).length,

      pending: orders.filter(
        (order) => order.paymentStatus === "PENDING",
      ).length,

      cancelled: orders.filter(
        (order) => order.orderStatus === "CANCELLED",
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

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
    orders.find(
      (order) => order.id === selectedOrderId,
    ) ?? null;

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
    if (
      updatingOrderId ||
      updatingPaymentOrderId
    ) {
      return;
    }

    setDrawerError(null);
    setSelectedOrderId(null);
  }

  async function handleUpdateStatus(
    status: AdminOrderStatus,
  ) {
    if (
      !selectedOrder ||
      updatingOrderId ||
      updatingPaymentOrderId
    ) {
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
        response.order.updatedAt ??
        new Date().toISOString();

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,
                orderStatus:
                  response.order.orderStatus,
                paymentStatus:
                  response.order.paymentStatus,
                updatedAt,
              }
            : order,
        ),
      );
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
        response.order.updatedAt ??
        new Date().toISOString();

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,
                paymentStatus:
                  response.order.paymentStatus,
                updatedAt,
              }
            : order,
        ),
      );
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

  const statisticCards = [
    {
      label: "Total orders",
      value: statistics.total,
      icon: ReceiptText,
      iconClass: "bg-orange-100 text-orange-700",
      cardClass:
        "from-white to-orange-50/70",
    },
    {
      label: "Paid orders",
      value: statistics.paid,
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-100 text-emerald-700",
      cardClass:
        "from-white to-emerald-50/70",
    },
    {
      label: "Pending payments",
      value: statistics.pending,
      icon: Clock3,
      iconClass: "bg-amber-100 text-amber-700",
      cardClass:
        "from-white to-amber-50/70",
    },
    {
      label: "Cancelled orders",
      value: statistics.cancelled,
      icon: XCircle,
      iconClass: "bg-rose-100 text-rose-700",
      cardClass:
        "from-white to-rose-50/70",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statisticCards.map(
            (statistic, index) => {
              const Icon = statistic.icon;

              return (
                <motion.article
                  key={statistic.label}
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
                  transition={{
                    delay: reduceMotion
                      ? 0
                      : index * 0.05,
                  }}
                  className={[
                    "flex items-center gap-4 rounded-2xl border border-[#ead9cb] bg-gradient-to-br p-5 shadow-[0_10px_28px_rgba(92,48,21,0.07)]",
                    statistic.cardClass,
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      statistic.iconClass,
                    ].join(" ")}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm text-[#7e6e64]">
                      {statistic.label}
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-[#29160d]">
                      {statistic.value}
                    </p>
                  </div>
                </motion.article>
              );
            },
          )}
        </section>

        <section className="rounded-3xl border border-[#e7d8cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(93,48,21,0.08)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <ReceiptText className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#2b160d]">
                  Customer orders
                </h2>

                <p className="mt-1 text-sm text-[#837268]">
                  {filteredOrders.length} of{" "}
                  {orders.length} orders
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_190px_190px]">
              <label className="relative sm:col-span-2 xl:col-span-1">
                <span className="sr-only">
                  Search orders
                </span>

                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9c897c]" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search name, phone or order ID..."
                  className="w-full rounded-xl border border-[#dfcbbb] bg-white py-3 pl-11 pr-10 text-sm text-[#2b160d] outline-none placeholder:text-[#ad9a8e] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#9c897c] hover:bg-orange-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>

              <label className="relative">
                <span className="sr-only">
                  Filter order status
                </span>

                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9c897c]" />

                <select
                  value={orderStatusFilter}
                  onChange={(event) =>
                    setOrderStatusFilter(
                      event.target
                        .value as OrderStatusFilter,
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-[#dfcbbb] bg-white py-3 pl-10 pr-4 text-sm text-[#3d2417] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  {orderStatusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="relative">
                <span className="sr-only">
                  Filter payment status
                </span>

                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9c897c]" />

                <select
                  value={paymentStatusFilter}
                  onChange={(event) =>
                    setPaymentStatusFilter(
                      event.target
                        .value as PaymentStatusFilter,
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-[#dfcbbb] bg-white py-3 pl-10 pr-4 text-sm text-[#3d2417] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  {paymentStatusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
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
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#ad4c17]"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          )}
        </section>

        {filteredOrders.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-[#dbc5b3] bg-white/60 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <ReceiptText className="h-6 w-6" />
            </div>

            <h3 className="mt-4 font-bold text-[#2b160d]">
              No matching orders
            </h3>

            <p className="mt-2 text-sm text-[#837268]">
              Try changing your search or filters.
            </p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-[#e7d8cc] bg-white/60 shadow-[0_14px_40px_rgba(93,48,21,0.08)]">
            <div className="hidden grid-cols-[1.25fr_1fr_0.55fr_0.65fr_0.65fr_0.5fr_auto] gap-4 border-b border-[#eaded5] bg-white/75 px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#8d7b70] lg:grid">
              <span>Customer</span>
              <span>Order details</span>
              <span>Total</span>
              <span>Status</span>
              <span>Payment</span>
              <span>Method</span>
              <span>Action</span>
            </div>

            <div className="space-y-3 p-3">
              {filteredOrders.map(
                (order, index) => {
                  const totalQuantity =
                    order.items.reduce(
                      (total, item) =>
                        total + item.quantity,
                      0,
                    );

                  const firstItem =
                    order.items[0];

                  return (
                    <motion.button
                      key={order.id}
                      type="button"
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              y: 10,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: reduceMotion
                          ? 0
                          : index * 0.025,
                      }}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : {
                              y: -2,
                            }
                      }
                      onClick={() =>
                        openOrder(order.id)
                      }
                      className="group grid w-full gap-4 rounded-2xl border border-[#ead8ca] bg-white/90 p-5 text-left shadow-[0_8px_22px_rgba(83,42,18,0.06)] transition hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(126,58,20,0.12)] lg:grid-cols-[1.25fr_1fr_0.55fr_0.65fr_0.65fr_0.5fr_auto] lg:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 font-extrabold text-orange-700">
                          {getInitial(
                            order.customerName,
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#28150d]">
                            {order.customerName}
                          </p>

                          <p className="mt-1 truncate text-xs text-[#8e7c70]">
                            #
                            {getShortOrderId(
                              order.id,
                            )}{" "}
                            ·{" "}
                            {formatDate(
                              order.createdAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#412719]">
                          {firstItem
                            ? `${firstItem.quantity} × ${firstItem.itemName}`
                            : "No items"}
                        </p>

                        <p className="mt-1 text-xs text-[#948278]">
                          {totalQuantity}{" "}
                          {totalQuantity === 1
                            ? "item"
                            : "items"}
                        </p>
                      </div>

                      <p className="font-extrabold text-[#28150d]">
                        {formatCurrency(
                          order.totalAmount,
                        )}
                      </p>

                      <span
                        className={[
                          "w-fit rounded-full px-3 py-1 text-xs font-bold",
                          getOrderStatusClasses(
                            order.orderStatus,
                          ),
                        ].join(" ")}
                      >
                        {formatStatus(
                          order.orderStatus,
                        )}
                      </span>

                      <span
                        className={[
                          "w-fit rounded-full px-3 py-1 text-xs font-bold",
                          getPaymentStatusClasses(
                            order.paymentStatus,
                          ),
                        ].join(" ")}
                      >
                        {formatStatus(
                          order.paymentStatus,
                        )}
                      </span>

                      <span className="text-sm font-medium text-[#766357]">
                        {formatStatus(
                          order.paymentMethod,
                        )}
                      </span>

                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfcbbb] bg-white text-[#8c3d14] transition group-hover:border-orange-400 group-hover:bg-[#9c4517] group-hover:text-white">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </motion.button>
                  );
                },
              )}
            </div>
          </section>
        )}
      </div>

      <AdminOrderDetailsDrawer
        order={selectedOrder}
        isUpdating={updatingOrderId !== null}
        isUpdatingPayment={
          updatingPaymentOrderId !== null
        }
        error={drawerError}
        onClose={closeOrder}
        onUpdateStatus={handleUpdateStatus}
        onMarkPaymentPaid={
          handleMarkPaymentPaid
        }
      />
    </>
  );
}