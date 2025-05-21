import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Create a dummy client during build time if DATABASE_URL is not available
const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://dummy:dummy@localhost:5432/dummy'
        }
      }
    })
  }
  return new PrismaClient()
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma 