import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test the connection
    const result = await prisma.$queryRaw`SELECT 1+1 as result`
    
    // Try to count workspaces as a real table test
    const workspaceCount = await prisma.workspace.count()
    
    return NextResponse.json({ 
      status: 'Connected',
      test: result,
      workspaceCount,
      message: 'Database is connected and working'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      status: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 