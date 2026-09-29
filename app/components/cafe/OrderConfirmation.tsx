"use client";

import type { CreateOrderResponse } from "@/lib/client/orders";

type OrderConfirmationProps = {
  order: CreateOrderResponse;
  whatsappUrl?: string | null;
  paymentError?: string | null;
  isRetryingPayment?: boolean;
  onRetryPayment?: () => void | Promise<void>;
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
  paymentError,
  isRetryingPayment = false,
  onRetryPayment,
  onBackToMenu,
}: OrderConfirmationProps) {
  const isWhatsAppOrder = order.paymentMethod === "WHATSAPP";
  const isOnlinePayment = order.paymentMethod === "UPI";

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
        <h2 className="text-2xl font-bold">
          Order created successfully
        </h2>

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

      {isWhatsAppOrder && !whatsappUrl && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-left text-sm text-amber-800">
          The order was saved, but the cafe WhatsApp number is unavailable.
          Please contact the cafe directly.
        </div>
      )}

      {isOnlinePayment && (
        <div className="space-y-4">
          {paymentError ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-300 bg-red-50 p-4 text-left text-sm text-red-700"
            >
              <p className="font-semibold">
                Payment checkout could not be opened
              </p>

              <p className="mt-1">{paymentError}</p>

              <p className="mt-2">
                Your order is already saved. Retry payment without creating a
                new order.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 text-left text-sm text-blue-700">
              Your order is saved. Continue to the mock payment checkout to
              complete the payment demonstration.
            </div>
          )}

          {onRetryPayment && (
            <button
              type="button"
              disabled={isRetryingPayment}
              onClick={() => void onRetryPayment()}
              className="w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRetryingPayment
                ? "Opening payment checkout…"
                : "Continue to payment"}
            </button>
          )}
        </div>
      )}

      {onBackToMenu && (
        <button
          type="button"
          disabled={isRetryingPayment}
          onClick={onBackToMenu}
          className="w-full rounded-full border px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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