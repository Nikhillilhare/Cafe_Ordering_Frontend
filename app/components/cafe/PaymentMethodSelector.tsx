"use client";

import type { CheckoutPaymentMethod } from "@/lib/client/orders";

type PaymentMethodSelectorProps = {
  value: CheckoutPaymentMethod;
  onChange: (method: CheckoutPaymentMethod) => void;
  disabled?: boolean;
};

const paymentMethods: Array<{
  value: CheckoutPaymentMethod;
  title: string;
  description: string;
}> = [
  {
    value: "WHATSAPP",
    title: "Continue with WhatsApp",
    description:
      "Your order will be saved and WhatsApp will open with the order summary.",
  },
  {
    value: "UPI",
    title: "Pay Online",
    description:
      "Continue to the online payment flow. We will connect the real gateway later.",
  },
];

export default function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-base font-semibold">
        Choose order method
      </legend>

      {paymentMethods.map((method) => {
        const selected = value === method.value;

        return (
          <label
            key={method.value}
            className={[
              "flex cursor-pointer items-start gap-3 rounded-2xl border p-4",
              "transition duration-200",
              disabled ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
            style={{
              borderColor: selected
                ? "var(--primary-color, #c66a3d)"
                : "var(--muted-color, #776b61)",
              backgroundColor: selected
                ? "color-mix(in srgb, var(--primary-color, #c66a3d) 12%, white)"
                : "var(--surface-color, #ffffff)",
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={selected}
              disabled={disabled}
              onChange={() => onChange(method.value)}
              className="mt-1 h-4 w-4"
              style={{
                accentColor: "var(--primary-color, #c66a3d)",
              }}
            />

            <span className="block">
              <span className="block font-semibold">{method.title}</span>

              <span
                className="mt-1 block text-sm leading-5"
                style={{
                  color: "var(--muted-color, #776b61)",
                }}
              >
                {method.description}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}