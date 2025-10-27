import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Home() {
  const { login, ready, authenticated } = usePrivy()

  // Track page view for analytics
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view')
    }
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading YuLiP$ DApp...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 container-padding">
        <div className="text-white text-2xl font-bold gradient-text">
          YuLiP$ (YL$)
        </div>
        {authenticated ? (
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        ) : (
          <button 
            onClick={login}
            className="btn-primary"
          >
            Get Started
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          DeFi Made
          <span className="gradient-text block">Simple & Secure</span>
        </h1>
        <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto leading-relaxed">
          Swap, stake, and earn with YuLiP$ on Optimism. 
          No wallet extensions needed - just your email or social accounts.
        </p>
        
        {!authenticated && (
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button 
              onClick={login}
              className="btn-primary text-lg px-8 py-4"
            >
              🚀 Start Earning Now
            </button>
            <Link href="#features" className="btn-secondary text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">$YL</div>
            <div className="text-purple-200">YuLiP$ Token</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">OP</div>
            <div className="text-purple-200">Optimism Network</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">🔥</div>
            <div className="text-purple-200">Low Gas Fees</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Why Choose YuLiP$ DApp?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-hover text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-white mb-3">Embedded Wallets</h3>
            <p className="text-gray-300">
              No extensions needed. Sign in with email or social accounts and start trading instantly.
            </p>
          </div>
          <div className="card-hover text-center">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-xl font-semibold text-white mb-3">Gas Optimization</h3>
            <p className="text-gray-300">
              Built on Optimism with ultra-low transaction fees and fast confirmations.
            </p>
          </div>
          <div className="card-hover text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-white mb-3">Easy Swapping</h3>
            <p className="text-gray-300">
              Seamlessly swap between YL$ and OP ETH with best price execution across multiple DEXs.
            </p>
          </div>
        </div>

        {/* Second row of features */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="card-hover text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-3">Staking Rewards</h3>
            <p className="text-gray-300">
              Earn passive income by staking your YL$ tokens with competitive APY.
            </p>
          </div>
          <div className="card-hover text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-white mb-3">Trading Strategies</h3>
            <p className="text-gray-300">
              Automated DCA and grid trading strategies to maximize your returns.
            </p>
          </div>
          <div className="card-hover text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold text-white mb-3">Secure & Audited</h3>
            <p className="text-gray-300">
              Smart contracts audited and built with security-first principles.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!authenticated && (
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="card bg-gradient-to-r from-purple-600 to-blue-600">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your DeFi Journey?
            </h2>
            <p className="text-purple-100 mb-6 text-lg">
              Join thousands of users already earning with YuLiP$
            </p>
            <button 
              onClick={login}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            Built with ❤️ on Optimism • Secure • Transparent • YuLiP$
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}