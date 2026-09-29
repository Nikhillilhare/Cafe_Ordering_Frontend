export type PaymentProviderName = "MOCK" | "RAZORPAY" | "CASHFREE";

export type PaymentCheckoutStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export type CreatePaymentSessionInput = {
  orderId: string;
  cafeId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
};

export type PaymentSession = {
  provider: PaymentProviderName;
  providerOrderId: string;
  checkoutUrl: string;
  status: PaymentCheckoutStatus;
};

export type CompleteMockPaymentInput = {
  paymentId: string;
  result: "SUCCESS" | "FAILURE" | "CANCEL";
};

export type CompletePaymentResult = {
  paymentId: string;
  orderId: string;
  paymentStatus: PaymentCheckoutStatus;
};

export interface PaymentProvider {
  readonly name: PaymentProviderName;

  createPaymentSession(
    input: CreatePaymentSessionInput,
  ): Promise<PaymentSession>;
}