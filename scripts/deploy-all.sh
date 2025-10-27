#!/bin/bash

# KaYuL Complete Deployment Script
echo "🚀 Starting KaYuL deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    print_status "Dependencies check passed ✓"
}

# Deploy smart contracts
deploy_contracts() {
    print_status "Deploying smart contracts to Optimism..."
    
    cd contracts
    
    if [ ! -f .env ]; then
        print_error "Contracts .env file not found. Please copy .env.example to .env and fill in your values"
        exit 1
    fi
    
    # Compile contracts
    print_status "Compiling contracts..."
    npm run compile
    
    # Deploy contracts in order
    print_status "Deploying Swap Router..."
    npm run deploy-swap
    
    print_status "Deploying Staking Contract..."
    npm run deploy-staking
    
    print_status "Deploying Trading Strategies..."
    npm run deploy-strategies
    
    # Verify contracts
    print_status "Verifying contracts on Etherscan..."
    npm run verify
    
    cd ..
    
    print_status "Smart contracts deployed successfully! ✓"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    if [ ! -f .env ]; then
        print_warning "Backend .env file not found. Copying .env.example to .env"
        cp .env.example .env
        print_warning "Please edit backend/.env with your contract addresses and API keys"
    fi
    
    npm install
    
    print_status "Backend setup complete ✓"
    cd ..
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    if [ ! -f .env.local ]; then
        print_warning "Frontend .env.local file not found. Copying .env.example to .env.local"
        cp .env.example .env.local
        print_warning "Please edit frontend/.env.local with your contract addresses and Privy app ID"
    fi
    
    npm install
    npm run build
    
    print_status "Frontend setup complete ✓"
    cd ..
}

# Main deployment function
main() {
    print_status "Starting YLS DApp deployment process..."
    
    check_dependencies
    
    # Uncomment the line below to deploy contracts
    # deploy_contracts
    
    setup_backend
    setup_frontend
    
    print_status "🎉 Deployment setup complete!"
    print_status ""
    print_status "📋 Next steps:"
    print_status "1. Update contract addresses in backend/.env and frontend/.env.local"
    print_status "2. Set up your Privy app at https://dashboard.privy.io"
    print_status "3. Deploy backend to Railway: cd backend && npm run deploy"
    print_status "4. Deploy frontend to Vercel: cd frontend && vercel --prod"
    print_status ""
    print_status "🔗 Useful links:"
    print_status "Privy Dashboard: https://dashboard.privy.io"
    print_status "Vercel: https://vercel.com"
    print_status "Railway: https://railway.app"
    print_status "Optimism Etherscan: https://optimistic.etherscan.io"
}

# Run main function
main