# SmashTrack

A modern score tracking app with leaderboards and multiscore boards. Built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Leaderboard Mode**: Track scores with automatic ranking and sorting
- **Multiscore Mode**: Custom columns with different data types
- **Real-time Updates**: Live score updates across multiple clients
- **Share & Collaborate**: Generate admin and public links
- **Mobile Responsive**: Touch-friendly interface
- **History Tracking**: View recent changes and modifications

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Prisma ORM with Vercel Postgres
- **Real-time**: Pusher for live updates
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion

## Development

```bash
npm run dev
npm run build
npm run lint
```

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/smash-track)

## Deployment

- **Platform**: Vercel
- **Database**: Vercel Postgres
- **Real-time**: Pusher

### One-Click Deploy

1. Click the "Deploy with Vercel" button above
2. Configure environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate a random string
   - `NEXTAUTH_URL`: Your Vercel domain
3. Deploy!

### Manual Setup

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
