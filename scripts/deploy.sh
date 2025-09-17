#!/bin/bash

# Smash Track Deployment Script
# This script automates the deployment process to Vercel

set -e

echo "🚀 Starting Smash Track deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Database (Get this from your Neon dashboard)
DATABASE_URL=""

# Next.js
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
    echo "⚠️  Please update DATABASE_URL in .env.local with your Neon PostgreSQL connection string"
    echo "   Format: postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema (if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
    echo "🗄️  Pushing database schema to Neon..."
    npx prisma db push
else
    echo "⚠️  Skipping database schema push (no DATABASE_URL found)"
    echo "   Make sure to run 'npx prisma db push' after setting up your Neon database"
fi

# Build the application
echo "🏗️  Building application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at the URL shown above"
echo ""
echo "📋 Next steps:"
echo "1. Set up your production database"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Test all features on the live site"
echo "4. Set up a custom domain (optional)"
