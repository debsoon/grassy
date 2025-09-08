import { createPublicClient, createWalletClient, http, parseUnits } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Standard ERC20 ABI for token transfers
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const

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

export async function distributeGrassyRewards(
  privateKey: string,
  recipientAddress: string,
  rewardAmount: string = "100", // Default 100 $GRASSY tokens
  tokenAddress: string
) {
  try {
    const walletClient = createWalletFromPrivateKey(privateKey)

    // Get token decimals
    const decimals = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals',
    })

    // Convert reward amount to wei (with token decimals)
    const rewardAmountWei = parseUnits(rewardAmount, decimals)

    // Check balance before transfer
    const balance = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletClient.account.address],
    })

    if (balance < rewardAmountWei) {
      return {
        success: false,
        error: `Insufficient balance. Have: ${balance}, Need: ${rewardAmountWei}`,
      }
    }

    // Execute the transfer
    const hash = await walletClient.writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipientAddress as `0x${string}`, rewardAmountWei],
    })

    return {
      success: true,
      hash,
      amount: rewardAmount,
      recipient: recipientAddress,
    }
  } catch (error) {
    console.error('Error distributing GRASSY rewards:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getGrassyBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<{ balance: bigint; decimals: number; formatted: string }> {
  try {
    const [balance, decimals] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`],
      }),
      publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ])

    const formatted = (Number(balance) / Math.pow(10, decimals)).toFixed(2)

    return {
      balance,
      decimals,
      formatted: `${formatted} GRASSY`,
    }
  } catch (error) {
    console.error('Error getting GRASSY balance:', error)
    return {
      balance: BigInt(0),
      decimals: 18,
      formatted: '0.00 GRASSY',
    }
  }
}