import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// 🔧 DEPLOYMENT NOTE: Replace with your actual staking contract ABI from Remix
const STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function userInfo(uint256, address) external view returns (uint256 amount, uint256 rewardDebt)",
  "function pendingRewards(uint256, address) external view returns (uint256)",
  "function totalStaked() external view returns (uint256)",
  "function rewardPerBlock() external view returns (uint256)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)"
]

// 🔧 DEPLOYMENT NOTE: Update this address after deploying your staking contract
const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT

export default function StakingInterface({ embeddedWallet }) {
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [userStaked, setUserStaked] = useState('0')
  const [pendingRewards, setPendingRewards] = useState('0')
  const [totalStaked, setTotalStaked] = useState('0')
  const [rewardRate, setRewardRate] = useState('0')
  const [loading, setLoading] = useState(false)
  const [contract, setContract] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (embeddedWallet && STAKING_CONTRACT_ADDRESS) {
      initializeContract()
    }
  }, [embeddedWallet])

  const initializeContract = async () => {
    if (!embeddedWallet || !STAKING_CONTRACT_ADDRESS) {
      setError('Staking contract not configured')
      return
    }
    
    try {
      const provider = await embeddedWallet.getEthersProvider()
      const signer = provider.getSigner()
      
      const stakingContract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        signer
      )
      
      setContract(stakingContract)
      await loadStakingData(stakingContract)
    } catch (error) {
      console.error('Contract initialization failed:', error)
      setError('Failed to connect to staking contract')
    }
  }

  const loadStakingData = async (stakingContract = contract) => {
    if (!stakingContract || !embeddedWallet) return
    
    try {
      const address = await embeddedWallet.getAddress()
      
      const [userInfo, rewards, total, rate] = await Promise.all([
        stakingContract.userInfo(0, address),
        stakingContract.pendingRewards(0, address),
        stakingContract.totalStaked(),
        stakingContract.rewardPerBlock()
      ])
      
      setUserStaked(ethers.utils.formatEther(userInfo.amount))
      setPendingRewards(ethers.utils.formatEther(rewards))
      setTotalStaked(ethers.utils.formatEther(total))
      setRewardRate(ethers.utils.formatEther(rate))
    } catch (error) {
      console.error('Error loading staking data:', error)
      setError('Failed to load staking data')
    }
  }

  const handleStake = async () => {
    if (!contract || !stakeAmount) {
      setError('Please enter an amount to stake')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const tx = await contract.stake(
        ethers.utils.parseEther(stakeAmount),
        { gasLimit: 300000 }
      )
      
      // 🔧 DEPLOYMENT NOTE: Consider showing a transaction progress modal
      alert(`✅ Staking transaction submitted!\n\nTransaction Hash: ${tx.hash}`)
      
      const receipt = await tx.wait()
      console.log('Staking confirmed:', receipt)
      
      // Refresh data
      await loadStakingData()
      setStakeAmount('')
      
      // Track successful stake
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'stake_success', {
          amount: stakeAmount
        })
      }
    } catch (error) {
      console.error('Staking failed:', error)
      setError('Staking failed: ' + error.message)
      
      // Track stake failure
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'stake_failed', {
          error: error.message
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUnstake = async () => {
    if (!contract || !unstakeAmount) {
      setError('Please enter an amount to unstake')
      return
    }
    
    if (parseFloat(unstakeAmount) > parseFloat(userStaked)) {
      setError('Cannot unstake more than you have staked')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const tx = await contract.unstake(
        ethers.utils.parseEther(unstakeAmount),
        { gasLimit: 300000 }
      )
      
      alert(`✅ Unstaking transaction submitted!\n\nTransaction Hash: ${tx.hash}`)
      
      await tx.wait()
      await loadStakingData()
      setUnstakeAmount('')
      
      // Track successful unstake
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'unstake_success', {
          amount: unstakeAmount
        })
      }
    } catch (error) {
      console.error('Unstaking failed:', error)
      setError('Unstaking failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMaxStake = () => {
    // 🔧 DEPLOYMENT NOTE: In production, you'd check the user's actual YL$ balance
    // For now, we'll set a reasonable maximum
    setStakeAmount('1000')
  }

  const handleMaxUnstake = () => {
    setUnstakeAmount(userStaked)
  }

  const claimRewards = async () => {
    // 🔧 DEPLOYMENT NOTE: Implement reward claiming logic
    // This would typically be a separate contract function
    alert('Reward claiming will be implemented in the next version!')
  }

  if (!STAKING_CONTRACT_ADDRESS) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h3 className="text-xl font-semibold text-white mb-2">Staking Not Configured</h3>
        <p className="text-gray-400">
          Staking contract address is not set. Please check your environment configuration.
        </p>
      </div>
    )
  }

  if (!embeddedWallet) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
        <p className="text-gray-400">Please connect your wallet to access staking.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-400 text-lg mr-2">⚠️</span>
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-bold mb-6">YL$ Staking</h2>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{userStaked}</div>
            <div className="text-gray-400 text-sm">Your Staked YL$</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{pendingRewards}</div>
            <div className="text-gray-400 text-sm">Pending OP ETH</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{totalStaked}</div>
            <div className="text-gray-400 text-sm">Total Staked</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{rewardRate}</div>
            <div className="text-gray-400 text-sm">Rewards/Block</div>
          </div>
        </div>

        {/* Stake Form */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Stake YL$</h3>
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Amount to Stake
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                className="input-primary flex-1"
                min="0"
                step="0.1"
              />
              <button
                onClick={handleMaxStake}
                className="btn-secondary px-4"
              >
                MAX
              </button>
            </div>
          </div>
          
          <button
            onClick={handleStake}
            disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
            className="w-full btn-primary"
          >
            {loading ? '🔄 Staking...' : '💰 Stake YL$'}
          </button>
        </div>

        {/* Unstake Form */}
        <div className="space-y-4 border-t border-gray-700 pt-8">
          <h3 className="text-lg font-semibold">Unstake YL$</h3>
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Amount to Unstake
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.0"
                className="input-primary flex-1"
                min="0"
                max={userStaked}
                step="0.1"
              />
              <button
                onClick={handleMaxUnstake}
                className="btn-secondary px-4"
              >
                MAX
              </button>
            </div>
          </div>
          
          <button
            onClick={handleUnstake}
            disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
            className="w-full btn-danger"
          >
            {loading ? '🔄 Unstaking...' : '📤 Unstake YL$'}
          </button>
        </div>

        {/* Claim Rewards */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Your Rewards</h3>
              <p className="text-gray-400 text-sm">
                {pendingRewards} OP ETH available to claim
              </p>
            </div>
            <button
              onClick={claimRewards}
              disabled={parseFloat(pendingRewards) <= 0}
              className="btn-primary disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              🎁 Claim Rewards
            </button>
          </div>
        </div>
      </div>

      {/* Staking Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">📈 Staking Benefits</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Earn OP ETH rewards automatically</li>
            <li>• No lock-up period - unstake anytime</li>
            <li>• Compound your earnings</li>
            <li>• Additional yield farming opportunities</li>
            <li>• Support the YuLiP$ ecosystem</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">ℹ️ How It Works</h3>
          <ul className="space-y-2 text-gray-300">
            <li>1. Stake your YL$ tokens</li>
            <li>2. Earn OP ETH rewards every block</li>
            <li>3. Unstake anytime with no penalties</li>
            <li>4. Claim rewards or auto-compound</li>
            <li>5. Monitor your earnings in real-time</li>
          </ul>
        </div>
      </div>

      {/* APY Calculator (Placeholder) */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🧮 Rewards Calculator</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">Rewards calculator coming soon!</p>
          <p className="text-gray-500 text-sm mt-1">
            Calculate your potential earnings based on current rates
          </p>
        </div>
      </div>
    </div>
  )
}