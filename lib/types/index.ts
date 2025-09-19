/**
 * Main types export file
 * Re-exports all type definitions from different modules
 */

// Database types
export * from './database'

// API types
export * from './api'

// UI types
export * from './ui'

// Legacy compatibility - gradually remove these as we migrate
// These are kept for backward compatibility during migration
export type {
  // Keep commonly used legacy types for now
  Board as LegacyBoard,
  Participant as LegacyParticipant,
  Score as LegacyScore,
  Column as LegacyColumn,
  Session as LegacySession,
  Match as LegacyMatch,
} from './database'

export type {
  CreateBoardInput as CreateBoardData,
  UpdateBoardInput as UpdateBoardData,
  CreateParticipantInput as CreateParticipantData,
  UpdateParticipantInput as UpdateParticipantData,
  CreateScoreInput as CreateScoreData,
  UpdateScoreInput as UpdateScoreData,
  CreateColumnInput as CreateColumnData,
  CreateSessionInput as CreateSessionData,
  UpdateSessionInput as UpdateSessionData,
  CreateMatchInput as CreateMatchData,
  UpdateMatchInput as UpdateMatchData,
  CompleteMatchInput as CompleteMatchData,
} from './api'