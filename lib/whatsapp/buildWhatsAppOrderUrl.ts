export type WhatsAppOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type BuildWhatsAppOrderUrlInput = {
  whatsappNumber: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  items: WhatsAppOrderItem[];
};

function normalizeIndianWhatsAppNumber(phoneNumber: string): string {
  let digits = phoneNumber.replace(/\D/g, "");

  /*
   * Convert international 00 prefix:
   * 0091XXXXXXXXXX → 91XXXXXXXXXX
   */
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  /*
   * Convert Indian local number:
   * 0XXXXXXXXXX → 91XXXXXXXXXX
   */
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `91${digits.slice(1)}`;
  }

  /*
   * Convert 10-digit Indian number:
   * XXXXXXXXXX → 91XXXXXXXXXX
   */
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  return digits;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function buildWhatsAppOrderUrl({
  whatsappNumber,
  orderId,
  customerName,
  customerPhone,
  totalAmount,
  items,
}: BuildWhatsAppOrderUrlInput): string {
  const destinationNumber =
    normalizeIndianWhatsAppNumber(whatsappNumber);

  if (destinationNumber.length < 10) {
    throw new Error("The cafe WhatsApp number is invalid.");
  }

  if (items.length === 0) {
    throw new Error("Cannot create a WhatsApp message for an empty order.");
  }

  const itemLines = items.map((item, index) => {
    const lineTotal = item.unitPrice * item.quantity;

    return `${index + 1}. ${item.name} × ${item.quantity} — ${formatCurrency(
      lineTotal,
    )}`;
  });

  const message = [
    "Hello, I would like to place this order.",
    "",
    `Order ID: ${orderId}`,
    `Customer: ${customerName}`,
    `Mobile: ${customerPhone}`,
    "",
    "Order items:",
    ...itemLines,
    "",
    `Total: ${formatCurrency(totalAmount)}`,
    "",
    "Please confirm my order.",
  ].join("\n");

  return `https://wa.me/${destinationNumber}?text=${encodeURIComponent(
    message,
  )}`;
}