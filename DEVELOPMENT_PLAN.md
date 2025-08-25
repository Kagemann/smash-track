# SmashTrack Development Plan

## 1. Project Structure ✅
```
smash-track/
├── app/
│   ├── (auth)/           # Authentication routes
│   ├── (dashboard)/      # Dashboard routes
│   ├── (board)/          # Board viewing routes
│   ├── api/
│   │   ├── boards/       # Board CRUD operations
│   │   ├── participants/ # Participant management
│   │   └── scores/       # Score updates
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn/ui components ✅
│   ├── forms/           # Form components
│   ├── boards/          # Board-specific components
│   └── dashboard/       # Dashboard components
├── lib/
│   ├── db/             # Database utilities
│   ├── validations/    # Zod schemas
│   ├── utils/          # Utility functions ✅
│   └── store/          # Zustand stores
├── types/              # TypeScript types
└── hooks/              # Custom hooks ✅
```

## 2. Brand & Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Trust, reliability
- **Secondary**: Green (#10B981) - Success, growth
- **Accent**: Orange (#F59E0B) - Energy, excitement
- **Neutral**: Gray scale for text and backgrounds
- **Success**: Green (#22C55E)
- **Warning**: Yellow (#EAB308)
- **Error**: Red (#EF4444)

### Typography
- **Heading**: Inter (Bold, SemiBold)
- **Body**: Inter (Regular, Medium)
- **Monospace**: JetBrains Mono (for scores)

### Motion & Transitions
- **Duration**: 150ms (fast), 300ms (normal), 500ms (slow)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Hover**: Scale 1.02, shadow increase
- **Focus**: Ring with primary color
- **Loading**: Skeleton animations

### Component Architecture
- **Atoms**: Button, Input, Badge, Icon
- **Molecules**: Form fields, Score display, Rank chip
- **Organisms**: Board header, Participant list, Score table
- **Templates**: Dashboard layout, Board layout
- **Pages**: Dashboard, Board viewer, Board creation

## 3. Data Model

### Database Schema (Prisma)
```prisma
model Board {
  id          String   @id @default(cuid())
  name        String
  type        BoardType
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  participants Participant[]
  columns     Column[]
  scores      Score[]
  history     History[]
}

model Participant {
  id        String   @id @default(cuid())
  name      String
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  scores    Score[]
  createdAt DateTime @default(now())
}

model Column {
  id        String   @id @default(cuid())
  name      String
  type      ColumnType
  order     Int
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  scores    Score[]
}

model Score {
  id            String     @id @default(cuid())
  value         Float
  participantId String
  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  columnId      String?
  column        Column?    @relation(fields: [columnId], references: [id], onDelete: Cascade)
  boardId       String
  board         Board      @relation(fields: [boardId], references: [id], onDelete: Cascade)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model History {
  id        String   @id @default(cuid())
  action    String
  details   Json
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

enum BoardType {
  LEADERBOARD
  MULTISCORE
}

enum ColumnType {
  NUMBER
  TEXT
  DATE
  BOOLEAN
}
```

## 4. Environment & Libraries

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Pusher (Real-time)
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""
```

### Key Libraries
- **Database**: Prisma + Vercel Postgres ✅
- **Real-time**: Pusher ✅
- **State**: Zustand ✅
- **Forms**: React Hook Form + Zod ✅
- **UI**: shadcn/ui + Tailwind ✅
- **Animations**: Framer Motion ✅
- **Icons**: Lucide React ✅
- **Tables**: TanStack Table ✅
- **Drag & Drop**: @dnd-kit ✅

## 5. Zod Schemas

### Validation Schemas
```typescript
// Board schemas
const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["LEADERBOARD", "MULTISCORE"]),
});

const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

// Participant schemas
const createParticipantSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  boardId: z.string(),
});

// Score schemas
const updateScoreSchema = z.object({
  value: z.number().min(0),
  participantId: z.string(),
  columnId: z.string().optional(),
});

// Column schemas (for multiscore)
const createColumnSchema = z.object({
  name: z.string().min(1, "Column name is required").max(50),
  type: z.enum(["NUMBER", "TEXT", "DATE", "BOOLEAN"]),
  order: z.number().int().min(0),
  boardId: z.string(),
});
```

## 6. API Route Handlers

### RESTful Endpoints
```
GET    /api/boards              # List boards
POST   /api/boards              # Create board
GET    /api/boards/[id]         # Get board details
PUT    /api/boards/[id]         # Update board
DELETE /api/boards/[id]         # Delete board

