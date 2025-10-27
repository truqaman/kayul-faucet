import { PrivyProvider } from '@privy-io/react-auth'
import { useRouter } from 'next/router'
import '../styles/globals.css'

// 🔧 DEPLOYMENT NOTE: Ensure your Privy app ID is correctly set in environment variables
// 🔧 DEPLOYMENT NOTE: Configure allowed domains in Privy dashboard for production
export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      onSuccess={(user, isNewUser) => {
        console.log('User logged in:', user)
        // Track analytics for new users
        if (isNewUser && typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'user_signup')
        }
        
        if (isNewUser) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      }}
      onError={(error) => {
        console.error('Privy error:', error)
        // 🔧 DEPLOYMENT NOTE: Implement proper error tracking in production
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'exception', {
            description: error.message,
            fatal: false
          })
        }
      }}
      config={{
        // Login methods - customize based on your target audience
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord'],
        
        // Embedded wallet configuration
        embeddedWallets: {
          createOnLogin: 'all-users',
          requireUserPasswordOnCreate: false,
          noPromptOnSignature: true, // Better UX for frequent transactions
        },
        
        // Appearance - match your brand
        appearance: {
          theme: 'dark',
          accentColor: '#8B5CF6',
          logo: 'https://your-app.com/logo.png', // 🔧 DEPLOYMENT NOTE: Update with your logo
          showWalletLoginFirst: false,
        },
        
        // Optimism configuration
        defaultChain: {
          id: 10, // Optimism Mainnet
          name: 'Optimism'
        },
        
        // Supported chains
        supportedChains: [{
          id: 10,
          name: 'Optimism'
        }],
        
        // 🔧 DEPLOYMENT NOTE: Configure mfa for production security
        mfa: {
          noPromptOnRegister: false,
          factorAmounts: { secondary: 1, recovery: 1 },
        },
      }}
    >
      <Component {...pageProps} />
    </PrivyProvider>
  )
}