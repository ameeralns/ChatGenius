import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { email } = await request.json()

    // Update invite status and create workspace member
    await prisma.$transaction([
      prisma.workspaceInvite.update({
        where: {
          email_workspaceId: {
            email,
            workspaceId: params.workspaceId,
          },
        },
        data: {
          status: 'ACCEPTED',
        },
      }),
      prisma.workspaceMember.create({
        data: {
          userId,
          workspaceId: params.workspaceId,
          role: 'MEMBER',
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[INVITE_ACCEPT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 