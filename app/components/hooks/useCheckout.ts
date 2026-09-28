"use client";

import { useCallback, useState } from "react";
import {
  createOrder,
  type CreateOrderResponse,
} from "@/lib/client/orders";
import type { CheckoutFormValues }from "@/app/components/cafe/CheckoutForm";

export type CheckoutCartItem = {
  menuItemId: string;
  quantity: number;
};

type UseCheckoutOptions = {
  cafeSlug: string;
  items: CheckoutCartItem[];
  onOrderCreated?: (
    order: CreateOrderResponse,
    checkout: CheckoutFormValues,
  ) => void | Promise<void>;
};

export function useCheckout({
  cafeSlug,
  items,
  onOrderCreated,
}: UseCheckoutOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] =
    useState<CreateOrderResponse | null>(null);

  const submitCheckout = useCallback(
    async (checkout: CheckoutFormValues) => {
      if (isSubmitting) {
        return;
      }

      if (items.length === 0) {
        setError("Your cart is empty.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const order = await createOrder({
          cafeSlug,
          customerName: checkout.customerName,
          customerPhone: checkout.customerPhone,
          paymentMethod: checkout.paymentMethod,

          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        });

        setCreatedOrder(order);

        if (onOrderCreated) {
          await onOrderCreated(order, checkout);
        }

        return order;
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Something went wrong while creating the order.";

        setError(message);
        return undefined;
      } finally {
        setIsSubmitting(false);
      }
    },
    [cafeSlug, isSubmitting, items, onOrderCreated],
  );

  const resetCheckout = useCallback(() => {
    setError(null);
    setCreatedOrder(null);
    setIsSubmitting(false);
  }, []);

  return {
    submitCheckout,
    resetCheckout,
    isSubmitting,
    error,
    createdOrder,
  };
}