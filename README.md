# Inventory Reservation System

A full-stack Next.js application for handling multi-warehouse inventory reservations with concurrency safety.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** PostgreSQL (Prisma ORM)
- **Cache/Locking:** Redis (Upstash)
- **Validation:** Zod
- **UI:** Tailwind CSS + shadcn/ui + Sonner

## Core Features
1. **Real-time Inventory:** View stock across multiple warehouses.
2. **Atomic Reservations:** 10-minute hold on items to prevent overselling.
3. **Concurrency Control:** Distributed locking using Redis to handle high-traffic race conditions.
4. **Idempotency:** `Idempotency-Key` support for safe retries on reservation creation.
5. **Countdown Timer:** Live countdown for active reservations.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://user:password@host:port/db"
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Seeding
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```

## How It Works

### Concurrency Approach
To prevent overselling when multiple users try to reserve the last item:
1. **Redis Lock:** Before checking stock or creating a reservation, the API acquires a distributed lock on the specific `productId:warehouseId` key.
2. **Prisma Transaction:** Inside the lock, a database transaction is used to:
   - Check current available stock (`totalStock - reservedStock`).
   - Create the `Reservation` record.
   - Increment `reservedStock` in the `Inventory` table.
3. **Release:** The lock is released after the transaction completes or fails.

This ensures that only one process can modify the inventory for a specific product/warehouse at a time, providing strong consistency.

### Reservation Expiry
Reservations expire after 10 minutes. This is handled via:
1. **Lazy Cleanup:** When a user attempts to confirm a reservation, the system checks the expiry. If expired, it automatically releases the stock and marks the reservation as `RELEASED`.
2. **Cron Job (Recommended):** A `POST /api/cron/cleanup` endpoint is provided to batch-release all expired `PENDING` reservations. This can be scheduled via Vercel Cron.

### Idempotency
Clients can send an `Idempotency-Key` header. The server stores the response of successful (and some failed) requests in Redis for 24 hours. Subsequent requests with the same key will return the cached response without re-executing the logic.

## Trade-offs
- **Redis Dependency:** Adding Redis increases system complexity but provides better distributed locking than pure database locks in highly distributed environments (like Vercel).
- **Lock Contention:** High traffic on a single item might cause some requests to wait/retry for the lock (handled with a retry mechanism in `lib/lock.ts`).
- **Storage:** Idempotency keys consume Redis memory, so they are set to expire after 24 hours.
