import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const caption = formData.get('caption') as string
    const walletAddress = formData.get('walletAddress') as string

    if (!image || !caption || !walletAddress) {
      return NextResponse.json(
        { error: 'Image, caption, and wallet address are required' },
        { status: 400 }
      )
    }

    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExtension = image.name.split('.').pop() || 'jpg'
    const fileName = `${randomUUID()}.${fileExtension}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, fileName)

    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error('File write error:', error)
      return NextResponse.json(
        { error: 'Failed to save image' },
        { status: 500 }
      )
    }

    const imageUrl = `/uploads/${fileName}`

    const submission = await prisma.submission.create({
      data: {
        imageUrl,
        caption,
        submitterFid: walletAddress, // Using wallet address as identifier
        submitterAddress: walletAddress,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Submission received successfully',
    })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}