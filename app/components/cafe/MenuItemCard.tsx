'use client';

import type { MenuItemData } from './types';

type MenuItemCardProps = {
  item: MenuItemData;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
};

export default function MenuItemCard({
  item,
  quantity,
  onAdd,
  onRemove,
}: MenuItemCardProps) {
  return (
    <article className="rounded-3xl border border-black/10 bg-[var(--surface-color)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          {item.feature && (
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'var(--text-color)',
              }}
            >
              Featured
            </span>
          )}

          <h3 className="text-xl font-bold">{item.name}</h3>

          {item.description && (
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-color)]">
              {item.description}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xl font-bold text-[var(--primary-color)]">
            Rs. {item.price}
          </p>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="mt-4 rounded-full border px-4 py-2 text-sm font-bold"
              style={{
                borderColor: 'var(--primary-color)',
                color: 'var(--primary-color)',
              }}
            >
              Add
            </button>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-full border border-black/10 px-2 py-1">
              <button
                onClick={onRemove}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold"
                style={{
                  color: 'var(--primary-color)',
                }}
              >
                −
              </button>

              <span className="min-w-5 text-center font-bold">
                {quantity}
              </span>

              <button
                onClick={onAdd}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold"
                style={{
                  color: 'var(--primary-color)',
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}