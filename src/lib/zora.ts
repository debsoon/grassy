import { createCoin, CreateConstants } from '@zoralabs/coins-sdk'
import { createPublicClient, createWalletClient, http } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export function createWalletFromPrivateKey(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`)
  return createWalletClient({
    account,
    chain: base,
    transport: http(),
  })
}

export async function createContentCoin(
  privateKey: string,
  imageUrl: string,
  caption: string,
  coinName: string,
  coinSymbol: string,
  creatorAddress: string,
  submitterWalletAddress?: string
) {
  try {
    const walletClient = createWalletFromPrivateKey(privateKey)
    
    // Create metadata URI for the coin
    const metadata = {
      name: coinName,
      description: caption,
      image: imageUrl,
    }
    
    // For now, we'll use a placeholder metadata URI
    // In production, you'd upload this metadata to IPFS
    const metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`
    
    const coinArgs = {
      creator: creatorAddress as `0x${string}`, // @grassy profile address
      name: coinName,
      symbol: coinSymbol,
      metadata: {
        type: "RAW_URI" as const,
        uri: metadataUri,
      },
      currency: CreateConstants.ContentCoinCurrencies.CREATOR_COIN, // $GRASSY token as backing currency
      chainId: base.id,
      additionalOwners: submitterWalletAddress ? [submitterWalletAddress as `0x${string}`] : undefined,
    }

    const result = await createCoin({
      call: coinArgs,
      walletClient, // Your personal wallet pays for transaction
      publicClient,
    })

    return {
      success: true,
      hash: result.hash,
      contractAddress: result.address,
      deployment: result.deployment,
    }
  } catch (error) {
    console.error('Error creating content coin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function uploadToIpfs(_imageFile: File, _metadata: unknown) {
  // This would typically upload to IPFS via Pinata, web3.storage, etc.
  // For now, return a placeholder
  return {
    imageUri: `ipfs://placeholder-image-hash`,
    metadataUri: `ipfs://placeholder-metadata-hash`,
  }
}