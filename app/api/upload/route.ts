import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
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

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('[UPLOAD_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 