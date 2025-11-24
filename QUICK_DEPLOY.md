# 🚀 Quick Deployment Guide

## If Vercel is Connected to Your Git Repository

### Step 1: Commit and Push Your Changes

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "feat: Add tournament system v1.0.0"

# Push to main/master branch (this triggers automatic deployment)
git push origin main
# or
git push origin master
```

### Step 2: Vercel Will Automatically:
- ✅ Detect the push
- ✅ Run `npm install`
- ✅ Run `npm run build` (which includes `prisma generate`)
- ✅ Deploy to production

### Step 3: Important - Database Migration

**⚠️ CRITICAL**: Before the new code works, you need to update your production database schema:

```bash
# Option 1: Using Prisma (recommended)
# Set your production DATABASE_URL and run:
DATABASE_URL="your-production-database-url" npx prisma db push

# Option 2: Using Vercel CLI
vercel env pull .env.local
# Then run:
npx prisma db push
```

**Or** if you have database access through Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Copy your `DATABASE_URL`
3. Run the migration locally with that URL

### Step 4: Verify Deployment

1. **Check Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click on your project
   - Check the "Deployments" tab
   - Wait for build to complete (usually 2-5 minutes)

2. **Test Your App**:
   - Visit your production URL
   - Test tournament creation
   - Verify database connection

## If Vercel is NOT Connected

### Option A: Connect Git Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables (if not already set)
6. Deploy

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

## Pre-Deployment Checklist

- [x] ✅ Build succeeds locally (`npm run build`)
- [x] ✅ All TypeScript errors fixed
- [x] ✅ All tests passing (`npm test`)
- [ ] ⚠️ **Database migration run on production** (`npx prisma db push`)
- [ ] Environment variables set in Vercel dashboard
- [ ] Git repository connected to Vercel (or use CLI)

## Post-Deployment Checklist

- [ ] Visit production URL
- [ ] Test tournament creation
- [ ] Test group drawing (random and manual)
- [ ] Test match completion
- [ ] Verify database is saving data correctly
- [ ] Check Vercel logs for any errors

## Troubleshooting

### Build Fails in Vercel
- Check Vercel build logs
- Ensure `DATABASE_URL` is set (even if build doesn't use it)
- Verify `package.json` scripts are correct

### Database Errors After Deployment
- Run `npx prisma db push` on production database
- Verify `DATABASE_URL` environment variable is correct
- Check database connection limits

### Features Not Working
- Clear browser cache
- Check browser console for errors
- Verify environment variables are set correctly
- Check Vercel function logs

---

**Quick Command Summary:**
```bash
# 1. Commit and push
git add .
git commit -m "feat: Tournament system v1.0.0"
git push origin main

# 2. Run database migration (on production DB)
DATABASE_URL="your-prod-url" npx prisma db push

# 3. Check deployment status
# Visit Vercel dashboard or run:
vercel ls
```

