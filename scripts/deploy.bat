@echo off
REM Smash Track Deployment Script for Windows
REM This script automates the deployment process to Vercel

echo 🚀 Starting Smash Track deployment...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please log in to Vercel...
    vercel login
)

REM Check if .env.local exists
if not exist .env.local (
    echo 📝 Creating .env.local file...
    (
        echo # Database
        echo DATABASE_URL=""
        echo.
        echo # Next.js
        echo NEXTAUTH_SECRET=""
        echo NEXTAUTH_URL="http://localhost:3000"
    ) > .env.local
    echo ⚠️  Please update DATABASE_URL and NEXTAUTH_SECRET in .env.local
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Build the application
echo 🏗️  Building application...
npm run build

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 🌐 Your app should be live at the URL shown above
echo.
echo 📋 Next steps:
echo 1. Set up your production database
echo 2. Configure environment variables in Vercel dashboard
echo 3. Test all features on the live site
echo 4. Set up a custom domain (optional)

pause
