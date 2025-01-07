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
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // First verify the user is a member of the workspace
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: params.workspaceId
        }
      }
    })

    if (!workspaceMember) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get channels for this specific workspace
    const channels = await prisma.channel.findMany({
      where: {
        workspaceId: params.workspaceId,
        members: {
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
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name } = await request.json()

    // Validate channel name
    if (!name?.trim()) {
      return new NextResponse('Channel name is required', { status: 400 })
    }

    // Verify user is a member of the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: params.workspaceId
        }
      }
    })

    if (!member) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Create the channel in the specific workspace
    const channel = await prisma.channel.create({
      data: {
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        workspaceId: params.workspaceId,
        members: {
          create: {
            userId
          }
        }
      }
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error('[CHANNELS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 