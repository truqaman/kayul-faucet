// components/SwapInterface.jsx
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function SwapInterface({ embeddedWallet }) {
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [fromToken, setFromToken] = useState('YLS')
  const [toToken, setToToken] = useState('OP_ETH')
  const [loading, setLoading] = useState(false)
  const [slippage, setSlippage] = useState(0.5)

  const handleSwap = async () => {
    if (!embeddedWallet || !fromAmount) return
    
    setLoading(true)
    try {
      const provider = await embeddedWallet.getEthersProvider()
      const signer = provider.getSigner()
      
      // Mock swap implementation - replace with actual contract call
      const swapRouterAddress = process.env.NEXT_PUBLIC_SWAP_ROUTER
      
      // For now, we'll simulate a swap
      alert(`Swap ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`)
      
      // In production, you'd call your swap router contract
      // const tx = await swapRouter.swapTokens(...)
      
    } catch (error) {
      console.error('Swap failed:', error)
      alert('Swap failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const calculateRate = () => {
    // Mock rate calculation - replace with actual price feed
    if (fromToken === 'YLS' && toToken === 'OP_ETH') {
      return 0.001 // 1000 YLS = 1 OP ETH
    }
    return 1
  }

  useEffect(() => {
    if (fromAmount) {
      const rate = calculateRate()
      setToAmount((parseFloat(fromAmount) * rate).toFixed(6))
    } else {
      setToAmount('')
    }
  }, [fromAmount, fromToken, toToken])

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Swap Tokens</h2>
        
        {/* From Token */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">From</span>
            <span className="text-gray-400">Balance: 0</span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-bold text-white focus:outline-none"
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="YLS">YL$</option>
              <option value="ETH">ETH</option>
            </select>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-2 z-10 relative">
          <button
            onClick={handleSwitchTokens}
            className="bg-gray-600 hover:bg-gray-500 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          >
            ↓
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">To</span>
            <span className="text-gray-400">Balance: 0</span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-bold text-white focus:outline-none"
            />
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="OP_ETH">OP ETH</option>
              <option value="YLS">YL$</option>
            </select>
          </div>
        </div>

        {/* Slippage Settings */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Slippage Tolerance</label>
          <div className="flex space-x-2">
            {[0.1, 0.5, 1.0].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  slippage === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {value}%
              </button>
            ))}
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value))}
              step="0.1"
              min="0.1"
              max="5"
              className="w-20 bg-gray-600 text-white px-3 py-2 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-xl font-bold text-lg transition-colors"
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>
      </div>
    </div>
  )
}