import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is a member of the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: params.workspaceId,
        }
      },
      include: {
        workspace: true
      }
    })

    if (!member) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Generate a unique invite link
    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId: params.workspaceId,
        invitedById: userId,
        email: '', // Will be filled when used
        status: 'PENDING'
      }
    })

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.id}`

    return NextResponse.json({ inviteLink })
  } catch (error) {
    console.error('[WORKSPACE_INVITE_LINK]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 