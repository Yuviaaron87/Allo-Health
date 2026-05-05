import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      ...product,
      inventory: product.inventory.map((inv) => ({
        warehouseId: inv.warehouseId,
        warehouseName: inv.warehouse.name,
        totalStock: inv.totalStock,
        reservedStock: inv.reservedStock,
        availableStock: inv.totalStock - inv.reservedStock,
      })),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
