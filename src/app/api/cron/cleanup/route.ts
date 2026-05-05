import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withLock } from '@/lib/lock';

export async function POST() {
  try {
    const expiredReservations = await db.reservation.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
    });

    for (const res of expiredReservations) {
      await withLock(`inventory:${res.productId}:${res.warehouseId}`, async () => {
        await db.$transaction(async (tx) => {
          // Double check status inside transaction
          const current = await tx.reservation.findUnique({ where: { id: res.id } });
          if (current?.status === 'PENDING') {
            await tx.reservation.update({
              where: { id: res.id },
              data: { status: 'RELEASED' },
            });

            await tx.inventory.update({
              where: {
                productId_warehouseId: {
                  productId: res.productId,
                  warehouseId: res.warehouseId,
                },
              },
              data: {
                reservedStock: { decrement: res.quantity },
              },
            });
          }
        });
      });
    }

    return NextResponse.json({ processed: expiredReservations.length });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
