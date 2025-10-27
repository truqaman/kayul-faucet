import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// 🔧 DEPLOYMENT NOTE: This component handles embedded wallet interactions
// Make sure to handle errors gracefully and provide user feedback
export default function EmbeddedWalletDashboard({ embeddedWallet }) {
  const [balance, setBalance] = useState('0')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (embeddedWallet) {
      loadWalletData()
    }
  }, [embeddedWallet])

  const loadWalletData = async () => {
    if (!embeddedWallet) return
    
    setLoading(true)
    setError('')
    try {
      const walletAddress = await embeddedWallet.getAddress()
      setAddress(walletAddress)

      const provider = await embeddedWallet.getEthersProvider()
      const balanceWei = await provider.getBalance(walletAddress)
      setBalance(ethers.utils.formatEther(balanceWei))

      // 🔧 DEPLOYMENT NOTE: In production, you might want to fetch transaction history
      // from a blockchain explorer API or your backend
      await loadTransactionHistory(walletAddress)
    } catch (error) {
      console.error('Error loading wallet data:', error)
      setError('Failed to load wallet data. Please try again.')
      
      // 🔧 DEPLOYMENT NOTE: Track errors for monitoring
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: 'wallet_data_load_failed',
          fatal: false
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadTransactionHistory = async (walletAddress) => {
    try {
      // 🔧 DEPLOYMENT NOTE: Implement actual transaction history fetching
      // This is a mock implementation
      setTransactions([])
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const signMessage = async () => {
    if (!embeddedWallet) return
    
    setLoading(true)
    setError('')
    try {
      const message = `YuLiP$ DApp Authentication: ${Date.now()}`
      const signature = await embeddedWallet.sign(message)
      
      // 🔧 DEPLOYMENT NOTE: You might want to verify the signature on your backend
      console.log('Signature:', signature)
      
      alert(`✅ Message signed successfully!\n\nSignature: ${signature.slice(0, 20)}...`)
      
      // Track successful signing
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'message_signed')
      }
    } catch (error) {
      console.error('Signing failed:', error)
      setError('Signing failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendTestTransaction = async () => {
    if (!embeddedWallet) return
    
    setLoading(true)
    setError('')
    try {
      const provider = await embeddedWallet.getEthersProvider()
      const signer = provider.getSigner()
      
      const tx = await signer.sendTransaction({
        to: address, // Send to self for testing
        value: ethers.utils.parseEther('0.001'),
        gasLimit: 21000,
      })
      
      alert(`✅ Transaction sent!\n\nHash: ${tx.hash}`)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)
      
      // Reload balance after transaction
      await loadWalletData()
      
      // Track transaction success
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'test_transaction_sent')
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      setError('Transaction failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const exportPrivateKey = async () => {
    if (!embeddedWallet) return
    
    if (!confirm('⚠️ Security Warning\n\nExporting your private key can be dangerous. Anyone with this key can access your funds. Only proceed if you know what you are doing.')) {
      return
    }
    
    setLoading(true)
    setError('')
    try {
      // Note: Only do this in secure environments
      const privateKey = await embeddedWallet.export()
      
      alert(`🔐 Private Key\n\n${privateKey}\n\n⚠️ Keep this safe and NEVER share it!`)
      
      // Track export event (without the actual key)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'private_key_exported')
      }
    } catch (error) {
      console.error('Export failed:', error)
      setError('Export failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      alert('Address copied to clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  if (loading && !balance) {
    return (
      <div className="card text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-400">Loading wallet data...</p>
      </div>
    )
  }

  if (!embeddedWallet) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Wallet Found</h3>
        <p className="text-gray-400">Please ensure you're properly authenticated.</p>
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

      {/* Wallet Overview */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Your Embedded Wallet</h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Address */}
            <div>
              <label className="text-gray-400 text-sm block mb-2">Wallet Address</label>
              <div className="flex items-center space-x-2">
                <p className="font-mono text-sm bg-gray-900 p-3 rounded-lg flex-1 break-all">
                  {address}
                </p>
                <button
                  onClick={copyAddress}
                  className="btn-secondary px-3 py-2 text-sm"
                  title="Copy address"
                >
                  📋
                </button>
              </div>
            </div>
            
            {/* Balance */}
            <div>
              <label className="text-gray-400 text-sm block mb-2">Balance</label>
              <p className="text-3xl font-bold">
                {parseFloat(balance).toFixed(4)} <span className="text-purple-400">ETH</span>
              </p>
              <p className="text-gray-400 text-sm mt-1">Optimism Mainnet</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={signMessage}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span>✍️</span>
              <span>Sign Test Message</span>
            </button>
            
            <button
              onClick={sendTestTransaction}
              disabled={loading || parseFloat(balance) < 0.001}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
              title={parseFloat(balance) < 0.001 ? 'Insufficient balance for test transaction' : ''}
            >
              <span>🔄</span>
              <span>Send Test Transaction</span>
            </button>
            
            <button
              onClick={exportPrivateKey}
              disabled={loading}
              className="w-full border border-red-600 text-red-400 hover:bg-red-900 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔑</span>
              <span>Export Private Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl mb-2">💰</div>
          <h3 className="font-semibold mb-1">Staking</h3>
          <p className="text-gray-400 text-sm">Earn rewards with YL$</p>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl mb-2">🔄</div>
          <h3 className="font-semibold mb-1">Swap</h3>
          <p className="text-gray-400 text-sm">Exchange tokens instantly</p>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl mb-2">📈</div>
          <h3 className="font-semibold mb-1">Strategies</h3>
          <p className="text-gray-400 text-sm">Auto-invest with DCA</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {/* Transaction list would go here */}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-400">No recent transactions</p>
            <p className="text-gray-500 text-sm mt-1">Your transaction history will appear here</p>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="card bg-yellow-900/20 border-yellow-700">
        <h3 className="text-lg font-semibold mb-3 text-yellow-200">🔒 Security Tips</h3>
        <ul className="space-y-2 text-yellow-100 text-sm">
          <li>• Never share your private key with anyone</li>
          <li>• Use strong passwords and enable 2FA where available</li>
          <li>• Be cautious of phishing websites</li>
          <li>• Keep your recovery phrase secure and offline</li>
        </ul>
      </div>
    </div>
  )
}