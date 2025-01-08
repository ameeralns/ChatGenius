import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string; channelId: string; messageId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { emoji } = await req.json()

    // Create the reaction
    const reaction = await prisma.reaction.create({
      data: {
        emoji,
        userId,
        messageId: params.messageId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    // Format the reaction for real-time update
    const formattedReaction = {
      emoji: reaction.emoji,
      userId: reaction.userId,
      userName: reaction.user.name,
    }

    // Trigger real-time update
    await pusherServer.trigger(
      `channel-${params.channelId}`,
      'new-reaction',
      {
        messageId: params.messageId,
        reaction: formattedReaction,
      }
    )

    return NextResponse.json(formattedReaction)
  } catch (error) {
    console.error('[REACTION_POST]', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 