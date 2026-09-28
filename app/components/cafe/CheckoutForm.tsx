"use client";

import { FormEvent, useState } from "react";
import PaymentMethodSelector from "./PaymentMethodSelector";
import type { CheckoutPaymentMethod } from "@/lib/client/orders";

export type CheckoutFormValues = {
  customerName: string;
  customerPhone: string;
  paymentMethod: CheckoutPaymentMethod;
};

type CheckoutFormProps = {
  totalAmount: number;
  isSubmitting: boolean;
  serverError?: string | null;
  onSubmit: (values: CheckoutFormValues) => Promise<void>;
  onBack?: () => void;
};

export default function CheckoutForm({
  totalAmount,
  isSubmitting,
  serverError,
  onSubmit,
  onBack,
}: CheckoutFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("WHATSAPP");
  const [contactConsent, setContactConsent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.replace(/[^\d+]/g, "");
    const phoneDigits = cleanPhone.replace(/\D/g, "");

    if (cleanName.length < 2) {
      setValidationError("Please enter your full name.");
      return;
    }

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setValidationError("Please enter a valid mobile number.");
      return;
    }

    if (!contactConsent) {
      setValidationError(
        "Please allow the cafe to contact you about this order.",
      );
      return;
    }

    await onSubmit({
      customerName: cleanName,
      customerPhone: cleanPhone,
      paymentMethod,
    });
  }

  const visibleError = validationError || serverError;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Checkout</h2>

        <p
          className="mt-1 text-sm"
          style={{
            color: "var(--muted-color, #776b61)",
          }}
        >
          Enter your details so the cafe can identify and contact you.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="customerName" className="block text-sm font-semibold">
          Customer name
        </label>

        <input
          id="customerName"
          name="customerName"
          type="text"
          autoComplete="name"
          value={customerName}
          disabled={isSubmitting}
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-2xl border px-4 py-3 outline-none transition"
          style={{
            backgroundColor: "var(--surface-color, #ffffff)",
            borderColor: "var(--muted-color, #776b61)",
            color: "var(--text-color, #2b211b)",
          }}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="customerPhone" className="block text-sm font-semibold">
          Mobile number
        </label>

        <input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={customerPhone}
          disabled={isSubmitting}
          onChange={(event) => setCustomerPhone(event.target.value)}
          placeholder="Example: 9876543210"
          className="w-full rounded-2xl border px-4 py-3 outline-none transition"
          style={{
            backgroundColor: "var(--surface-color, #ffffff)",
            borderColor: "var(--muted-color, #776b61)",
            color: "var(--text-color, #2b211b)",
          }}
        />

        <p
          className="text-xs"
          style={{
            color: "var(--muted-color, #776b61)",
          }}
        >
          You can enter a 10-digit number or a number with country code.
        </p>
      </div>

      <PaymentMethodSelector
        value={paymentMethod}
        onChange={setPaymentMethod}
        disabled={isSubmitting}
      />

      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={contactConsent}
          disabled={isSubmitting}
          onChange={(event) => setContactConsent(event.target.checked)}
          className="mt-1 h-4 w-4"
          style={{
            accentColor: "var(--primary-color, #c66a3d)",
          }}
        />

        <span>
          I agree to receive updates about this order on the provided mobile
          number.
        </span>
      </label>

      {visibleError && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {visibleError}
        </div>
      )}

      <div
        className="flex items-center justify-between border-t pt-4"
        style={{
          borderColor: "var(--muted-color, #776b61)",
        }}
      >
        <span className="font-semibold">Order total</span>

        <span className="text-xl font-bold">
          ₹{totalAmount.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {onBack && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            className="rounded-full border px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: "var(--primary-color, #c66a3d)",
              color: "var(--primary-color, #c66a3d)",
            }}
          >
            Back to cart
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-full px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: "var(--primary-color, #c66a3d)",
          }}
        >
          {isSubmitting
            ? "Creating order..."
            : paymentMethod === "WHATSAPP"
              ? "Place order with WhatsApp"
              : "Continue to payment"}
        </button>
      </div>
    </form>
  );
}