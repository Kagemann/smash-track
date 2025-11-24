# 🏆 SmashTrack

A modern, powerful score tracking application for tournaments, competitions, and collaborative scoring. Built with clean architecture, comprehensive testing, and performance-first design principles.

## ✨ Features

### 🏅 Board Types
- **Leaderboard Mode**: Simple score tracking with automatic ranking and sorting
- **Multiscore Mode**: Custom columns with different data types (numbers, text, dates, booleans)

### 🎮 Session Management  
- **Tournament Sessions**: Create structured tournaments with match management
- **Round-robin**: Generate complete round-robin tournaments automatically
- **Custom Scoring**: Configurable points system for wins, losses, and draws

### 🏆 Tournament System
- **Group Stage Tournaments**: Organize players into groups with round-robin matches
- **Flexible Group Configuration**: Configure multiple groups with custom sizes
- **Random or Manual Draw**: Choose between random group assignment or manual player placement
- **Automatic Scheduling**: Generate complete round-robin schedules for all groups
- **Live Standings**: Real-time group standings with points, goal difference, and tie-breakers
- **Knockout Stage**: Automatic advancement to semifinals and finals based on group rankings
- **Bracket Visualization**: Beautiful knockout bracket view with match tracking
- **Match Management**: Start, complete, and track matches throughout the tournament

### ⚡ Real-time & Collaboration
- **Live Updates**: Real-time score updates across multiple devices
- **Share & Collaborate**: Generate shareable admin and public links  
- **Mobile Responsive**: Touch-friendly interface optimized for all devices
- **History Tracking**: Complete audit trail of all changes

### 🎯 Advanced Features
- **Keyboard Navigation**: Full keyboard support for power users
- **Accessibility**: WCAG compliant with proper ARIA labels and focus management
- **Performance**: Optimized with React memoization and efficient data structures
- **Offline Ready**: Local state management with sync capabilities

## 🏗️ Architecture

SmashTrack follows clean architecture principles with clear separation of concerns:

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # RESTful API endpoints  
│   ├── boards/            # Board-related pages
│   └── (auth)/            # Authentication routes
├── components/            # Reusable React components
│   ├── ui/                # Base UI components (shadcn/ui)
│   ├── forms/             # Form components
│   ├── boards/            # Board-specific components
│   ├── sessions/          # Session management components
│   └── tournaments/       # Tournament-specific components  
├── lib/                   # Core business logic
│   ├── services/          # API services and data fetching
│   ├── utils/             # Pure utility functions
│   │   └── tournament/    # Tournament utilities (draw, schedule, ranking, advancement)
│   ├── store/             # State management (Zustand)
│   ├── constants/         # Application constants
│   └── db/                # Database utilities and Prisma client
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui component library
- **State**: Zustand for lightweight state management
- **Forms**: React Hook Form with Zod validation

### Backend  
- **API**: Next.js API Routes with RESTful design
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas for runtime type safety
- **Real-time**: Pusher for live updates

### Development
- **Testing**: Custom lightweight testing framework
- **Linting**: ESLint with Next.js configuration
- **Type Safety**: Full TypeScript coverage
- **Documentation**: Comprehensive JSDoc comments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Pusher account (for real-time features)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/smash-track.git
cd smash-track

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize the database
npx prisma migrate dev

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database  
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint
npm run test         # Run test suite (custom framework)

# Deployment
npm run deploy       # Deploy to production (see deployment guide)
```

## 🧪 Testing

SmashTrack includes a custom lightweight testing framework optimized for utility function testing:

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:utils   # Utility function tests
npm run test:api     # API endpoint tests (coming soon)
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smashtrack"

# Pusher (for real-time updates)  
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="your-cluster"
NEXT_PUBLIC_PUSHER_KEY="your-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Customization

The application is highly customizable through:
- **Constants**: Modify `lib/constants/index.ts` for app-wide settings
- **Themes**: Extend Tailwind configuration in `tailwind.config.js`  
- **Components**: Override shadcn/ui components in `components/ui/`
- **Types**: Extend types in `types/index.ts`

## 📱 API Reference

SmashTrack provides a comprehensive REST API:

### Boards
```
GET    /api/boards              # List all boards
POST   /api/boards              # Create a board
GET    /api/boards/[id]         # Get board details
PUT    /api/boards/[id]         # Update board
DELETE /api/boards/[id]         # Delete board
```

### Participants
```
POST   /api/participants        # Add participant
PUT    /api/participants/[id]   # Update participant
DELETE /api/participants/[id]   # Remove participant
```

### Sessions & Matches
```
GET    /api/sessions            # List sessions
POST   /api/sessions            # Create session
GET    /api/matches             # List matches
POST   /api/matches             # Create match
PUT    /api/matches/[id]        # Update match (status, scores)
POST   /api/matches/[id]/complete # Complete match
```

### Tournaments
```
GET    /api/tournaments              # List tournaments (by board)
POST   /api/tournaments              # Create tournament
GET    /api/tournaments/[id]         # Get tournament details
PATCH  /api/tournaments/[id]         # Update tournament
POST   /api/tournaments/[id]/players # Add players to tournament
DELETE /api/tournaments/[id]/players/[participantId] # Remove player
POST   /api/tournaments/[id]/draw    # Draw groups (random or manual)
POST   /api/tournaments/[id]/schedule # Generate match schedule
GET    /api/tournaments/[id]/groups  # Get group standings
POST   /api/tournaments/[id]/advance # Advance to knockout stage
GET    /api/tournaments/[id]/knockout # Get knockout bracket
```

Full API documentation is available in the [API Reference](./docs/api.md).

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/smash-track)

1. Click the deploy button above
2. Configure environment variables in Vercel dashboard
3. Connect your PostgreSQL database
4. Deploy!

### Manual Deployment

See our comprehensive [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to various platforms.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code style and standards
- Development workflow  
- Testing requirements
- Documentation standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Vercel](https://vercel.com) for hosting and database services
- [Pusher](https://pusher.com) for real-time functionality

---

**Need Help?** Check out our [Quick Start Guide](./QUICK_START.md) or open an issue on GitHub.
