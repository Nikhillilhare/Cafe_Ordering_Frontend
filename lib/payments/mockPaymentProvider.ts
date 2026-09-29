import { randomUUID } from "node:crypto";

import type {
  CreatePaymentSessionInput,
  PaymentProvider,
  PaymentSession,
} from "./types";

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "MOCK" as const;

  async createPaymentSession(
    input: CreatePaymentSessionInput,
  ): Promise<PaymentSession> {
    if (!input.orderId) {
      throw new Error("Order ID is required to create a payment.");
    }

    if (!input.cafeId) {
      throw new Error("Cafe ID is required to create a payment.");
    }

    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      throw new Error("Payment amount must be greater than zero.");
    }

    const uniqueReference = randomUUID().replaceAll("-", "").slice(0, 16);

    const providerOrderId = [
      "mock",
      input.orderId.slice(-8),
      uniqueReference,
    ].join("_");

    return {
      provider: this.name,
      providerOrderId,
      checkoutUrl: `/payment/mock/${encodeURIComponent(providerOrderId)}`,
      status: "PENDING",
    };
  }
}

export const mockPaymentProvider = new MockPaymentProvider();