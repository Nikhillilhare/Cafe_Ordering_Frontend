"use client";

import type { CreateOrderResponse } from "@/lib/client/orders";

type OrderConfirmationProps = {
  order: CreateOrderResponse;
  whatsappUrl?: string | null;
  onBackToMenu?: () => void;
};

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getShortOrderId(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

export default function OrderConfirmation({
  order,
  whatsappUrl,
  onBackToMenu,
}: OrderConfirmationProps) {
  const isWhatsAppOrder = order.paymentMethod === "WHATSAPP";

  return (
    <section className="space-y-6 text-center">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white"
        style={{
          backgroundColor: "var(--primary-color, #c66a3d)",
        }}
        aria-hidden="true"
      >
        ✓
      </div>

      <div>
        <h2 className="text-2xl font-bold">Order created successfully</h2>

        <p
          className="mt-2 text-sm"
          style={{
            color: "var(--muted-color, #776b61)",
          }}
        >
          Your order has been saved and is waiting for confirmation.
        </p>
      </div>

      <div
        className="space-y-3 rounded-2xl border p-5 text-left"
        style={{
          backgroundColor: "var(--surface-color, #ffffff)",
          borderColor: "var(--muted-color, #776b61)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <span
            className="text-sm"
            style={{
              color: "var(--muted-color, #776b61)",
            }}
          >
            Order number
          </span>

          <span className="font-semibold">
            #{getShortOrderId(order.orderId)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span
            className="text-sm"
            style={{
              color: "var(--muted-color, #776b61)",
            }}
          >
            Total amount
          </span>

          <span className="font-semibold">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span
            className="text-sm"
            style={{
              color: "var(--muted-color, #776b61)",
            }}
          >
            Order status
          </span>

          <span className="font-semibold">{order.orderStatus}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span
            className="text-sm"
            style={{
              color: "var(--muted-color, #776b61)",
            }}
          >
            Payment status
          </span>

          <span className="font-semibold">{order.paymentStatus}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span
            className="text-sm"
            style={{
              color: "var(--muted-color, #776b61)",
            }}
          >
            Order method
          </span>

          <span className="font-semibold">
            {isWhatsAppOrder ? "WhatsApp" : "Pay Online"}
          </span>
        </div>
      </div>

      {isWhatsAppOrder && whatsappUrl && (
        <div className="space-y-3">
          <p
            className="text-sm"
            style={{
              color: "var(--muted-color, #776b61)",
            }}
          >
            Open WhatsApp and send the prepared order message to the cafe.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Open WhatsApp
          </a>
        </div>
      )}

      {!isWhatsAppOrder && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-left text-sm text-amber-800">
          Online payment is currently running in demo mode. The real payment
          gateway will be connected after the required merchant credentials are
          provided.
        </div>
      )}

      {onBackToMenu && (
        <button
          type="button"
          onClick={onBackToMenu}
          className="w-full rounded-full border px-6 py-3 font-semibold"
          style={{
            borderColor: "var(--primary-color, #c66a3d)",
            color: "var(--primary-color, #c66a3d)",
          }}
        >
          Back to menu
        </button>
      )}
    </section>
  );
}