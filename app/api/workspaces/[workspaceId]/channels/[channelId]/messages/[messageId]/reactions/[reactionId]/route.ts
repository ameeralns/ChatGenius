import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string; channelId: string; messageId: string; reactionId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const reaction = await prisma.reaction.findUnique({
      where: {
        id: params.reactionId,
      },
    })

    if (!reaction) {
      return new NextResponse('Reaction not found', { status: 404 })
    }

    if (reaction.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.reaction.delete({
      where: {
        id: params.reactionId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[REACTION_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 