import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, color } = await request.json();

    if (!name?.trim()) {
      return new NextResponse('Workspace name is required', { status: 400 });
    }

    // Create workspace with color
    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        color: color || '#4A5568', // Default color if none provided
        members: {
          create: {
            userId,
            role: 'ADMIN'
          }
        },
        channels: {
          create: {
            name: 'general',
            members: {
              create: {
                userId
              }
            }
          }
        }
      }
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

    // Get all workspaces where the user is a member
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('[WORKSPACES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 