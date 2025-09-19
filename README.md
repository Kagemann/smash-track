# SmashTrack

A modern score tracking application with clean architecture, comprehensive testing, and production-ready features. Built with Next.js, TypeScript, and following industry best practices.

## ✨ Features

### Core Functionality
- **Leaderboard Mode**: Automatic ranking and sorting of participants
- **Multiscore Mode**: Flexible custom columns with different data types
- **Session Management**: Organize matches and tournaments
- **Real-time Updates**: Live score updates across multiple clients
- **History Tracking**: Complete audit trail of all changes

### User Experience
- **Mobile Responsive**: Touch-friendly interface optimized for all devices
- **Share & Collaborate**: Generate public and admin links for boards
- **Intuitive UI**: Clean, modern interface with shadcn/ui components
- **Accessibility**: WCAG compliant design patterns

### Developer Experience
- **Clean Architecture**: Well-organized, maintainable codebase
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Performance Optimized**: Efficient database queries and caching strategies
- **Error Handling**: Robust error boundaries and API error management

## 🏗️ Architecture

### Project Structure
```
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes with proper error handling
│   ├── boards/            # Board-related pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── boards/           # Board-specific components
│   ├── sessions/         # Session management components
│   └── matches/          # Match-related components
├── lib/                   # Core business logic
│   ├── api/              # API utilities and middleware
│   ├── database/         # Database client and configuration
│   ├── services/         # Business logic layer
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── constants/        # Application constants
│   └── store/            # State management (Zustand)
├── prisma/               # Database schema and migrations
└── __tests__/            # Test files
```

### Technology Stack

#### Core Framework
- **Next.js 15**: Full-stack React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript 5**: Full type safety throughout the application

#### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible component library
- **Lucide React**: Beautiful, customizable icons
- **CSS Modules**: Component-scoped styling where needed

#### Database & Backend
- **Prisma ORM**: Type-safe database access with migrations
- **PostgreSQL**: Robust relational database (Vercel Postgres)
- **Zod**: Runtime schema validation for API endpoints
- **Zustand**: Lightweight state management solution

#### Development & Quality
- **Jest**: Comprehensive testing framework
- **ESLint**: Code linting and quality enforcement
- **TypeScript**: Static type checking
- **Prisma Studio**: Database inspection and management

## 🛠️ Development

### Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL database or Vercel Postgres
- npm or yarn package manager

### Getting Started

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd smash-track
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database URL and other settings
   ```

3. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Database
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio

# Deployment
npm run deploy       # Deploy to production (Linux/macOS)
npm run deploy:windows # Deploy to production (Windows)
```

### Code Quality Standards

- **TypeScript**: All code is written in TypeScript with strict mode enabled
- **Testing**: Minimum 80% test coverage for critical paths
- **Linting**: ESLint with Next.js and TypeScript rules
- **Formatting**: Consistent code formatting enforced
- **Error Handling**: Comprehensive error boundaries and API error handling

## 🧪 Testing

The application includes comprehensive testing with Jest:

```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
```

### Test Coverage
- **Utility Functions**: 100% coverage of math, format, and validation utilities
- **API Routes**: Error handling and response formatting
- **Services**: Business logic and data transformation
- **Components**: Critical user interactions and edge cases

## 🚀 Deployment

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Optional: Real-time features
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"
```

### Vercel Deployment (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/smash-track)

1. Click the deploy button above
2. Configure environment variables in Vercel dashboard
3. Connect your PostgreSQL database (Vercel Postgres recommended)
4. Deploy automatically on every push to main branch

### Manual Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed manual deployment instructions.

## 📖 API Documentation

The application provides RESTful APIs with consistent error handling and validation:

### Base URL
```
https://your-domain.com/api
```

### Endpoints
- `GET /api/boards` - List all boards
- `POST /api/boards` - Create a new board
- `GET /api/boards/{id}` - Get board details
- `PUT /api/boards/{id}` - Update board
- `DELETE /api/boards/{id}` - Delete board

All endpoints return responses in the format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper tests
4. Ensure tests pass: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a pull request

### Development Guidelines

- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure TypeScript types are properly defined
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Check the [documentation](./docs/)
- Review the [deployment guide](./DEPLOYMENT_GUIDE.md)
