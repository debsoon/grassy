import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // Find the submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    if (submission.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Submission is not pending' },
        { status: 400 }
      )
    }

    // Update status to rejected
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'REJECTED' },
    })

    return NextResponse.json({
      success: true,
      message: 'Submission rejected successfully',
    })
  } catch (error) {
    console.error('Rejection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}