GET    /api/boards/[id]/participants  # Get participants
POST   /api/participants        # Add participant
PUT    /api/participants/[id]   # Update participant
DELETE /api/participants/[id]   # Remove participant

GET    /api/boards/[id]/scores  # Get scores
POST   /api/scores              # Add/update score
PUT    /api/scores/[id]         # Update score
DELETE /api/scores/[id]         # Delete score

GET    /api/boards/[id]/history # Get board history
```

## 7. Pages & Flows

### Page Structure
```
/                           # Landing page
/dashboard                  # Board management
/boards/[id]               # Board viewer (public)
/boards/[id]/admin         # Board admin (private)
/boards/create             # Board creation wizard
```

### User Flows
1. **Board Creation Flow**
   - Choose board type (Leaderboard/Multiscore)
   - Set board name and settings
   - Add initial participants
   - Configure columns (multiscore only)
   - Generate share links

2. **Board Management Flow**
   - View all boards
   - Edit board settings
   - Manage participants
   - View history
   - Share links

3. **Score Tracking Flow**
   - View board in real-time
   - Add/edit scores
   - See live updates
   - View rankings
   - Access history

## 8. State Management

### Zustand Stores
```typescript
// Board store
interface BoardStore {
  boards: Board[]
  currentBoard: Board | null
  loading: boolean
  error: string | null
  actions: {
    fetchBoards: () => Promise<void>
    createBoard: (data: CreateBoardData) => Promise<void>
    updateBoard: (id: string, data: UpdateBoardData) => Promise<void>
    deleteBoard: (id: string) => Promise<void>
  }
}

// Score store
interface ScoreStore {
  scores: Score[]
  participants: Participant[]
  columns: Column[]
  loading: boolean
  error: string | null
  actions: {
    fetchBoardData: (boardId: string) => Promise<void>
    updateScore: (data: UpdateScoreData) => Promise<void>
    addParticipant: (data: CreateParticipantData) => Promise<void>
    removeParticipant: (id: string) => Promise<void>
  }
}

// UI store
interface UIStore {
  sidebarOpen: boolean
  historyOpen: boolean
  shareMenuOpen: boolean
  actions: {
    toggleSidebar: () => void
    toggleHistory: () => void
    toggleShareMenu: () => void
  }
}
```

## 9. Components

### Core Components
- **BoardCard**: Board preview with actions
- **ScoreTable**: Main score display
- **ParticipantList**: Manage participants
- **ScoreInput**: Score entry component
- **RankChip**: Display ranking
- **HistoryDrawer**: Recent changes
- **ShareMenu**: Link sharing
- **BoardWizard**: Creation flow

### Form Components
- **CreateBoardForm**: Board creation
- **AddParticipantForm**: Add participants
- **EditScoreForm**: Score editing
- **ColumnConfigForm**: Column setup

## 10. Utilities

### Helper Functions
```typescript
// URL generation
export const generateBoardUrl = (id: string, type: 'public' | 'admin') => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/boards/${id}${type === 'admin' ? '/admin' : ''}`
}

// Score calculations
export const calculateRank = (scores: Score[], participantId: string) => {
  // Sort by score and find rank
}

// Real-time updates
export const subscribeToBoard = (boardId: string, callback: (data: any) => void) => {
  // Pusher subscription
}

// Debounced updates
export const debounce = (func: Function, wait: number) => {
  // Debounce implementation
}
```

## 11. Server Actions

### Database Operations
```typescript
// Board actions
export async function createBoard(data: CreateBoardData) {
  // Validate with Zod
  // Create in database
  // Return board with links
}

export async function updateBoard(id: string, data: UpdateBoardData) {
  // Validate and update
}

// Score actions
export async function updateScore(data: UpdateScoreData) {
  // Update score
  // Broadcast to Pusher
  // Add to history
}

// Participant actions
export async function addParticipant(data: CreateParticipantData) {
  // Add participant
  // Initialize scores
}
```

## 12. Sharing & URLs

### URL Structure
- **Public Board**: `/boards/[id]` - Read-only view
- **Admin Board**: `/boards/[id]/admin` - Full control
- **Create Board**: `/boards/create` - Creation wizard

### Share Features
- **Copy Links**: Admin and public URLs
- **QR Codes**: Mobile sharing
- **Embed**: Widget for websites
- **Export**: CSV/PDF export

