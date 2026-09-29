export type PaymentProviderName = "MOCK" | "RAZORPAY" | "CASHFREE";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type CreatePaymentSessionResponse = {
  paymentId: string;
  provider: PaymentProviderName;
  providerOrderId: string;
  checkoutUrl: string;
  amount: number;
  paymentStatus: PaymentStatus;
};

type PaymentErrorResponse = {
  error?: string;
};

export async function createPaymentSession(
  orderId: string,
): Promise<CreatePaymentSessionResponse> {
  const response = await fetch("/api/payments/create", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      orderId,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | CreatePaymentSessionResponse
    | PaymentErrorResponse
    | null;

  if (!response.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : "Unable to start the payment.";

    throw new Error(message);
  }

  if (
    !data ||
    !("paymentId" in data) ||
    !("checkoutUrl" in data)
  ) {
    throw new Error("Invalid payment response received from the server.");
  }

  return data;
}
export type MockPaymentResult =
  | "SUCCESS"
  | "FAILURE"
  | "CANCEL";

export type CompleteMockPaymentResponse = {
  paymentId: string;
  orderId: string;
  paymentStatus: PaymentStatus;
};

export async function completeMockPayment(
  paymentId: string,
  result: MockPaymentResult,
): Promise<CompleteMockPaymentResponse> {
  const response = await fetch("/api/payments/mock/complete", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      paymentId,
      result,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | CompleteMockPaymentResponse
    | PaymentErrorResponse
    | null;

  if (!response.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : "Unable to complete the mock payment.";

    throw new Error(message);
  }

  if (
    !data ||
    !("paymentId" in data) ||
    !("orderId" in data) ||
    !("paymentStatus" in data)
  ) {
    throw new Error(
      "Invalid payment completion response received from the server.",
    );
  }

  return data;
}