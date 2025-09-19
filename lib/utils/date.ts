/**
 * Date and time utilities
 * Helper functions for working with dates and times
 */

/**
 * Checks if a date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

/**
 * Checks if a date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  )
}

/**
 * Gets the start of day for a given date
 */
export function getStartOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  dateObj.setHours(0, 0, 0, 0)
  return dateObj
}

/**
 * Gets the end of day for a given date
 */
export function getEndOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  dateObj.setHours(23, 59, 59, 999)
  return dateObj
}

/**
 * Gets the start of week for a given date (Sunday)
 */
export function getStartOfWeek(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  const day = dateObj.getDay()
  const diff = dateObj.getDate() - day
  const startOfWeek = new Date(dateObj.setDate(diff))
  return getStartOfDay(startOfWeek)
}

/**
 * Gets the end of week for a given date (Saturday)
 */
export function getEndOfWeek(date: Date | string): Date {
  const startOfWeek = getStartOfWeek(date)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  return getEndOfDay(endOfWeek)
}

/**
 * Gets the start of month for a given date
 */
export function getStartOfMonth(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
}

/**
 * Gets the end of month for a given date
 */
export function getEndOfMonth(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 23, 59, 59, 999)
}

/**
 * Adds days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  dateObj.setDate(dateObj.getDate() + days)
  return dateObj
}

/**
 * Subtracts days from a date
 */
export function subtractDays(date: Date | string, days: number): Date {
  return addDays(date, -days)
}

/**
 * Gets the difference in days between two dates
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffInTime = Math.abs(dateObj2.getTime() - dateObj1.getTime())
  return Math.ceil(diffInTime / (1000 * 3600 * 24))
}

/**
 * Gets the difference in hours between two dates
 */
export function getHoursDifference(date1: Date | string, date2: Date | string): number {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffInTime = Math.abs(dateObj2.getTime() - dateObj1.getTime())
  return Math.ceil(diffInTime / (1000 * 3600))
}

/**
 * Gets the difference in minutes between two dates
 */
export function getMinutesDifference(date1: Date | string, date2: Date | string): number {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffInTime = Math.abs(dateObj2.getTime() - dateObj1.getTime())
  return Math.ceil(diffInTime / (1000 * 60))
}

/**
 * Checks if a date is within a range
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const startObj = typeof startDate === 'string' ? new Date(startDate) : startDate
  const endObj = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  return dateObj >= startObj && dateObj <= endObj
}

/**
 * Formats a duration in milliseconds to human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Gets a user-friendly time zone name
 */
export function getTimeZoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Converts a date to ISO string for API usage
 */
export function toISOString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString()
}

/**
 * Converts UTC date to local date
 */
export function utcToLocal(utcDate: Date | string): Date {
  const dateObj = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
}

/**
 * Converts local date to UTC
 */
export function localToUtc(localDate: Date | string): Date {
  const dateObj = typeof localDate === 'string' ? new Date(localDate) : localDate
  return new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)
}