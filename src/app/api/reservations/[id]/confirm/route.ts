import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { withLock } from '@/lib/lock';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const reservation = await db.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Reservation is already ${reservation.status}` },
        { status: 400 }
      );
    }

    if (new Date() > reservation.expiresAt) {
      // Lazy release if expired
      await withLock(`inventory:${reservation.productId}:${reservation.warehouseId}`, async () => {
        await db.$transaction(async (tx) => {
          await tx.reservation.update({
            where: { id },
            data: { status: 'RELEASED' },
          });

          await tx.inventory.update({
            where: {
              productId_warehouseId: {
                productId: reservation.productId,
                warehouseId: reservation.warehouseId,
              },
            },
            data: {
              reservedStock: { decrement: reservation.quantity },
            },
          });
        });
      });
      return NextResponse.json({ error: 'Reservation expired' }, { status: 410 });
    }

    // Confirm reservation
    await withLock(`inventory:${reservation.productId}:${reservation.warehouseId}`, async () => {
      await db.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id },
          data: { status: 'CONFIRMED' },
        });

        await tx.inventory.update({
          where: {
            productId_warehouseId: {
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
          },
          data: {
            totalStock: { decrement: reservation.quantity },
            reservedStock: { decrement: reservation.quantity },
          },
        });
      });
    });

    return NextResponse.json({ message: 'Reservation confirmed' });
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
