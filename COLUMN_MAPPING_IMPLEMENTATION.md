# Column Mapping and Session Scoring Implementation

## Overview

We have successfully implemented a comprehensive column mapping system that connects session results to specific leaderboard columns (Wins, Losses, Points) and allows for configurable scoring rules per session.

## 🎯 **Key Features Implemented**

### **1. Session Scoring Configuration**
- **Configurable Points**: Each session can have custom win/loss/draw point values
- **Default Values**: Win: 3pts, Loss: 0pts, Draw: 1pt
- **Session-Specific Rules**: Different sessions can have different scoring systems

### **2. Automatic Column Creation**
- **Default Columns**: Wins, Losses, Points columns are automatically created for leaderboards
- **Column Mapping**: Match results are automatically mapped to the correct columns
- **Smart Creation**: Only creates missing columns, preserves existing ones

### **3. Enhanced Match Completion**
- **Column-Specific Scoring**: Wins, losses, and points are tracked separately
- **Automatic Updates**: Leaderboard updates automatically when matches are completed
- **Session-Aware Scoring**: Uses session-specific point values

## 🔧 **Technical Implementation**

### **Database Schema Changes**

#### **Session Model Updates**
```prisma
model Session {
  id          String   @id @default(cuid())
  name        String
  description String?
  boardId     String
  board       Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  status      SessionStatus @default(ACTIVE)
  // NEW: Scoring configuration
  winPoints   Int      @default(3)  // Points for winning a match
  lossPoints  Int      @default(0)  // Points for losing a match
  drawPoints  Int      @default(1)  // Points for drawing a match
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  matches     Match[]
}
```

### **Type System Updates**

#### **Session Interface**
```typescript
export interface Session {
  id: string
  name: string
  description?: string
  boardId: string
  board: Board
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  // NEW: Scoring configuration
  winPoints: number
  lossPoints: number
  drawPoints: number
  createdAt: Date
  updatedAt: Date
  matches: Match[]
}
```

#### **Form Data Interfaces**
```typescript
export interface CreateSessionData {
  name: string
  description?: string
  boardId: string
  // NEW: Optional scoring configuration
  winPoints?: number
  lossPoints?: number
  drawPoints?: number
}
```

### **Validation Schemas**
```typescript
export const createSessionSchema = z.object({
  name: z.string().min(1, "Session name is required").max(100),
  description: z.string().max(500).optional(),
  boardId: z.string().min(1, "Board ID is required"),
  // NEW: Scoring configuration with defaults
  winPoints: z.number().min(0).default(3),
  lossPoints: z.number().min(0).default(0),
  drawPoints: z.number().min(0).default(1),
})
```

## 🛠 **Core Functions**

### **1. Column Management Utilities**

#### **ensureDefaultColumns()**
```typescript
export async function ensureDefaultColumns(boardId: string) {
  // Ensures Wins, Losses, Points columns exist
  // Creates missing columns automatically
  // Returns updated board with all columns
}
```

#### **getColumnId()**
```typescript
export async function getColumnId(boardId: string, columnName: string) {
  // Gets the column ID for a specific column name
  // Used for mapping scores to correct columns
}
```

### **2. Enhanced Match Scoring**

#### **calculateMatchPoints()**
```typescript
const calculateMatchPoints = (player1Score: number, player2Score: number, session: any) => {
  // Uses session-specific scoring configuration
  // Returns detailed win/loss/point breakdown
  // Supports draws with custom point values
}
```

### **3. Column-Mapped Score Creation**

#### **Match Completion Logic**
```typescript
// Get column IDs for mapping scores
const winsColumnId = await getColumnId(match.session.board.id, 'Wins')
const lossesColumnId = await getColumnId(match.session.board.id, 'Losses')
const pointsColumnId = await getColumnId(match.session.board.id, 'Points')

// Create scores mapped to specific columns
const scoreData = []
// Player 1 scores
if (player1Wins > 0) {
  scoreData.push({
    value: player1Wins,
    participantId: match.player1Id,
    boardId: match.session.board.id,
    columnId: winsColumnId,
  })
}
// ... similar for losses and points
```

## 🎨 **UI Enhancements**

### **1. Session Creation Form**
- **Scoring Configuration Section**: Win/Loss/Draw point inputs
- **Default Values**: Pre-filled with standard values (3/0/1)
- **Validation**: Ensures non-negative values

### **2. Session Card Display**
- **Scoring Info**: Shows win/loss/draw point values
- **Visual Indicators**: Clear display of session configuration

### **3. Leaderboard Integration**
- **Column-Based Display**: Scores are properly categorized
- **Automatic Updates**: Real-time leaderboard updates
- **Session Results Section**: Dedicated area for match results

## 🔄 **Data Flow**

### **1. Session Creation**
```
User creates session → Form validates data → API creates session → 
ensureDefaultColumns() runs → Default columns created → Session saved
```

### **2. Match Completion**
```
User completes match → API calculates points using session config → 
getColumnId() gets column IDs → Scores created with column mapping → 
Leaderboard updates automatically
```

### **3. Leaderboard Display**
```
Page loads → fetchScores() called → Scores grouped by column → 
Leaderboard displays categorized results → Real-time updates
```

## 📊 **Scoring Examples**

### **Standard Tournament (3/0/1)**
- **Win**: 3 points + 1 win
- **Loss**: 0 points + 1 loss
- **Draw**: 1 point each

### **Custom Scoring (5/1/2)**
- **Win**: 5 points + 1 win
- **Loss**: 1 point + 1 loss
- **Draw**: 2 points each

### **Zero-Sum Scoring (2/-1/0)**
- **Win**: 2 points + 1 win
- **Loss**: -1 point + 1 loss
- **Draw**: 0 points each

## ✅ **Benefits Achieved**

### **1. Proper Data Organization**
- **Column Mapping**: Scores are properly categorized
- **Clear Structure**: Wins, losses, and points tracked separately
- **Flexible System**: Supports any scoring configuration

### **2. Enhanced User Experience**
- **Configurable Scoring**: Users can set custom point values
- **Visual Feedback**: Clear display of scoring rules
- **Automatic Updates**: Real-time leaderboard updates

### **3. Scalable Architecture**
- **Session-Specific Rules**: Different scoring per session
- **Automatic Column Management**: No manual column setup required
- **Extensible Design**: Easy to add new column types

## 🚀 **Next Steps**

### **Potential Enhancements**
1. **Advanced Scoring Rules**: Support for bonus points, penalties
2. **Column Templates**: Pre-defined column sets for different game types
3. **Scoring History**: Track changes to scoring rules over time
4. **Bulk Operations**: Create multiple sessions with similar rules
5. **Export Features**: Export session results with column breakdown

### **Integration Opportunities**
1. **Tournament Brackets**: Support for elimination tournaments
2. **Season Management**: Group sessions into seasons
3. **Player Statistics**: Advanced player performance metrics
4. **Achievement System**: Badges and milestones based on column values

## 🎉 **Implementation Complete**

The column mapping and session scoring system is now fully functional! Users can:

✅ **Create sessions with custom scoring rules**  
✅ **Complete matches that automatically update the leaderboard**  
✅ **View results properly categorized by columns**  
✅ **Track wins, losses, and points separately**  
✅ **Enjoy real-time updates across all clients**  

The system provides a solid foundation for tournament management and competitive scoring while maintaining flexibility for different game types and scoring preferences.
