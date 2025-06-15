import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Create a dummy client during build time if DATABASE_URL is not available
const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set in production environment');
    return new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://dummy:dummy@localhost:5432/dummy'
        }
      }
    })
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Please check your .env file.');
    throw new Error('DATABASE_URL is not set');
  }

  // Log the database URL (without password) for debugging
  const dbUrl = new URL(process.env.DATABASE_URL);
  console.log(`Attempting to connect to database at ${dbUrl.hostname}:${dbUrl.port}`);

  return new PrismaClient({
    log: ['error', 'warn', 'info', 'query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma 