# Neon PostgreSQL Setup Guide

This guide will help you set up Neon PostgreSQL for your Smash Track application.

## Quick Setup Steps

### 1. Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Verify your email address

### 2. Create Project
1. Click "Create Project"
2. Choose a project name (e.g., "smash-track")
3. Select a region close to your users (e.g., US East for most US users)
4. Choose the free tier
5. Click "Create Project"

### 3. Get Connection String
1. In your Neon dashboard, go to the "Connection Details" tab
2. Copy the connection string (it will look like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
   ```

### 4. Set Up Local Environment
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Update `.env.local` with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require"
   ```

### 5. Install Dependencies and Push Schema
```bash
# Install new dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push your database schema to Neon
npx prisma db push

# (Optional) Open Prisma Studio to verify
npx prisma studio
```

### 6. Deploy to Vercel
1. Run the deployment script:
   ```bash
   npm run deploy
   ```
2. When prompted, enter your Neon connection string for the DATABASE_URL environment variable

## Environment Variables for Vercel

In your Vercel dashboard, add these environment variables:

### Production:
- `DATABASE_URL`: Your Neon connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: `https://your-domain.vercel.app`
- `NEXT_PUBLIC_APP_URL`: `https://your-domain.vercel.app`

### Preview (optional):
- Same as production (or use a separate Neon database)

## Troubleshooting

### Connection Issues
- Make sure your connection string includes `?sslmode=require`
- Check that your Neon project is active (not paused)
- Verify the username and password are correct

### Schema Issues
- Run `npx prisma db push` to sync your schema
- Check the Prisma Studio to verify tables are created
- Make sure your `prisma/schema.prisma` is up to date

### Build Issues
- Run `npm install` to install the new dependencies
- Run `npx prisma generate` to regenerate the Prisma client
- Check that all environment variables are set correctly

## Neon Free Tier Limits
- 0.5 GB storage
- 100 hours compute time per month
- 1 database branch
- Perfect for development and small applications

## Next Steps
1. Test your local setup with `npm run dev`
2. Create a test board and verify data is saved
3. Deploy to Vercel and test the production environment
4. Set up monitoring and backups (optional)

## Support
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
