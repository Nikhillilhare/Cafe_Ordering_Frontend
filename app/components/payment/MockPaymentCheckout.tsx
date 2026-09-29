"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  completeMockPayment,
  type MockPaymentResult,
  type PaymentStatus,
} from "@/lib/client/payments";

type MockPaymentItem = {
  id: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

type MockPaymentData = {
  paymentId: string;
  provider: string;
  providerOrderId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;

  cafe: {
    name: string;
    slug: string;
  };

  order: {
    id: string;
    customerName: string;
    items: MockPaymentItem[];
  };
};

type MockPaymentCheckoutProps = {
  providerOrderId: string;
};

type UpiApplication =
  | "GOOGLE_PAY"
  | "PHONEPE"
  | "PAYTM"
  | "OTHER_UPI";

const upiApplications: Array<{
  value: UpiApplication;
  label: string;
}> = [
  {
    value: "GOOGLE_PAY",
    label: "Google Pay",
  },
  {
    value: "PHONEPE",
    label: "PhonePe",
  },
  {
    value: "PAYTM",
    label: "Paytm",
  },
  {
    value: "OTHER_UPI",
    label: "Other UPI",
  },
];

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getShortId(id: string): string {
  return id.slice(-8).toUpperCase();
}

function getStatusStyles(status: PaymentStatus): string {
  if (status === "PAID") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "FAILED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "CANCELLED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

export default function MockPaymentCheckout({
  providerOrderId,
}: MockPaymentCheckoutProps) {
  const [payment, setPayment] = useState<MockPaymentData | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] =
    useState<UpiApplication>("GOOGLE_PAY");

  const [isLoading, setIsLoading] = useState(true);
  const [processingResult, setProcessingResult] =
    useState<MockPaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadPayment() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/payments/mock/${encodeURIComponent(providerOrderId)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: abortController.signal,
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.error ?? "Unable to load the payment session.",
          );
        }

        setPayment(data as MockPaymentData);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load the payment session.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPayment();

    return () => {
      abortController.abort();
    };
  }, [providerOrderId]);

  async function handlePaymentResult(result: MockPaymentResult) {
    if (!payment || processingResult) {
      return;
    }

    setProcessingResult(result);
    setError(null);

    try {
      const completedPayment = await completeMockPayment(
        payment.paymentId,
        result,
      );

      setPayment((currentPayment) => {
        if (!currentPayment) {
          return currentPayment;
        }

        return {
          ...currentPayment,
          paymentStatus: completedPayment.paymentStatus,
        };
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to process the mock payment.",
      );
    } finally {
      setProcessingResult(null);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold">Loading secure payment…</p>
        </div>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold">Payment unavailable</h1>

          <p className="mt-3 text-sm text-slate-600">
            {error ?? "The requested payment session could not be found."}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 font-semibold text-white"
          >
            Return to home
          </Link>
        </div>
      </main>
    );
  }

  const isPending = payment.paymentStatus === "PENDING";
  const isProcessing = processingResult !== null;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Mock payment gateway
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            {payment.cafe.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Development and demonstration mode
          </p>
        </div>

        <section className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Amount to pay</p>

                <p className="mt-1 text-3xl font-bold">
                  {formatCurrency(payment.amount)}
                </p>
              </div>

              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-bold",
                  getStatusStyles(payment.paymentStatus),
                ].join(" ")}
              >
                {payment.paymentStatus}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Order number</p>
                <p className="mt-1 font-semibold">
                  #{getShortId(payment.order.id)}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Customer</p>
                <p className="mt-1 truncate font-semibold">
                  {payment.order.customerName}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 p-6">
            <h2 className="font-bold">Order summary</h2>

            <div className="mt-4 space-y-3">
              {payment.order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.itemName}</p>

                    <p className="text-slate-500">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {isPending ? (
            <div className="p-6">
              <h2 className="font-bold">Choose a UPI application</h2>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {upiApplications.map((application) => {
                  const selected =
                    selectedUpiApp === application.value;

                  return (
                    <button
                      key={application.value}
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        setSelectedUpiApp(application.value)
                      }
                      className={[
                        "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                        selected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700",
                      ].join(" ")}
                    >
                      {application.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                This is a mock checkout. No real money will be transferred.
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handlePaymentResult("SUCCESS")}
                className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingResult === "SUCCESS"
                  ? "Processing payment…"
                  : `Pay ${formatCurrency(payment.amount)}`}
              </button>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePaymentResult("FAILURE")}
                  className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-60"
                >
                  {processingResult === "FAILURE"
                    ? "Processing…"
                    : "Simulate failure"}
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePaymentResult("CANCEL")}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 disabled:opacity-60"
                >
                  {processingResult === "CANCEL"
                    ? "Cancelling…"
                    : "Cancel payment"}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div
                className={[
                  "mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl",
                  payment.paymentStatus === "PAID"
                    ? "bg-green-100 text-green-700"
                    : payment.paymentStatus === "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700",
                ].join(" ")}
              >
                {payment.paymentStatus === "PAID" ? "✓" : "!"}
              </div>

              <h2 className="mt-4 text-xl font-bold">
                {payment.paymentStatus === "PAID"
                  ? "Payment successful"
                  : payment.paymentStatus === "FAILED"
                    ? "Payment failed"
                    : "Payment cancelled"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Order #{getShortId(payment.order.id)} has been updated.
              </p>

              <Link
                href={`/cafe/${payment.cafe.slug}`}
                className="mt-6 inline-block w-full rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white"
              >
                Return to cafe menu
              </Link>
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-xs text-slate-500">
          Mock gateway reference: {payment.providerOrderId}
        </p>
      </div>
    </main>
  );
}