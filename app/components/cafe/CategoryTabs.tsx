'use client';

import type { CategoryData } from './types';

type CategoryTabsProps = {
  categories: CategoryData[];
  activeCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
};

export default function CategoryTabs({
  categories,
  activeCategoryId,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <nav className="mb-10 flex gap-3 overflow-x-auto pb-2">
      <button
        onClick={() => onCategoryChange('all')}
        className="whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold"
        style={{
          backgroundColor:
            activeCategoryId === 'all'
              ? 'var(--primary-color)'
              : 'var(--surface-color)',
          color:
            activeCategoryId === 'all'
              ? '#FFFFFF'
              : 'var(--muted-color)',
        }}
      >
        All items
      </button>

      {categories.map((category) => {
        const isActive = activeCategoryId === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className="whitespace-nowrap rounded-full border border-black/10 px-5 py-3 text-sm font-bold"
            style={{
              backgroundColor: isActive
                ? 'var(--primary-color)'
                : 'var(--surface-color)',
              color: isActive
                ? '#FFFFFF'
                : 'var(--muted-color)',
            }}
          >
            {category.name}
          </button>
        );
      })}
    </nav>
  );
}