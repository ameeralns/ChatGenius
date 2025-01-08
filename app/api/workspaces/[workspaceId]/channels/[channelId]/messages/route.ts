import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string; channelId: string } }
) {
  try {
    const { userId } = auth()
    const clerkUser = await currentUser()
    
    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await req.json()

    // Verify channel exists and belongs to workspace
    const channel = await prisma.channel.findFirst({
      where: {
        id: params.channelId,
        workspaceId: params.workspaceId
      }
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Create or update user with Clerk data
    const user = await prisma.user.upsert({
      where: { 
        id: userId 
      },
      update: {
        name: clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`
          : clerkUser.username || 'Unknown User',
        imageUrl: clerkUser.imageUrl || '',
      },
      create: {
        id: userId,
        name: clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`
          : clerkUser.username || 'Unknown User',
        imageUrl: clerkUser.imageUrl || '',
      }
    })

    // Create message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        userId: user.id,
        channelId: params.channelId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        },
        reactions: true
      }
    })

    // Format message for frontend
    const formattedMessage = {
      id: message.id,
      content: message.content,
      userId: message.userId,
      createdAt: message.createdAt,
      user: {
        id: user.id,
        name: user.name,
        imageUrl: user.imageUrl
      },
      reactions: []
    }

    return NextResponse.json(formattedMessage)
  } catch (error) {
    console.error('[MESSAGES_POST]', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; channelId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get messages with user data and reactions
    const messages = await prisma.message.findMany({
      where: {
        channelId: params.channelId,
        channel: {
          workspaceId: params.workspaceId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      userId: message.userId,
      createdAt: message.createdAt,
      user: {
        id: message.user.id,
        name: message.user.name,
        imageUrl: message.user.imageUrl
      },
      reactions: message.reactions.map(reaction => ({
        emoji: reaction.emoji,
        userId: reaction.userId
      }))
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('[MESSAGES_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
} 