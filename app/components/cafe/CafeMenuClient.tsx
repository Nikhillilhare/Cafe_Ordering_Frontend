"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import CafeHeader from "./CafeHeader";
import CategoryTabs from "./CategoryTabs";
import MenuItemCard from "./MenuItemCard";
import CartBar from "./CartBar";
import CheckoutForm, {
  type CheckoutFormValues,
} from "./CheckoutForm";
import OrderConfirmation from "./OrderConfirmation";

import { useCheckout } from "@/app/components/hooks/useCheckout";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp/buildWhatsAppOrderUrl";

import type { CategoryData, ThemeData } from "./types";

type CartStep = "cart" | "checkout" | "confirmation";

type CafeMenuClientProps = {
  cafeSlug: string;
  cafeName: string;
  whatsappNumber: string | null;
  description: string | null;
  categories: CategoryData[];
  theme: ThemeData;
};

export default function CafeMenuClient({
  cafeSlug,
  cafeName,
  whatsappNumber,
  description,
  categories,
  theme,
}: CafeMenuClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [cartStep, setCartStep] = useState<CartStep>("cart");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const themeStyle = {
    "--background-color": theme.backgroundColor ?? "#f8f3ec",
    "--surface-color": theme.surfaceColor ?? "#ffffff",
    "--text-color": theme.textColor ?? "#2b211b",
    "--muted-color": theme.mutedColor ?? "#776b61",
    "--primary-color": theme.primaryColor ?? "#c66a3d",
    "--accent-color": theme.accentColor ?? "#e4b85c",
    "--success-color": theme.successColor ?? "#6d9275",
  } as CSSProperties;

  const allMenuItems = useMemo(() => {
    return categories.flatMap((category) => category.items);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return categories
      .filter((category) => {
        return (
          activeCategoryId === "all" ||
          category.id === activeCategoryId
        );
      })
      .map((category) => {
        const filteredItems = category.items.filter((item) => {
          if (!normalizedSearch) {
            return true;
          }

          const searchableText = [
            item.name,
            item.description ?? "",
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(normalizedSearch);
        });

        return {
          ...category,
          items: filteredItems,
        };
      })
      .filter((category) => category.items.length > 0);
  }, [categories, activeCategoryId, search]);

  const cartItems = useMemo(() => {
    return allMenuItems.filter((item) => (cart[item.id] ?? 0) > 0);
  }, [allMenuItems, cart]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + (cart[item.id] ?? 0);
    }, 0);
  }, [cartItems, cart]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const quantity = cart[item.id] ?? 0;

      return total + item.price * quantity;
    }, 0);
  }, [cartItems, cart]);

  const checkoutItems = useMemo(() => {
    return cartItems.map((item) => ({
      menuItemId: item.id,
      quantity: cart[item.id] ?? 0,
    }));
  }, [cartItems, cart]);

  const {
    submitCheckout,
    resetCheckout,
    isSubmitting,
    error: checkoutError,
    createdOrder,
  } = useCheckout({
    cafeSlug,
    items: checkoutItems,
  });

  function addItem(itemId: string) {
    setCart((currentCart) => {
      const currentQuantity = currentCart[itemId] ?? 0;

      if (currentQuantity >= 50) {
        return currentCart;
      }

      return {
        ...currentCart,
        [itemId]: currentQuantity + 1,
      };
    });
  }

  function removeItem(itemId: string) {
    setCart((currentCart) => {
      const currentQuantity = currentCart[itemId] ?? 0;

      if (currentQuantity <= 1) {
        const nextCart = { ...currentCart };

        delete nextCart[itemId];

        return nextCart;
      }

      return {
        ...currentCart,
        [itemId]: currentQuantity - 1,
      };
    });
  }

  function openCart() {
    resetCheckout();
    setWhatsappUrl(null);
    setCartStep("cart");
    setShowCart(true);
  }

  function closeCart() {
    if (isSubmitting) {
      return;
    }

    setShowCart(false);
  }

  function clearCart() {
    setCart({});
  }

  async function handleCheckoutSubmit(
    values: CheckoutFormValues,
  ): Promise<void> {
    /*
     * Open a blank tab immediately for WhatsApp.
     *
     * Because the API request is asynchronous, opening the tab
     * before await helps prevent popup blockers.
     */
    const whatsappWindow =
      values.paymentMethod === "WHATSAPP"
        ? window.open("", "_blank")
        : null;

    if (whatsappWindow) {
      whatsappWindow.document.title = "Preparing WhatsApp order...";

      whatsappWindow.document.body.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
          color: #333;
        ">
          Preparing your WhatsApp order...
        </div>
      `;
    }

    const order = await submitCheckout(values);

    if (!order) {
      whatsappWindow?.close();
      return;
    }

    if (values.paymentMethod === "WHATSAPP") {
      const cafeWhatsAppNumber =
        order.whatsappNumber || whatsappNumber;

      if (!cafeWhatsAppNumber) {
        whatsappWindow?.close();

        /*
         * Order is already created, so confirmation is still shown.
         * The missing number can later be fixed by the cafe admin.
         */
        setWhatsappUrl(null);
        setCartStep("confirmation");
        clearCart();
        return;
      }

      try {
        const generatedWhatsAppUrl = buildWhatsAppOrderUrl({
          whatsappNumber: cafeWhatsAppNumber,
          orderId: order.orderId,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          totalAmount: order.totalAmount,

          items: cartItems.map((item) => ({
            name: item.name,
            quantity: cart[item.id] ?? 0,
            unitPrice: item.price,
          })),
        });

        setWhatsappUrl(generatedWhatsAppUrl);
        setCartStep("confirmation");
        clearCart();

        if (whatsappWindow) {
          whatsappWindow.location.href = generatedWhatsAppUrl;
        } else {
          /*
           * Fallback when the browser blocks the new tab.
           */
          window.location.assign(generatedWhatsAppUrl);
        }

        return;
      } catch (error) {
        whatsappWindow?.close();

        console.error("WhatsApp URL error:", error);

        setWhatsappUrl(null);
        setCartStep("confirmation");
        clearCart();

        return;
      }
    }

    /*
     * Real payment gateway is not connected yet.
     * UPI orders are created as PENDING and confirmation is shown.
     */
    whatsappWindow?.close();
    setWhatsappUrl(null);
    setCartStep("confirmation");
    clearCart();
  }

  function handleBackToMenu() {
    setShowCart(false);
    setCartStep("cart");
    setWhatsappUrl(null);
    resetCheckout();
  }

  return (
    <main
      style={themeStyle}
      className="min-h-screen bg-[var(--background-color)] pb-28 text-[var(--text-color)]"
    >
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <CafeHeader
          cafeName={cafeName}
          description={description}
          search={search}
          cartItemCount={cartItemCount}
          onSearchChange={setSearch}
          onCartClick={openCart}
        />

        <CategoryTabs
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategoryChange={setActiveCategoryId}
        />

        <div className="space-y-10">
          {filteredCategories.map((category) => (
            <section key={category.id}>
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="text-2xl font-bold">{category.name}</h2>

                <span className="text-sm text-[var(--muted-color)]">
                  {category.items.length}{" "}
                  {category.items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="grid gap-4">
                {category.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={cart[item.id] ?? 0}
                    onAdd={() => addItem(item.id)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="rounded-3xl bg-[var(--surface-color)] p-10 text-center">
            <p className="text-lg font-semibold">No items found</p>

            <p className="mt-2 text-sm text-[var(--muted-color)]">
              Try another search or category.
            </p>
          </div>
        )}
      </div>

      <CartBar
        itemCount={cartItemCount}
        total={cartTotal}
        onClick={openCart}
      />

      {showCart && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Order checkout"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[var(--surface-color)] p-6 text-[var(--text-color)] shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary-color)]">
                  {cafeName}
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {cartStep === "cart" && "Your order"}
                  {cartStep === "checkout" && "Checkout"}
                  {cartStep === "confirmation" &&
                    "Order confirmation"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCart}
                disabled={isSubmitting}
                aria-label="Close cart"
                className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-[var(--muted-color)] transition hover:bg-black/5 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {cartStep === "cart" && (
              <>
                {cartItems.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="font-semibold">Your cart is empty</p>

                    <button
                      type="button"
                      onClick={closeCart}
                      className="mt-4 font-semibold text-[var(--primary-color)]"
                    >
                      Browse the menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cartItems.map((item) => {
                        const quantity = cart[item.id] ?? 0;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 border-b border-black/10 pb-4"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold">{item.name}</p>

                              <p className="mt-1 text-sm text-[var(--muted-color)]">
                                ₹{item.price} each
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border font-bold"
                                style={{
                                  borderColor: "var(--primary-color)",
                                  color: "var(--primary-color)",
                                }}
                              >
                                −
                              </button>

                              <span className="min-w-5 text-center font-bold">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => addItem(item.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border font-bold"
                                style={{
                                  borderColor: "var(--primary-color)",
                                  color: "var(--primary-color)",
                                }}
                              >
                                +
                              </button>
                            </div>

                            <p className="min-w-20 text-right font-bold">
                              ₹{(item.price * quantity).toLocaleString("en-IN")}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex items-center justify-between text-xl font-bold">
                      <span>Total</span>

                      <span className="text-[var(--primary-color)]">
                        ₹{cartTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCartStep("checkout")}
                      className="mt-6 w-full rounded-full px-5 py-4 font-bold text-white"
                      style={{
                        backgroundColor: "var(--primary-color)",
                      }}
                    >
                      Continue to checkout
                    </button>
                  </>
                )}
              </>
            )}

            {cartStep === "checkout" && (
              <CheckoutForm
                totalAmount={cartTotal}
                isSubmitting={isSubmitting}
                serverError={checkoutError}
                onSubmit={handleCheckoutSubmit}
                onBack={() => setCartStep("cart")}
              />
            )}

            {cartStep === "confirmation" && createdOrder && (
              <OrderConfirmation
                order={createdOrder}
                whatsappUrl={whatsappUrl}
                onBackToMenu={handleBackToMenu}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}