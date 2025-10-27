import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import EmbeddedWalletDashboard from '../components/wallet/EmbeddedWalletDashboard'
import StakingInterface from '../components/staking/StakingInterface'
import SwapInterface from '../components/swap/SwapInterface'
import StrategiesInterface from '../components/strategies/StrategiesInterface'

export default function Dashboard() {
  const { ready, authenticated, user, logout } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('wallet')
  const [embeddedWallet, setEmbeddedWallet] = useState(null)
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/')
    }
  }, [ready, authenticated, router])

  // Initialize embedded wallet
  useEffect(() => {
    if (wallets.length > 0) {
      const embedded = wallets.find(w => w.walletClientType === 'privy')
      setEmbeddedWallet(embedded)
    }
    setLoading(false)
  }, [wallets])

  // Track dashboard view
  useEffect(() => {
    if (authenticated && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'dashboard_view')
    }
  }, [authenticated])

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect due to useEffect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold gradient-text">YuLiP$ Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 hidden sm:block">
                Welcome, {user.email?.address || user.wallet?.address || 'User'}
              </div>
              <button
                onClick={logout}
                className="btn-danger text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-700 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'wallet', name: '💰 Wallet', icon: '💼' },
              { id: 'staking', name: '🏦 Staking', icon: '💰' },
              { id: 'swap', name: '🔄 Swap', icon: '🔄' },
              { id: 'strategies', name: '📈 Strategies', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'wallet' && <EmbeddedWalletDashboard embeddedWallet={embeddedWallet} />}
        {activeTab === 'staking' && <StakingInterface embeddedWallet={embeddedWallet} />}
        {activeTab === 'swap' && <SwapInterface embeddedWallet={embeddedWallet} />}
        {activeTab === 'strategies' && <StrategiesInterface embeddedWallet={embeddedWallet} />}
      </main>

      {/* Mobile Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="grid grid-cols-4">
          {[
            { id: 'wallet', name: 'Wallet', icon: '💼' },
            { id: 'staking', name: 'Stake', icon: '💰' },
            { id: 'swap', name: 'Swap', icon: '🔄' },
            { id: 'strategies', name: 'Trade', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-xs flex flex-col items-center space-y-1 ${
                activeTab === tab.id
                  ? 'text-purple-400'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}