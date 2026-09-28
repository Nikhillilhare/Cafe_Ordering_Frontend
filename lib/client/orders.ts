export type CheckoutPaymentMethod = "WHATSAPP" | "UPI";

export type CreateOrderItemInput = {
  menuItemId: string;
  quantity: number;
};

export type CreateOrderInput = {
  cafeSlug: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: CheckoutPaymentMethod;
  items: CreateOrderItemInput[];
};

export type CreateOrderResponse = {
  orderId: string;
  cafeSlug: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: CheckoutPaymentMethod;
  whatsappNumber: string | null;
};

type OrderErrorResponse = {
  error?: string;
};

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResponse> {
  const response = await fetch("/api/orders", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => null)) as
    | CreateOrderResponse
    | OrderErrorResponse
    | null;

  if (!response.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : "Order could not be created. Please try again.";

    throw new Error(message);
  }

  if (!data || !("orderId" in data)) {
    throw new Error("Invalid response received from the order server.");
  }

  return data;
}