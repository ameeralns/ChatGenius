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

    const invite = await prisma.workspaceInvite.findUnique({
      where: {
        email_workspaceId: {
          email,
          workspaceId: params.workspaceId,
        },
      },
    })

    if (!invite || invite.status !== 'PENDING') {
      return new NextResponse('Invalid invite', { status: 404 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('[INVITE_VERIFY]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 