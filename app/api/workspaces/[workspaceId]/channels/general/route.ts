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

    // First verify workspace exists and user is a member
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

    // Find or create the general channel
    let channel = await prisma.channel.findFirst({
      where: {
        workspaceId: params.workspaceId,
        name: 'general'
      },
      include: {
        channelMembers: true
      }
    })

    if (!channel) {
      // Create general channel if it doesn't exist
      channel = await prisma.channel.create({
        data: {
          name: 'general',
          workspaceId: params.workspaceId,
          channelMembers: {
            create: {
              userId
            }
          }
        },
        include: {
          channelMembers: true
        }
      })
    }

    // Ensure user is a member of the channel
    const isChannelMember = channel.channelMembers.some(member => member.userId === userId)
    if (!isChannelMember) {
      await prisma.channelMember.create({
        data: {
          userId,
          channelId: channel.id
        }
      })
    }

    return NextResponse.json(channel)
  } catch (error) {
    console.error('[GENERAL_CHANNEL_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 