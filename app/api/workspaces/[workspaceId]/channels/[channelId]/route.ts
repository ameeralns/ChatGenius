import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string; channelId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const channel = await prisma.channel.findUnique({
      where: {
        id: params.channelId,
      }
    })

    if (!channel) {
      return new NextResponse('Channel not found', { status: 404 })
    }

    return NextResponse.json(channel)
  } catch (error) {
    console.error('[CHANNEL_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 