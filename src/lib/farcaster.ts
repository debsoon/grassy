import { getSSLHubRpcClient } from '@farcaster/hub-nodejs'
import axios from 'axios'

export const FARCASTER_HUB_URL = 'https://nemes.farcaster.xyz:2281'

// Farcaster Hub client
const hubClient = getSSLHubRpcClient(FARCASTER_HUB_URL)

export async function getFidFromUsername(username: string): Promise<number | null> {
  try {
    // Remove @ if present
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username
    
    // Use Farcaster directory API to get FID from username
    const response = await axios.get(`https://fnames.farcaster.xyz/transfers?name=${cleanUsername}`)
    
    if (response.data && response.data.transfers && response.data.transfers.length > 0) {
      // Get the most recent transfer (current owner)
      const latestTransfer = response.data.transfers[response.data.transfers.length - 1]
      return latestTransfer.to
    }
    
    return null
  } catch (error) {
    console.error('Error getting FID from username:', error)
    return null
  }
}

export async function getWalletAddressFromFid(fid: number): Promise<string | null> {
  try {
    // This function is deprecated - we now use direct wallet connection in Mini App
    console.log('getWalletAddressFromFid called with FID:', fid)
    return null
  } catch (error) {
    console.error('Error getting wallet address from FID:', error)
    return null
  }
}

export async function getWalletAddressFromUsername(username: string): Promise<{ success: boolean; address?: string; fid?: number; error?: string }> {
  try {
    // Step 1: Get FID from username
    const fid = await getFidFromUsername(username)
    if (!fid) {
      return {
        success: false,
        error: `Username @${username} not found on Farcaster`
      }
    }
    
    // Step 2: Get wallet address from FID
    const address = await getWalletAddressFromFid(fid)
    if (!address) {
      return {
        success: false,
        fid,
        error: `No verified wallet address found for @${username}`
      }
    }
    
    return {
      success: true,
      address,
      fid,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function validateFrameSignature(_trustedData: string) {
  // This will validate Farcaster frame messages
  // Implementation will be added when we integrate frame validation
  return { isValid: false, message: null }
}

export function getFrameHtml(
  imageUrl: string, 
  postUrl: string,
  buttonText: string = "Submit to Grassy"
): string {
  return `
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:button:1" content="${buttonText}" />
        <meta property="fc:frame:post_url" content="${postUrl}" />
        <meta property="og:image" content="${imageUrl}" />
        <title>Grassy - Submit Your Content</title>
      </head>
      <body>
        <h1>Grassy Mini App</h1>
        <p>Submit your image and caption to be featured on Grassy!</p>
      </body>
    </html>
  `
}