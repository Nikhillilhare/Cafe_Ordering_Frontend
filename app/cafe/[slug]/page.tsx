import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import CafeMenuClient from '@/app/components/cafe/CafeMenuClient';
import type {
  CategoryData,
  MenuItemData,
  ThemeData,
} from '@/app/components/cafe/types';

type CafePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CafePage({ params }: CafePageProps) {
  const { slug } = await params;

  const cafe = await prisma.cafe.findUnique({
    where: {
      slug,
    },
    include: {
      categories: {
        where: {
          active: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
        include: {
          items: {
            where: {
              available: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      },
    },
  });

  if (!cafe || !cafe.active) {
    notFound();
  }

  const categories: CategoryData[] = cafe.categories.map((category) => ({
    id: category.id,
    name: category.name,
    items: category.items.map(
      (item): MenuItemData => ({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        feature: item.featured,
      }),
    ),
  }));

  const theme = (cafe.themeConfig ?? {}) as ThemeData;

  return (
    <CafeMenuClient
      cafeSlug={slug}
      cafeName={cafe.name}
      description={cafe.description}
      categories={categories}
      theme={theme}
    />
  );
}