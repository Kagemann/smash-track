/**
 * Main utilities barrel export
 * Provides a clean API for importing utilities throughout the app
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Core Tailwind utility function
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export all utility modules for easy access
export * from './utils/format'
export * from './utils/url' 
export * from './utils/scoring'
export * from './utils/validation'
export * from './utils/data'
export * from './utils/browser'
export * from './utils/keyboard'
export * from './utils/session'

// Re-export constants for convenience
export * from './constants'
