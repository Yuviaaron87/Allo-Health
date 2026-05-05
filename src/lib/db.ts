import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = () => {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error('DATABASE_URL is missing');
      return new PrismaClient(); // Fallback to default (will likely fail later but won't crash module load)
    }

    const pool = new pg.Pool({ 
      connectionString: url,
      ssl: url.includes('sslmode=require') || url.includes('supabase.co') || url.includes('neon.tech') 
        ? { rejectUnauthorized: false } 
        : false
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error);
    return new PrismaClient();
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
