import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await clerkClient.users.getUser(params.userId)
    
    // Return only public information
    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      bio: user.publicMetadata.bio,
    })
  } catch (error) {
    console.error('[USER_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 