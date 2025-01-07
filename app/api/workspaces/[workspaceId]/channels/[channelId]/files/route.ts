import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string; channelId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return new NextResponse('No file provided', { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    })

    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        name: file.name,
        url: blob.url,
        size: file.size,
        type: file.type,
        channelId: params.channelId,
        uploadedById: userId,
      },
    })

    return NextResponse.json(fileRecord)
  } catch (error) {
    console.error('[FILES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 