// src/pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

type HealthResponse = {
  status: string
  timestamp: string
  database: string
  version: string
}

// Initialize Prisma client
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'
    })
  } finally {
    await prisma.$disconnect()
  }
}
