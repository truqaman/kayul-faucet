require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

// 🔧 DEPLOYMENT NOTE: Fill in your actual values in .env file
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.OPTIMISTIC_ETHERSCAN_API_KEY

if (!OPTIMISM_RPC_URL || !DEPLOYER_PRIVATE_KEY) {
  console.warn('⚠️  Please set OPTIMISM_RPC_URL and DEPLOYER_PRIVATE_KEY in .env file')
}

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // 🔧 DEPLOYMENT NOTE: Optimism Mainnet configuration
    optimism: {
      url: OPTIMISM_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 1000000, // 0.001 gwei
    },
    // Local development network
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: {
      optimisticEthereum: ETHERSCAN_API_KEY || ''
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  }
}