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

    // Check if user is workspace admin
    const member = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: params.workspaceId,
        role: 'ADMIN'
      }
    })

    if (!member) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${params.workspaceId}`
    
    return NextResponse.json({ inviteLink })
  } catch (error) {
    console.error('[INVITE_LINK_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 