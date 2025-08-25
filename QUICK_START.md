# 🚀 Quick Start - Deploy Smash Track to Vercel

## Prerequisites
- [Vercel account](https://vercel.com/signup) (free)
- [GitHub/GitLab account](https://github.com) (free)
- Your Smash Track code in a Git repository

## Option 1: One-Click Deploy (Easiest)

1. **Click the Deploy Button**:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/smash-track)

2. **Configure Project**:
   - Project Name: `smash-track`
   - Framework Preset: `Next.js`
   - Root Directory: `./`

3. **Set Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate a random string
   - `NEXTAUTH_URL`: Your Vercel domain

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

## Option 2: Manual Deploy

### Step 1: Database Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Create PostgreSQL database
vercel storage create postgres

# Pull environment variables
vercel env pull .env.local
```

### Step 2: Deploy
```bash
# Run deployment script
npm run deploy

# Or manually:
vercel --prod
```

## Option 3: GitHub Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

## Database Options

### Vercel Postgres (Recommended)
- **Free tier**: 256MB storage, 1 connection
- **Pro tier**: 1GB storage, 10 connections ($20/month)
- **Setup**: `vercel storage create postgres`

### PlanetScale (Alternative)
- **Free tier**: 1GB storage, 1 billion reads/month
- **Pro tier**: 10GB storage, unlimited reads ($29/month)
- **Setup**: [planetscale.com](https://planetscale.com)

### Supabase (Alternative)
- **Free tier**: 500MB storage, 50MB bandwidth
- **Pro tier**: 8GB storage, 250GB bandwidth ($25/month)
- **Setup**: [supabase.com](https://supabase.com)

## Environment Variables

### Required:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-app.vercel.app"
```

### Optional:
```env
# For custom domains
NEXTAUTH_URL="https://yourdomain.com"

# For analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

## Post-Deployment Checklist

- [ ] Database connection working
- [ ] Can create boards
- [ ] Can add participants
- [ ] Can create sessions
- [ ] Can complete matches
- [ ] Score tracking working
- [ ] Public view accessible
- [ ] Admin view working

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   ```bash
   # Test locally
   npm run build
   
   # Check for errors
   npm run lint
   ```

2. **Database Connection**:
   ```bash
   # Verify connection
   npx prisma db push
   npx prisma studio
   ```

3. **Environment Variables**:
   ```bash
   # Check Vercel env vars
   vercel env ls
   
   # Pull latest
   vercel env pull .env.local
   ```

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## Cost Breakdown

### Free Tier (Hobby):
- **Vercel**: $0/month
- **Vercel Postgres**: $0/month (256MB)
- **Total**: $0/month

### Pro Tier (Growth):
- **Vercel**: $20/month
- **Vercel Postgres**: $20/month (1GB)
- **Total**: $40/month

---

**Need help?** Check the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
