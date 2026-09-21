'use client';

type CartBarProps = {
  itemCount: number;
  total: number;
  onClick: () => void;
};

export default function CartBar({
  itemCount,
  total,
  onClick,
}: CartBarProps) {
  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 px-5">
      <button
        onClick={onClick}
        className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-2xl px-5 py-4 text-left text-black shadow-xl"
        style={{
          backgroundColor: 'var(--primary-color)',
        }}
      >
        <span className="font-semibold">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
        </span>

        <span className="font-bold">
          View order · Rs. {total}
        </span>
      </button>
    </div>
  );
}