## 13. Validation & Guards

### Access Control
```typescript
// Board access validation
export const validateBoardAccess = async (boardId: string, type: 'public' | 'admin') => {
  // Check if board exists
  // Validate access type
  // Return board data
}

// Admin-only actions
export const requireAdminAccess = async (boardId: string) => {
  // Verify admin access
  // Throw error if not authorized
}
```

### Input Validation
- **Client-side**: Zod schemas with React Hook Form
- **Server-side**: Zod validation in API routes
- **Real-time**: Validate before broadcasting

## 14. History

### History Tracking
```typescript
interface HistoryEntry {
  id: string
  action: 'score_update' | 'participant_added' | 'participant_removed' | 'board_updated'
  details: {
    participantName?: string
    oldValue?: number
    newValue?: number
    columnName?: string
  }
  timestamp: Date
}
```

### History Features
- **Real-time updates**: Live history feed
- **Filtering**: By action type, participant
- **Timeline**: Chronological view
- **Undo**: Revert recent changes

## 15. Styling

### Design System Implementation
- **CSS Variables**: For theming
- **Tailwind Classes**: Utility-first approach
- **Component Variants**: Using class-variance-authority
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System preference support

### Key Styling Patterns
```css
/* Custom properties for theming */
:root {
  --primary: 59 130 246;
  --secondary: 16 185 129;
  --accent: 245 158 11;
  --background: 255 255 255;
  --foreground: 15 23 42;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --background: 15 23 42;
    --foreground: 248 250 252;
  }
}
```

## 16. Tests

### Testing Strategy
- **Unit Tests**: Component logic, utilities
- **Integration Tests**: API routes, database operations
- **E2E Tests**: User flows, real-time features
- **Visual Tests**: Component rendering

### Test Setup
```typescript
// Jest + React Testing Library
// Playwright for E2E
// MSW for API mocking
// Prisma test database
```

## 17. Seed Script

### Development Data
```typescript
// Sample boards for development
const sampleBoards = [
  {
    name: "Smash Bros Tournament",
    type: "LEADERBOARD",
    participants: ["Mario", "Link", "Pikachu", "Samus"]
  },
  {
    name: "Fitness Challenge",
    type: "MULTISCORE",
    participants: ["John", "Sarah", "Mike"],
    columns: [
      { name: "Push-ups", type: "NUMBER" },
      { name: "Pull-ups", type: "NUMBER" },
      { name: "Run Time", type: "NUMBER" }
    ]
  }
]
```

## 18. Deployment

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Environment Setup
- **Database**: Vercel Postgres
- **Real-time**: Pusher
- **Domain**: Custom domain setup
- **Analytics**: Vercel Analytics

## 19. Acceptance Criteria

### Core Features ✅
- [ ] Create both board types via wizard
- [ ] Generate admin & public links
- [ ] Add/edit/remove participants with bulk delete
- [ ] Leaderboard auto-sorts with rank chips
- [ ] +/- buttons work with keyboard support
- [ ] Multiscore: add/edit/remove/reorder columns
- [ ] Type validations enforced
- [ ] Increment buttons work
- [ ] Inline score edits auto-save with debounce
- [ ] Real-time broadcasting to second client
- [ ] Share menu copies correct links
- [ ] History drawer shows recent changes
- [ ] Mobile layout touch-friendly
- [ ] Desktop hover states
- [ ] Tab navigation works across controls

## 20. Development Phases

### Phase 1: Foundation (Week 1)
- [x] Project setup and structure
- [x] shadcn/ui integration
- [ ] Database schema and Prisma setup
- [ ] Basic API routes
- [ ] Core components

### Phase 2: Core Features (Week 2)
- [ ] Board creation wizard
- [ ] Basic score tracking
- [ ] Participant management
- [ ] Real-time updates

### Phase 3: Advanced Features (Week 3)
- [ ] Multiscore boards
- [ ] History tracking
- [ ] Share functionality
- [ ] Mobile optimization

### Phase 4: Polish & Deploy (Week 4)
- [ ] Testing
- [ ] Performance optimization
- [ ] Deployment setup
- [ ] Documentation

## Next Steps

1. **Set up database schema** with Prisma
2. **Create core components** (BoardCard, ScoreTable)
3. **Implement board creation wizard**
4. **Add real-time functionality** with Pusher
5. **Build responsive UI** with mobile-first approach

Ready to start with Phase 1 implementation?
