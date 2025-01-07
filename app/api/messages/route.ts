import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const { userId } = auth()
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { content, channelId } = await req.json()

  // TODO: Save message to database
  // This is a placeholder and should be replaced with actual database operations

  const message = {
    id: Date.now().toString(),
    content,
    userId,
    channelId,
    createdAt: new Date().toISOString()
  }

  return NextResponse.json(message)
}

