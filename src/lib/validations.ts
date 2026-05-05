import { z } from 'zod';

export const reservationSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
