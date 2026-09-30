export type AdminOrderStatus =
  | "NEW"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type AdminPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type AdminPaymentMethod =
  | "UPI"
  | "WHATSAPP"
  | "CASH";

export type AdminOrderItemData = {
  id: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

export type AdminOrderData = {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  orderStatus: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  paymentMethod: AdminPaymentMethod;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItemData[];
};

export type UpdateAdminOrderStatusResponse = {
  order: {
    id: string;
    orderStatus: AdminOrderStatus;
    paymentStatus: AdminPaymentStatus;
    updatedAt?: string;
  };
};

type AdminOrderErrorResponse = {
  error?: string;
  allowedStatuses?: AdminOrderStatus[];
};

export class AdminOrderApiError extends Error {
  readonly allowedStatuses?: AdminOrderStatus[];

  constructor(
    message: string,
    allowedStatuses?: AdminOrderStatus[],
  ) {
    super(message);

    this.name = "AdminOrderApiError";
    this.allowedStatuses = allowedStatuses;
  }
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
): Promise<UpdateAdminOrderStatusResponse> {
  const response = await fetch(
    `/api/admin/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    },
  );

  const data = (await response.json().catch(() => null)) as
    | UpdateAdminOrderStatusResponse
    | AdminOrderErrorResponse
    | null;

  if (!response.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : "Unable to update the order status.";

    const allowedStatuses =
      data &&
      "allowedStatuses" in data &&
      Array.isArray(data.allowedStatuses)
        ? data.allowedStatuses
        : undefined;

    throw new AdminOrderApiError(
      message,
      allowedStatuses,
    );
  }

  if (
    !data ||
    !("order" in data) ||
    !data.order ||
    typeof data.order.id !== "string"
  ) {
    throw new AdminOrderApiError(
      "Invalid response received from the order server.",
    );
  }

  return data;
}