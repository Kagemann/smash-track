# Tournament System Testing Guide

## Prerequisites

1. **Database Setup**
   ```bash
   # Apply the new schema changes
   npm run db:push
   
   # Or if using migrations
   npx prisma migrate dev --name add_tournament_system
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

## Testing Flow

### Step 1: Create a Board with Participants

1. Navigate to the dashboard or create a new board
2. Create a **Leaderboard** board (tournaments work best with leaderboard boards)
3. Add at least **11 participants** (for the default 6+5 group split)
   - You can add more, but need to adjust group sizes accordingly

### Step 2: Create a Tournament

1. Go to the board admin page: `/boards/[boardId]/admin`
2. Scroll to the **Tournaments** section
3. Click **"Create Tournament"** button
4. Follow the wizard:

   **Step 1: Tournament Details**
   - Enter tournament name (e.g., "Summer Championship")
   - Add optional description
   - Board should be pre-selected

   **Step 2: Group Configuration**
   - Default: Group A (6 players), Group B (5 players)
   - You can add/remove groups or adjust sizes
   - Total must match player count

   **Step 3: Add Players**
   - Select participants from the board
   - Must select exactly the number matching group sizes sum
   - Selected count is shown

   **Step 4: Review & Create**
   - Review all details
   - Click **"Create Tournament"**

### Step 3: Draw Groups

1. After creation, you'll be redirected to `/tournaments/[tournamentId]`
2. In the **Overview** tab, you'll see two options:
   - **Random Draw**: Click "Random Draw" to automatically assign players to groups
   - **Manual Assign**: Click "Manual Assign" to open a dialog where you can manually place players into groups
3. For **Manual Assign**:
   - A dialog opens showing all groups and unassigned players
   - Click group buttons next to each player to assign them
   - Remove players from groups using the X button
   - Confirm when all players are assigned and groups are filled
4. Tournament phase changes to **GROUP_DRAW** after assignment

### Step 4: Generate Match Schedule

1. Still in Overview tab, click **"Generate Match Schedule"** button
2. This creates all round-robin matches for each group
3. Tournament phase changes to **GROUP_STAGE**
4. Navigate to **Schedule** tab to see all matches

### Step 5: Complete Group Matches

1. Go to **Schedule** tab
2. Click on any match to view/edit (you'll need to implement match completion UI or use existing match card component)
3. Complete matches by entering scores:
   - Use existing match completion flow
   - Or navigate to match detail page if available
4. Complete **all matches** in both groups

### Step 6: View Group Standings

1. Go to **Groups** tab
2. You'll see standings tables for each group showing:
   - Rank, Player, W, L, D, GF, GA, GD, Pts
   - Top 2 players highlighted (will advance)

### Step 7: Advance to Knockout

1. Return to **Overview** tab
2. Once all group matches are completed, **"Advance to Knockout Stage"** button appears
3. Click it to:
   - Calculate final group rankings
   - Create semifinal matches (A1 vs B2, B1 vs A2)
   - Tournament phase changes to **KNOCKOUT**

### Step 8: Complete Knockout Matches

1. Go to **Knockout** tab
2. Complete both semifinal matches
3. Final match is automatically created when both semifinals complete
4. Complete final match
4. Tournament phase changes to **COMPLETED**

## Testing Checklist

### Tournament Creation
- [ ] Create tournament with valid data
- [ ] Validation: name required
- [ ] Validation: board required
- [ ] Validation: group sizes sum must match player count
- [ ] Validation: at least one player required

### Group Drawing
- [ ] Draw groups buttons appear when players added (Random Draw and Manual Assign)
- [ ] Random draw assigns players randomly to groups
- [ ] Manual assign dialog opens with visual interface
- [ ] Can assign players to groups manually by clicking group buttons
- [ ] Can remove players from groups
- [ ] Validation prevents assignment if groups aren't filled correctly
- [ ] Groups are created (Group A, Group B, etc.)
- [ ] Cannot draw if player count doesn't match group sizes

### Schedule Generation
- [ ] Generate schedule button appears after group draw
- [ ] All round-robin matches created
- [ ] Each player plays every other player in their group once
- [ ] Matches have correct groupId and round="GROUP"

### Match Completion
- [ ] Tournament matches can be completed
- [ ] Scores update board leaderboard (Wins, Losses, Points columns)
- [ ] Group standings update after match completion
- [ ] Match status changes to COMPLETED

### Group Standings
- [ ] Standings calculated correctly (wins, losses, draws, goals)
- [ ] Ranking: Points → GD → GF → Head-to-Head
- [ ] Top 2 players highlighted
- [ ] Standings update in real-time as matches complete

### Knockout Advancement
- [ ] Advance button only appears when all group matches complete
- [ ] Semifinals created correctly (A1 vs B2, B1 vs A2)
- [ ] Final automatically created when semifinals complete
- [ ] Tournament phase updates correctly

### Knockout Bracket
- [ ] Semifinals displayed
- [ ] Final displayed when ready
- [ ] Winners shown correctly
- [ ] Bracket updates as matches complete

## Quick Test Scenario

**Setup:**
- Create board with 11 participants: Player1, Player2, ..., Player11
- Create tournament: "Test Tournament"
- Groups: [6, 5]

**Flow:**
1. Create tournament → Add all 11 players
2. Draw groups → Should create Group A (6) and Group B (5)
3. Generate schedule → Should create:
   - Group A: 15 matches (6 choose 2 = 15)
   - Group B: 10 matches (5 choose 2 = 10)
   - Total: 25 matches
4. Complete a few matches in each group
5. Check standings update correctly
6. Complete all matches
7. Advance to knockout → Should create 2 semifinals
8. Complete semifinals → Final should auto-create
9. Complete final → Tournament should be COMPLETED

## API Testing (Optional)

You can also test the API endpoints directly:

```bash
# Create tournament
curl -X POST http://localhost:3000/api/tournaments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tournament",
    "boardId": "your-board-id",
    "groupSizes": [6, 5]
  }'

