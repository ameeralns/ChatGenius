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

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: params.workspaceId
      }
    })

    if (!workspace) {
      return new NextResponse('Workspace not found', { status: 404 })
    }

    return NextResponse.json(workspace)
  } catch (error) {
    console.error('[WORKSPACE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 