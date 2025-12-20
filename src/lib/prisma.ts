import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization to handle build-time scenarios
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }

    return client
  } catch (error) {
    // During build time, Prisma client might not be initialized
    console.warn('Prisma client not initialized. Run prisma generate first.')
    return {} as PrismaClient
  }
}

export const prisma = getPrismaClient()

export default prisma
