/**
 * Formatting utilities
 * Helper functions for formatting data for display
 */

import { ColumnType } from '@/lib/types'

/**
 * Formats a number with proper locale formatting
 */
export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Formats a score value based on column type
 */
export function formatScore(value: number, columnType?: ColumnType): string {
  switch (columnType) {
    case 'NUMBER':
      return formatNumber(value)
    case 'DATE':
      return new Date(value).toLocaleDateString()
    case 'BOOLEAN':
      return value ? 'Yes' : 'No'
    default:
      return value.toString()
  }
}

/**
 * Formats time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Formats a date to a human-readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

/**
 * Formats a relative time string (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) {
    return 'just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  } else {
    return formatDate(dateObj, { month: 'short', day: 'numeric' })
  }
}

/**
 * Formats a file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}

/**
 * Formats a percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Formats a string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(capitalize)
    .join(' ')
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Formats a rank with appropriate suffix (1st, 2nd, 3rd, etc.)
 */
export function formatRank(rank: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = rank % 100
  
  return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

/**
 * Formats an action name for display (converts snake_case to Title Case)
 */
export function formatActionName(action: string): string {
  return action
    .split('_')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Formats a match score display
 */
export function formatMatchScore(player1Score: number, player2Score: number): string {
  return `${player1Score} - ${player2Score}`
}

/**
 * Formats a currency value
 */
export function formatCurrency(
  amount: number, 
  currency = 'USD', 
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Formats a phone number (basic US format)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  
  return phone
}

/**
 * Formats a list of items with proper conjunctions
 */
export function formatList(items: string[], conjunction = 'and'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`
  
  const lastItem = items[items.length - 1]
  const otherItems = items.slice(0, -1)
  
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`
}