import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { reservationSchema } from '@/lib/validations';
import { withLock } from '@/lib/lock';
import { getIdempotentResponse, saveIdempotentResponse } from '@/lib/idempotency';
import { addMinutes } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get('Idempotency-Key');
    if (idempotencyKey) {
      const cached = await getIdempotentResponse(idempotencyKey);
      if (cached) return NextResponse.json(cached.body, { status: cached.status });
    }

    const body = await req.json();
    const result = reservationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { productId, warehouseId, quantity } = result.data;

    const reservation = await withLock(`inventory:${productId}:${warehouseId}`, async () => {
      // 1. Check stock
      const inventory = await db.inventory.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId },
        },
      });

      if (!inventory) {
        throw new Error('NOT_FOUND');
      }

      if (inventory.totalStock - inventory.reservedStock < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      // 2. Create reservation and update inventory
      return await db.$transaction(async (tx) => {
        const res = await tx.reservation.create({
          data: {
            productId,
            warehouseId,
            quantity,
            expiresAt: addMinutes(new Date(), 10),
          },
        });

        await tx.inventory.update({
          where: {
            productId_warehouseId: { productId, warehouseId },
          },
          data: {
            reservedStock: { increment: quantity },
          },
        });

        return res;
      });
    });

    const response = { body: reservation, status: 201 };
    if (idempotencyKey) await saveIdempotentResponse(idempotencyKey, response);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    console.error('Reservation error:', error);
    
    let status = 500;
    let message = 'Internal Server Error';

    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        status = 404;
        message = 'Product or Warehouse not found';
      } else if (error.message === 'INSUFFICIENT_STOCK') {
        status = 409;
        message = 'Not enough stock available';
      } else if (error.message === 'Could not acquire lock') {
        status = 429;
        message = 'Server busy, please try again';
      }
    }

    // We don't necessarily want to cache 500s or 429s for idempotency in the same way, 
    // but the requirements say "Return same response for retries".
    // Usually only successful or 4xx responses are cached.
    
    return NextResponse.json({ error: message }, { status });
  }
}
