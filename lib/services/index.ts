/**
 * Services barrel export
 * Centralized API services for consistent data management
 */

// Export the base API client for custom usage
export * from './api-client'

// Export specific services
export * from './board-service'
export * from './session-service'
export * from './tournament-service'

// Re-export combined service objects for convenience
export { boardApi } from './board-service'
export { sessionApi } from './session-service'
export { tournamentService } from './tournament-service'
