# Changelog

All notable changes to SmashTrack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-XX

### Added

#### Tournament System
- **Group Stage Tournaments**: Complete tournament system with group stages and knockout rounds
- **Tournament Wizard**: Multi-step wizard for creating tournaments with group configuration
- **Flexible Group Configuration**: Configure multiple groups with custom player counts
- **Random Group Draw**: Automatically assign players to groups using Fisher-Yates shuffle
- **Manual Group Assignment**: Manually assign players to groups with visual interface
- **Round-Robin Scheduling**: Automatic generation of complete round-robin match schedules
- **Group Standings**: Real-time standings with points, goal difference, goals for/against
- **Tie-Breaking Logic**: Ranking by points → goal difference → goals for → head-to-head
- **Knockout Stage**: Automatic advancement to semifinals and finals
- **Bracket Visualization**: Visual knockout bracket with match tracking
- **Match Management**: Start, complete, and track tournament matches
- **Tournament Phases**: SETUP → GROUP_DRAW → GROUP_STAGE → KNOCKOUT → COMPLETED

#### API Endpoints
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments` - List tournaments by board
- `GET /api/tournaments/[id]` - Get tournament details
- `PATCH /api/tournaments/[id]` - Update tournament
- `POST /api/tournaments/[id]/players` - Add players
- `DELETE /api/tournaments/[id]/players/[participantId]` - Remove player
- `POST /api/tournaments/[id]/draw` - Draw groups (random or manual)
- `POST /api/tournaments/[id]/schedule` - Generate match schedule
- `GET /api/tournaments/[id]/groups` - Get group standings
- `POST /api/tournaments/[id]/advance` - Advance to knockout
- `GET /api/tournaments/[id]/knockout` - Get knockout bracket

#### Components
- `TournamentWizard` - Multi-step tournament creation wizard
- `ManualGroupAssignment` - Visual interface for manual group assignment
- `GroupStandings` - Table view of group standings
- `MatchSchedule` - Schedule view for group matches
- `BracketView` - Knockout bracket visualization
- `MatchDialog` - Dialog for starting and completing matches
- `TournamentCard` - Summary card for tournament listings

#### Utilities
- `lib/utils/tournament/draw.ts` - Random and manual group assignment
- `lib/utils/tournament/schedule.ts` - Round-robin schedule generation
- `lib/utils/tournament/ranking.ts` - Group standings calculation with tie-breakers
- `lib/utils/tournament/advancement.ts` - Knockout participant determination

#### Database Schema
- `Tournament` model with status and phase tracking
- `Group` model for tournament groups
- `TournamentParticipant` model for many-to-many relationship
- Extended `Match` model with tournament support (groupId, tournamentId, round, matchNumber)
- Tournament-related enums: `TournamentStatus`, `TournamentPhase`

#### Features
- **Wildcard Players**: Add new participants directly from tournament wizard
- **Match Integration**: Tournament matches update board leaderboard scores
- **History Tracking**: Complete audit trail for all tournament actions
- **Real-time Updates**: Tournament state updates across all clients

### Changed
- Updated `Match` model to support both session and tournament matches
- Match completion API now handles tournament matches correctly
- Board admin page includes tournament management section
- Participant API endpoints for creating participants on-the-fly

### Fixed
- Hydration warning for browser extensions (suppressed on `<html>` tag)
- Match completion for tournament matches now correctly updates board scores
- Tournament match history logging includes tournament context

### Documentation
- Updated README with tournament features
- Created comprehensive tournament testing guide
- Updated API documentation with tournament endpoints

## [0.1.0] - Previous Release

### Added
- Initial release with board management
- Session and match management
- Score tracking
- Real-time updates
- Leaderboard and multiscore board types

