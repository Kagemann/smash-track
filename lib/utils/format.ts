/**
 * Formatting utilities for different data types
 * Functions for consistently displaying scores, time, and other data
 */

/**
 * Format a score value based on the column type
 * @param value - The numeric value to format
 * @param columnType - The type of column (NUMBER, DATE, BOOLEAN, etc.)
 * @returns Formatted string representation of the value
 */
export function formatScore(value: number, columnType?: string): string {
  switch (columnType) {
    case 'NUMBER':
      return value.toLocaleString('en-US')
    case 'DATE':
      return new Date(value).toLocaleDateString()
    case 'BOOLEAN':
      return value ? 'Yes' : 'No'
    default:
      return value.toString()
  }
}

/**
 * Format time in seconds to MM:SS format
 * @param seconds - Number of seconds
 * @returns Formatted time string (e.g., "5:30")
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Format history action strings to human-readable format
 * @param action - The action string (e.g., "score_update")
 * @returns Formatted action string (e.g., "Score Update")
 */
export function formatHistoryAction(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format a percentage with appropriate precision
 * @param value - The decimal value (0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%'
}
