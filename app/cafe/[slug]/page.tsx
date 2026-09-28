import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import CafeMenuClient from "@/app/components/cafe/CafeMenuClient";

import type {
  CategoryData,
  MenuItemData,
  ThemeData,
} from "@/app/components/cafe/types";

type CafePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CafePage({ params }: CafePageProps) {
  const { slug } = await params;

  const normalizedSlug = slug.trim().toLowerCase();

  const cafe = await prisma.cafe.findUnique({
    where: {
      slug: normalizedSlug,
    },

    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      whatsappNumber: true,
      active: true,
      themeConfig: true,

      categories: {
        where: {
          active: true,
        },

        orderBy: {
          sortOrder: "asc",
        },

        select: {
          id: true,
          name: true,

          items: {
            where: {
              available: true,
            },

            orderBy: {
              sortOrder: "asc",
            },

            select: {
              id: true,
              categoryId: true,
              name: true,
              description: true,
              price: true,
              featured: true,
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

  const theme: ThemeData =
    cafe.themeConfig &&
    typeof cafe.themeConfig === "object" &&
    !Array.isArray(cafe.themeConfig)
      ? (cafe.themeConfig as ThemeData)
      : {};

  return (
    <CafeMenuClient
      cafeSlug={cafe.slug}
      cafeName={cafe.name}
      whatsappNumber={cafe.whatsappNumber}
      description={cafe.description}
      categories={categories}
      theme={theme}
    />
  );
}