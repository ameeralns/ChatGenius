import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { messageId, channelId } = await req.json()

    await prisma.message.update({
      where: { id: messageId },
      data: {
        readBy: {
          push: userId
        }
      }
    })

    await pusherServer.trigger(
      `channel-${channelId}`,
      'message-read',
      { messageId, userId }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[MESSAGE_READ]', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 