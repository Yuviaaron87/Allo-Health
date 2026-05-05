import 'dotenv/config';
import { PrismaClient } from '../src/generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Create products
  const p1 = await prisma.product.create({
    data: {
      name: 'MacBook Pro 14"',
      description: 'M3 Pro chip, 18GB RAM, 512GB SSD',
    },
  });

  const p2 = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro',
      description: 'Titanium, 128GB, Natural Titanium',
    },
  });

  const p3 = await prisma.product.create({
    data: {
      name: 'Sony WH-1000XM5',
      description: 'Wireless Noise Canceling Headphones',
    },
  });

  // Create warehouses
  const w1 = await prisma.warehouse.create({
    data: {
      name: 'New York Central',
      location: 'Queens, NY',
    },
  });

  const w2 = await prisma.warehouse.create({
    data: {
      name: 'California Hub',
      location: 'San Francisco, CA',
    },
  });

  // Create initial inventory
  await prisma.inventory.createMany({
    data: [
      { productId: p1.id, warehouseId: w1.id, totalStock: 10, reservedStock: 0 },
      { productId: p1.id, warehouseId: w2.id, totalStock: 5, reservedStock: 0 },
      { productId: p2.id, warehouseId: w1.id, totalStock: 20, reservedStock: 0 },
      { productId: p2.id, warehouseId: w2.id, totalStock: 15, reservedStock: 0 },
      { productId: p3.id, warehouseId: w1.id, totalStock: 50, reservedStock: 0 },
      { productId: p3.id, warehouseId: w2.id, totalStock: 30, reservedStock: 0 },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
