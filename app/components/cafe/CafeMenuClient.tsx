'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import CafeHeader from './CafeHeader';
import CategoryTabs from './CategoryTabs';
import MenuItemCard from './MenuItemCard';
import CartBar from './CartBar';
import type { CategoryData, ThemeData } from './types';

type CafeMenuClientProps = {
  cafeSlug: string;
  cafeName: string;
  description: string | null;
  categories: CategoryData[];
  theme: ThemeData;
};

export default function CafeMenuClient({
  cafeSlug,
  cafeName,
  description,
  categories,
  theme,
}: CafeMenuClientProps) {
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);

  const [customerName, setCustomerName] = useState('');
const [customerPhone, setCustomerPhone] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
const [orderMessage, setOrderMessage] = useState('');

  const themeStyle = {
    '--background-color': theme.backgroundColor ?? '#A54CB2',
    '--surface-color': theme.surfaceColor ?? '#FFFFFF',
    '--text-color': theme.textColor ?? '#2B211B',
    '--muted-color': theme.mutedColor ?? '#776B61',
    '--primary-color': theme.primaryColor ?? '#C66A3D',
    '--accent-color': theme.accentColor ?? '#E4B85C',
    '--success-color': theme.successColor ?? '#6D9275',
  } as CSSProperties;

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return categories
      .filter((category) => {
        return (
          activeCategoryId === 'all' ||
          category.id === activeCategoryId
        );
      })
      .map((category) => {
        const filteredItems = category.items.filter((item) => {
          if (!normalizedSearch) {
            return true;
          }

          return (
            item.name.toLowerCase().includes(normalizedSearch) ||
            item.description?.toLowerCase().includes(normalizedSearch)
          );
        });

        return {
          ...category,
          items: filteredItems,
        };
      })
      .filter((category) => category.items.length > 0);
  }, [categories, activeCategoryId, search]);

  const addItem = (itemId: string) => {
    setCart((currentCart) => ({
      ...currentCart,
      [itemId]: (currentCart[itemId] ?? 0) + 1,
    }));
  };

  const removeItem = (itemId: string) => {
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
  };

  const cartItems = categories
    .flatMap((category) => category.items)
    .filter((item) => (cart[item.id] ?? 0) > 0);

  const cartItemCount = cartItems.reduce(
    (total, item) => total + (cart[item.id] ?? 0),
    0,
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * (cart[item.id] ?? 0),
    0,
  );

  const submitOrder = async () => {
  setOrderMessage('');

  if (!customerName.trim() || !customerPhone.trim()) {
    setOrderMessage('Please enter your name and mobile number.');
    return;
  }

  if (cartItems.length === 0) {
    setOrderMessage('Please add at least one item.');
    return;
  }

  try {
    setIsSubmitting(true);

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cafeSlug,
        customerName,
        customerPhone,
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: cart[item.id],
        })),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setOrderMessage(result.error ?? 'Unable to create order.');
      return;
    }

    setOrderMessage(
      `Order created successfully. Order ID: ${result.orderId}`,
    );

    setCart({});
  } catch {
    setOrderMessage('Something went wrong. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <main
      style={themeStyle}
      className="min-h-screen bg-[var(--background-color)] text-(--text-color)"
    >
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <CafeHeader
          cafeName={cafeName}
          description={description}
          search={search}
          cartItemCount={cartItemCount}
          onSearchChange={setSearch}
          onCartClick={() => setShowCart(true)}
        />

        <CategoryTabs
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategoryChange={setActiveCategoryId}
        />

        <div className="space-y-10">
          {filteredCategories.map((category) => (
            <section key={category.id}>
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-2xl font-bold">{category.name}</h2>

                <span className="text-sm text-[var(--muted-color)]">
                  {category.items.length} items
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
        onClick={() => setShowCart(true)}
      />

      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--surface-color)] p-6 text-[var(--text-color)] shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your order</h2>

              <button
                onClick={() => setShowCart(false)}
                className="text-2xl text-[var(--muted-color)]"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-black/10 pb-4"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-[var(--muted-color)]">
                      {cart[item.id]} × Rs. {item.price}
                    </p>
                  </div>

                  <p className="font-bold">
                    Rs. {item.price * (cart[item.id] ?? 0)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-xl font-bold">
              <span>Total</span>
              <span style={{ color: 'var(--primary-color)' }}>
                Rs. {cartTotal}
              </span>
            </div>
              <div className="mt-6 space-y-3">
  <input
    type="text"
    value={customerName}
    onChange={(event) => setCustomerName(event.target.value)}
    placeholder="Your name"
    className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none"
  />

  <input
    type="tel"
    value={customerPhone}
    onChange={(event) => setCustomerPhone(event.target.value)}
    placeholder="Mobile number"
    className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none"
  />
</div>
            <button
  className="mt-6 w-full rounded-2xl px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
  style={{
    backgroundColor: 'var(--primary-color)',
  }}
  onClick={submitOrder}
  disabled={isSubmitting}
>
  {isSubmitting ? 'Creating order...' : 'Place order'}
</button>

{orderMessage && (
  <p className="mt-4 text-center text-sm text-[var(--muted-color)]">
    {orderMessage}
  </p>
)}
          </div>
        </div>
      )}
    </main>
  );
}