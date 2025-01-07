import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emoji } = await req.json()
    
    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 })
    }

    console.log('Creating reaction:', {
      messageId: params.messageId,
      userId,
      emoji
    })

    // Create reaction with correct user field selection
    const reaction = await prisma.reaction.create({
      data: {
        emoji,
        userId,
        messageId: params.messageId,
      },
      include: {
        user: {
          select: {
            id: true,
            imageUrl: true
          },
        },
      },
    })

    console.log('Reaction created:', reaction)

    return NextResponse.json(reaction)
  } catch (error) {
    console.error('Detailed reaction error:', {
      error,
      code: error instanceof Error ? (error as any).code : undefined,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already added this reaction' },
        { status: 400 }
      )
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to add reaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emoji } = await req.json()

    await prisma.reaction.deleteMany({
      where: {
        messageId: params.messageId,
        userId,
        emoji,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete reaction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove reaction' },
      { status: 500 }
    )
  }
} 