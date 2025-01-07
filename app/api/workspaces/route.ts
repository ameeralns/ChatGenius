import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, imageUrl } = await request.json();

    const workspace = await prisma.$transaction(async (tx) => {
      // Create the workspace
      const workspace = await tx.workspace.create({
        data: {
          name,
          imageUrl,
          members: {
            create: {
              userId,
              role: 'ADMIN'
            }
          }
        }
      });

      // Create default general channel
      await tx.channel.create({
        data: {
          name: 'general',
          workspaceId: workspace.id,
          members: {
            create: {
              userId
            }
          }
        }
      });

      return workspace;
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('[WORKSPACES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      }
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('[WORKSPACES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 