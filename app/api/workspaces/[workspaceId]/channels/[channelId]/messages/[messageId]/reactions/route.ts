import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string; channelId: string; messageId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { emoji } = await request.json()

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        messageId: params.messageId,
        userId,
        emoji,
      },
    })

    if (existingReaction) {
      return new NextResponse('Reaction already exists', { status: 400 })
    }

    const reaction = await prisma.reaction.create({
      data: {
        emoji,
        userId,
        messageId: params.messageId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(reaction)
  } catch (error) {
    console.error('[REACTIONS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 