# Smash Track - Vercel Deployment Guide

## Overview
This guide will help you deploy Smash Track to Vercel with a production-ready Neon PostgreSQL database.

## Prerequisites
- Vercel account (free tier available)
- Neon account (free tier available)
- GitHub/GitLab repository with your code
- Node.js 18+ installed locally

## Step 1: Database Setup

### Option A: Neon PostgreSQL (Recommended)

1. **Create Neon Account**:
   - Go to [neon.tech](https://neon.tech)
   - Sign up for a free account
   - Verify your email

2. **Create a New Project**:
   - Click "Create Project"
   - Choose a project name (e.g., "smash-track")
   - Select a region close to your users
   - Choose the free tier

3. **Get Connection String**:
   - In your Neon dashboard, go to "Connection Details"
   - Copy the connection string (it will look like):
     ```
     postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
     ```

4. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

5. **Login to Vercel**:
   ```bash
   vercel login
   ```

### Option B: Vercel Postgres (Alternative)

1. **Create PlanetScale Account**:
   - Go to [planetscale.com](https://planetscale.com)
   - Create a free account

2. **Create Database**:
   - Create a new database
   - Get the connection string

3. **Update Schema**:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

## Step 2: Environment Configuration

Create `.env.local` for local development:
```env
# Database (from your Neon dashboard)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 3: Database Migration

1. **Push Schema to Production**:
   ```bash
   npx prisma db push
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Verify Connection**:
   ```bash
   npx prisma studio
   ```

## Step 4: Deploy to Vercel

### Method A: Vercel CLI

1. **Deploy**:
   ```bash
   vercel
   ```

2. **Follow Prompts**:
   - Link to existing project or create new
   - Set root directory: `./`
   - Override settings: No
   - Deploy

### Method B: Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 5: Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

### Production Variables:
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

### Preview Variables (for PR deployments):
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require"
NEXTAUTH_SECRET="your-preview-secret"
NEXTAUTH_URL="https://your-preview-domain.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-preview-domain.vercel.app"
```

**Note**: You can use the same Neon database for both production and preview environments, or create separate databases for each.

## Step 6: Custom Domain (Optional)

1. **Add Domain**:
   - Vercel Dashboard → Domains
   - Add your custom domain

2. **Configure DNS**:
   - Add CNAME record pointing to your Vercel deployment
   - Wait for DNS propagation (up to 48 hours)

## Step 7: Post-Deployment Verification

1. **Check Database Connection**:
   - Visit your deployed app
   - Try creating a board
   - Verify data is saved

2. **Test All Features**:
   - Board creation
   - Participant management
   - Session creation
   - Match completion
   - Score tracking

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**:
   ```bash
   # Check environment variables
   vercel env ls
   
   # Pull latest env vars
   vercel env pull .env.local
   ```

2. **Build Errors**:
   ```bash
   # Test build locally
   npm run build
   
   # Check for TypeScript errors
   npx tsc --noEmit
   ```

3. **Prisma Issues**:
   ```bash
   # Reset Prisma
   npx prisma generate
   npx prisma db push
   ```

### Performance Optimization:

1. **Enable Edge Functions** (if needed):
   ```typescript
   export const runtime = 'edge'
   ```

2. **Add Caching Headers**:
   ```typescript
   export async function generateMetadata() {
     return {
       other: {
         'Cache-Control': 'public, max-age=3600, must-revalidate',
       },
     }
   }
   ```

## Monitoring & Analytics

1. **Vercel Analytics** (Optional):
   ```bash
   npm install @vercel/analytics
   ```

2. **Error Tracking**:
   - Vercel provides built-in error tracking
   - Consider adding Sentry for detailed error reporting

## Security Considerations

1. **Environment Variables**:
   - Never commit `.env` files
   - Use Vercel's environment variable system
   - Rotate secrets regularly

2. **Database Security**:
   - Use connection pooling
   - Enable SSL connections
   - Regular backups

3. **API Security**:
   - Validate all inputs
   - Rate limiting (consider using Vercel's edge functions)
   - CORS configuration

## Scaling Considerations

1. **Database Scaling**:
   - Vercel Postgres: Upgrade to Pro plan for more connections
   - PlanetScale: Automatic scaling with usage

2. **Application Scaling**:
   - Vercel automatically scales based on traffic
   - Consider edge functions for global performance

## Cost Estimation

### Free Tier (Hobby):
- **Vercel**: Free (100GB bandwidth, 100GB storage)
- **Vercel Postgres**: Free (256MB storage, 1 connection)
- **PlanetScale**: Free (1GB storage, 1 billion reads/month)

### Pro Tier (if needed):
- **Vercel**: $20/month
- **Vercel Postgres**: $20/month (1GB storage, 10 connections)
- **PlanetScale**: $29/month (10GB storage, unlimited reads)

## Next Steps

1. **Set up monitoring** and error tracking
2. **Configure backups** for your database
3. **Set up CI/CD** for automated deployments
4. **Add analytics** to track usage
5. **Plan for scaling** as your user base grows

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Prisma Documentation**: [prisma.io/docs](https://prisma.io/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
