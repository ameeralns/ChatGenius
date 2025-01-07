import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { bio } = await request.json()

    const userProfile = await prisma.userProfile.upsert({
      where: {
        userId: userId,
      },
      update: {
        bio: bio,
      },
      create: {
        userId: userId,
        bio: bio,
      },
    })

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('[BIO_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 