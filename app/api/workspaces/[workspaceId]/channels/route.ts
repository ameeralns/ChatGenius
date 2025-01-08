import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const channels = await prisma.channel.findMany({
      where: {
        workspaceId: params.workspaceId,
        channelMembers: {
          some: {
            userId
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('[CHANNELS_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    // Validate channel name
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Channel name is required' }, { status: 400 })
    }

    // Check workspace membership
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: params.workspaceId
        }
      }
    })

    if (!workspaceMember) {
      return NextResponse.json({ error: 'Not a workspace member' }, { status: 403 })
    }

    // Create channel and add creator as member
    const channel = await prisma.channel.create({
      data: {
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        workspaceId: params.workspaceId,
        channelMembers: {
          create: {
            userId
          }
        }
      }
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error('[CHANNELS_POST]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
} 