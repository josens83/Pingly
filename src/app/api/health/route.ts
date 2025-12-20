import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const timestamp = new Date().toISOString()
  
  try {
    // DB 연결 확인
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({
      status: 'healthy',
      timestamp,
      services: {
        database: 'connected',
        api: 'running',
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return Response.json({
      status: 'unhealthy',
      timestamp,
      services: {
        database: 'disconnected',
        api: 'running',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 })
  }
}
