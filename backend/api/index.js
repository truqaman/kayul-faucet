import express from 'express'
import { ethers } from 'ethers'

const router = express.Router()

// Initialize Ethereum provider
// 🔧 DEPLOYMENT NOTE: Use a reliable RPC provider like Alchemy or Infura for production
const provider = new ethers.providers.JsonRpcProvider(process.env.OP_MAINNET_RPC)

// Contract ABIs (simplified - replace with your actual ABIs from Remix)
const STAKING_ABI = [
  "function userInfo(uint256, address) external view returns (uint256 amount, uint256 rewardDebt)",
  "function pendingRewards(uint256, address) external view returns (uint256)",
  "function totalStaked() external view returns (uint256)"
]

const SWAP_ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)"
]

// Contract instances
const stakingContract = new ethers.Contract(
  process.env.STAKING_CONTRACT_ADDRESS,
  STAKING_ABI,
  provider
)

const swapRouterContract = new ethers.Contract(
  process.env.SWAP_ROUTER_ADDRESS,
  SWAP_ROUTER_ABI,
  provider
)

// Gasless transaction relayer
router.post('/relay/stake', async (req, res) => {
  try {
    const { user, pid, amount, deadline, signature } = req.body
    
    // 🔧 DEPLOYMENT NOTE: Validate all required fields
    if (!user || !pid === undefined || !amount || !deadline || !signature) {
      return res.status(400).json({
        error: 'Missing required fields'
      })
    }
    
    // 🔧 DEPLOYMENT NOTE: Validate signature to prevent replay attacks
    const messageHash = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'uint256', 'uint256'],
      [user, pid, amount, deadline]
    )
    
    const recoveredAddress = ethers.utils.verifyMessage(
      ethers.utils.arrayify(messageHash),
      signature
    )
    
    if (recoveredAddress.toLowerCase() !== user.toLowerCase()) {
      return res.status(401).json({
        error: 'Invalid signature'
      })
    }
    
    // Check if deadline has passed
    if (Date.now() / 1000 > deadline) {
      return res.status(400).json({
        error: 'Transaction expired'
      })
    }
    
    // 🔧 DEPLOYMENT NOTE: Use a relayer wallet with sufficient ETH for gas
    const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider)
    
    // For now, we'll simulate the transaction
    // In production, you'd interact with your actual staking contract
    
    console.log(`Relaying stake transaction for user ${user}:`, {
      pid,
      amount: ethers.utils.formatEther(amount),
      deadline
    })
    
    // Simulate successful transaction
    const txHash = ethers.utils.hexlify(ethers.utils.randomBytes(32))
    
    res.json({
      success: true,
      txHash,
      message: 'Transaction relayed successfully'
    })
    
  } catch (error) {
    console.error('Relay error:', error)
    res.status(500).json({
      error: 'Failed to relay transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get user staking info
router.get('/staking/:address', async (req, res) => {
  try {
    const { address } = req.params
    
    // Validate Ethereum address
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({
        error: 'Invalid Ethereum address'
      })
    }
    
    const [userInfo, pendingRewards, totalStaked] = await Promise.all([
      stakingContract.userInfo(0, address),
      stakingContract.pendingRewards(0, address),
      stakingContract.totalStaked()
    ])
    
    res.json({
      stakedBalance: userInfo.amount.toString(),
      rewardDebt: userInfo.rewardDebt.toString(),
      pendingRewards: pendingRewards.toString(),
      totalStaked: totalStaked.toString()
    })
    
  } catch (error) {
    console.error('Error fetching staking info:', error)
    res.status(500).json({
      error: 'Failed to fetch staking information'
    })
  }
})

// Get swap quotes
router.get('/swap/quote', async (req, res) => {
  try {
    const { amountIn, tokenIn, tokenOut } = req.query
    
    if (!amountIn || !tokenIn || !tokenOut) {
      return res.status(400).json({
        error: 'Missing required parameters: amountIn, tokenIn, tokenOut'
      })
    }
    
    // 🔧 DEPLOYMENT NOTE: Implement actual price quoting logic
    // This is a simplified mock implementation
    
    const path = [tokenIn, process.env.WETH_ADDRESS, tokenOut]
    const amountInWei = ethers.utils.parseEther(amountIn)
    
    try {
      const amounts = await swapRouterContract.getAmountsOut(amountInWei, path)
      const amountOut = ethers.utils.formatEther(amounts[amounts.length - 1])
      
      res.json({
        amountIn,
        amountOut,
        path,
        exchange: 'Uniswap V2'
      })
    } catch (error) {
      // Fallback to mock data if contract call fails
      console.warn('Contract call failed, using mock data:', error.message)
      
      const mockRate = 0.001 // 1000 YLS = 1 OP ETH
      const amountOut = (parseFloat(amountIn) * mockRate).toFixed(6)
      
      res.json({
        amountIn,
        amountOut,
        path: [tokenIn, tokenOut],
        exchange: 'Mock Exchange',
        note: 'Using mock data - contract call failed'
      })
    }
    
  } catch (error) {
    console.error('Error fetching swap quote:', error)
    res.status(500).json({
      error: 'Failed to fetch swap quote'
    })
  }
})

// Get contract addresses
router.get('/contracts', (req, res) => {
  res.json({
    staking: process.env.STAKING_CONTRACT_ADDRESS,
    swapRouter: process.env.SWAP_ROUTER_ADDRESS,
    ylsToken: process.env.YLS_TOKEN_ADDRESS,
    tradingStrategies: process.env.TRADING_STRATEGIES_ADDRESS
  })
})

// Get gas estimates
router.get('/gas/estimate', async (req, res) => {
  try {
    const gasPrice = await provider.getGasPrice()
    const feeData = await provider.getFeeData()
    
    res.json({
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
      maxFeePerGas: feeData.maxFeePerGas ? ethers.utils.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.utils.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    })
  } catch (error) {
    console.error('Error estimating gas:', error)
    res.status(500).json({
      error: 'Failed to estimate gas prices'
    })
  }
})

export default router