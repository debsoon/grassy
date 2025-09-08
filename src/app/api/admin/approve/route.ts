import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createContentCoin } from '@/lib/zora'
import { distributeGrassyRewards } from '@/lib/rewards'

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

    // Update status to approved
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'APPROVED' },
    })

    // Trigger Zora content coin creation if private key is configured
    if (process.env.PRIVATE_KEY) {
      try {
        // Generate coin name and symbol from caption
        const coinName = `Grassy: ${submission.caption.slice(0, 30)}${submission.caption.length > 30 ? '...' : ''}`
        const coinSymbol = `GRASSY${submission.id.slice(-4).toUpperCase()}`
        
        // Create the full image URL (assuming your server is running on localhost:3000)
        const fullImageUrl = submission.imageUrl.startsWith('http') 
          ? submission.imageUrl 
          : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${submission.imageUrl}`

        const mintResult = await createContentCoin(
          process.env.PRIVATE_KEY,
          fullImageUrl,
          submission.caption,
          coinName,
          coinSymbol,
          process.env.GRASSY_CREATOR_ADDRESS!,
          submission.submitterAddress || undefined
        )
        
        if (mintResult.success) {
          await prisma.submission.update({
            where: { id: submissionId },
            data: { 
              status: 'MINTED',
              zoraMintTx: mintResult.hash,
              contentCoinAddress: mintResult.contractAddress,
            },
          })
          
          // Distribute $GRASSY token rewards (if enabled)
          if (submission.submitterAddress && process.env.GRASSY_TOKEN_ADDRESS && process.env.ENABLE_REWARDS === 'true') {
            try {
              const rewardResult = await distributeGrassyRewards(
                process.env.PRIVATE_KEY,
                submission.submitterAddress,
                "20000", // 20,000 $GRASSY tokens reward
                process.env.GRASSY_TOKEN_ADDRESS
              )
              
              if (rewardResult.success) {
                await prisma.submission.update({
                  where: { id: submissionId },
                  data: { 
                    status: 'REWARDED',
                    tokenRewardTx: rewardResult.hash,
                  },
                })
              } else {
                console.error('Reward distribution failed:', rewardResult.error)
                // Keep as MINTED but log the error
              }
            } catch (error) {
              console.error('Reward distribution error:', error)
            }
          } else {
            console.log('Token rewards disabled or not configured - content coin created successfully')
            // Status stays as MINTED until rewards are enabled
          }
          
        } else {
          console.error('Content coin creation failed:', mintResult.error)
          // Keep as APPROVED but log the error
        }
      } catch (error) {
        console.error('Minting failed:', error)
        // Keep as APPROVED but log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Submission approved successfully',
    })
  } catch (error) {
    console.error('Approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}