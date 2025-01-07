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

    const channels = await prisma.channel.findMany({
      where: {
        workspaceId: params.workspaceId,
        members: {
          some: {
            userId: userId
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

    const { name, description } = await request.json()

    // Check if user is a member of the workspace
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: params.workspaceId,
        }
      }
    })

    if (!workspaceMember) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        description,
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