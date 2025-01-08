import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, color } = await req.json();
    
    // First ensure user exists in the database
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    })

    const workspace = await prisma.workspace.create({
      data: {
        name,
        color,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
        channels: {
          create: {
            name: 'general',
            channelMembers: {
              create: {
                userId
              }
            }
          }
        }
      },
      include: {
        channels: true
      }
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
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