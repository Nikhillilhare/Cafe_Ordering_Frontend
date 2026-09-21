import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cafe = await prisma.cafe.upsert({
    where: {
      slug: 'kettle-bean',
    },
    update: {
      name: 'Kettle & Bean',
      description: 'Small-batch roast · scan, sip, stay a while',
      whatsappNumber: '+919876543210',
      active: true,
      themeConfig: {
    primaryColor: '#C66A3D',
    backgroundColor: '#F8F3EC',
    surfaceColor: '#FFFFFF',
    textColor: '#2B211B',
    mutedColor: '#776B61',
    accentColor: '#E4B85C',
    successColor: '#6D9275',
  },
    },
    create: {
      name: 'Kettle & Bean',
      slug: 'kettle-bean',
      description: 'Small-batch roast · scan, sip, stay a while',
      whatsappNumber: '+919876543210',
      active: true,
      themeConfig: {
  primaryColor: '#C66A3D',
  backgroundColor: '#F8F3EC',
  surfaceColor: '#FFFFFF',
  textColor: '#2B211B',
  mutedColor: '#776B61',
  accentColor: '#E4B85C',
  successColor: '#6D9275',
},
    },
  });

  const hotCoffee = await prisma.category.upsert({
    where: {
      cafeId_name: {
        cafeId: cafe.id,
        name: 'Hot Coffee',
      },
    },
    update: {
      sortOrder: 1,
      active: true,
    },
    create: {
      cafeId: cafe.id,
      name: 'Hot Coffee',
      sortOrder: 1,
      active: true,
    },
  });

  const coldCoffee = await prisma.category.upsert({
    where: {
      cafeId_name: {
        cafeId: cafe.id,
        name: 'Cold & Iced',
      },
    },
    update: {
      sortOrder: 2,
      active: true,
    },
    create: {
      cafeId: cafe.id,
      name: 'Cold & Iced',
      sortOrder: 2,
      active: true,
    },
  });

  const tea = await prisma.category.upsert({
    where: {
      cafeId_name: {
        cafeId: cafe.id,
        name: 'Tea',
      },
    },
    update: {
      sortOrder: 3,
      active: true,
    },
    create: {
      cafeId: cafe.id,
      name: 'Tea',
      sortOrder: 3,
      active: true,
    },
  });

  await prisma.category.upsert({
    where: {
      cafeId_name: {
        cafeId: cafe.id,
        name: 'Snacks & Pastries',
      },
    },
    update: {
      sortOrder: 4,
      active: true,
    },
    create: {
      cafeId: cafe.id,
      name: 'Snacks & Pastries',
      sortOrder: 4,
      active: true,
    },
  });

  await prisma.menuItem.upsert({
    where: {
      id: `${cafe.id}-espresso`,
    },
    update: {
      name: 'Espresso',
      description: 'A tight, bold shot pulled from our house blend.',
      price: 90,
      available: true,
      categoryId: hotCoffee.id,
    },
    create: {
      id: `${cafe.id}-espresso`,
      cafeId: cafe.id,
      categoryId: hotCoffee.id,
      name: 'Espresso',
      description: 'A tight, bold shot pulled from our house blend.',
      price: 90,
      available: true,
      sortOrder: 1,
    },
  });

  await prisma.menuItem.upsert({
    where: {
      id: `${cafe.id}-americano`,
    },
    update: {
      name: 'Americano',
      description: 'Espresso lengthened with hot water — clean and bright.',
      price: 110,
      available: true,
      categoryId: hotCoffee.id,
    },
    create: {
      id: `${cafe.id}-americano`,
      cafeId: cafe.id,
      categoryId: hotCoffee.id,
      name: 'Americano',
      description: 'Espresso lengthened with hot water — clean and bright.',
      price: 110,
      available: true,
      sortOrder: 2,
    },
  });

  await prisma.menuItem.upsert({
    where: {
      id: `${cafe.id}-cappuccino`,
    },
    update: {
      name: 'Cappuccino',
      description: 'Equal parts espresso, steamed milk, and foam.',
      price: 140,
      available: true,
      featured: true,
      categoryId: hotCoffee.id,
    },
    create: {
      id: `${cafe.id}-cappuccino`,
      cafeId: cafe.id,
      categoryId: hotCoffee.id,
      name: 'Cappuccino',
      description: 'Equal parts espresso, steamed milk, and foam.',
      price: 140,
      available: true,
      featured: true,
      sortOrder: 3,
    },
  });

  await prisma.menuItem.upsert({
    where: {
      id: `${cafe.id}-cold-coffee`,
    },
    update: {
      name: 'Cold Coffee',
      description: 'Chilled coffee with milk and a smooth finish.',
      price: 150,
      available: true,
      categoryId: coldCoffee.id,
    },
    create: {
      id: `${cafe.id}-cold-coffee`,
      cafeId: cafe.id,
      categoryId: coldCoffee.id,
      name: 'Cold Coffee',
      description: 'Chilled coffee with milk and a smooth finish.',
      price: 150,
      available: true,
      sortOrder: 1,
    },
  });

  await prisma.menuItem.upsert({
    where: {
      id: `${cafe.id}-masala-tea`,
    },
    update: {
      name: 'Masala Tea',
      description: 'Black tea with milk and aromatic Indian spices.',
      price: 60,
      available: true,
      categoryId: tea.id,
    },
    create: {
      id: `${cafe.id}-masala-tea`,
      cafeId: cafe.id,
      categoryId: tea.id,
      name: 'Masala Tea',
      description: 'Black tea with milk and aromatic Indian spices.',
      price: 60,
      available: true,
      sortOrder: 1,
    },
  });

  console.log('Seed data inserted successfully.');
  console.log(`Cafe: ${cafe.name}`);
  console.log(`Slug: ${cafe.slug}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });