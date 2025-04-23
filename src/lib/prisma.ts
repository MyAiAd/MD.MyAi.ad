// src/lib/prisma.ts
// Importing directly from the module since structure changed in v6
import prisma from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: typeof prisma | undefined
}

// Initialize the prisma client
export const prisma = global.prismaClient || new prisma.PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') global.prismaClient = prisma

export default prisma
