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

    // Check if user is a member of the channel
    const member = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId: params.channelId
        }
      }
    })

    if (!member) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const messages = await prisma.message.findMany({
      where: {
        channelId: params.channelId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 messages
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('[MESSAGES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string; channelId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content } = await request.json()

    // Check if user is a member of the channel
    const member = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId: params.channelId
        }
      }
    })

    if (!member) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const message = await prisma.message.create({
      data: {
        content,
        userId,
        channelId: params.channelId
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('[MESSAGES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 