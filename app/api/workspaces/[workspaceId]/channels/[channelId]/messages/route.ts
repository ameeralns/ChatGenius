import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string; channelId: string } }
) {
  try {
    const { userId } = auth()
    const currentUserData = await currentUser()
    
    if (!userId || !currentUserData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await req.json()

    // First check if user exists
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // If user doesn't exist, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: currentUserData.firstName || currentUserData.username || 'Unknown',
          imageUrl: currentUserData.imageUrl,
        }
      })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content: content,
        userId: user.id,
        channelId: params.channelId,
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Detailed error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; channelId: string } }
) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        channelId: params.channelId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 