# Draw groups
curl -X POST http://localhost:3000/api/tournaments/[tournamentId]/draw

# Generate schedule
curl -X POST http://localhost:3000/api/tournaments/[tournamentId]/schedule

# Get group standings
curl http://localhost:3000/api/tournaments/[tournamentId]/groups

# Advance to knockout
curl -X POST http://localhost:3000/api/tournaments/[tournamentId]/advance

# Get knockout bracket
curl http://localhost:3000/api/tournaments/[tournamentId]/knockout
```

## Common Issues & Solutions

**Issue: "Participant count doesn't match group sizes"**
- Solution: Ensure you select exactly the number of players that matches the sum of group sizes

**Issue: "Cannot draw groups"**
- Solution: Make sure tournament is in SETUP phase and has participants

**Issue: "Cannot advance to knockout"**
- Solution: Ensure ALL group matches are completed (status = COMPLETED)

**Issue: Match completion doesn't update standings**
- Solution: Standings are calculated on-demand. Refresh the Groups tab or call the groups API endpoint

**Issue: Final match not appearing**
- Solution: Complete both semifinal matches first. The final is auto-created when both semifinals are done.

## Database Verification

Check the database to verify data:

```bash
# Open Prisma Studio
npm run db:studio
```

Check:
- `Tournament` table has your tournament
- `Group` table has groups for the tournament
- `TournamentParticipant` table has participants with groupId assigned
- `Match` table has matches with groupId or tournamentId set
- Match `round` field is "GROUP", "SEMIFINAL", or "FINAL"

## Next Steps After Testing

Once testing is complete:
1. Verify all matches update the board leaderboard correctly
2. Test with different group configurations (e.g., 3 groups of 4)
3. Test edge cases (draws, tie-breakers)
4. Test with fewer/more players
5. Verify history entries are created for all actions

