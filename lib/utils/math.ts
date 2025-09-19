/**
 * Math utilities
 * Helper functions for mathematical operations and calculations
 */

/**
 * Clamps a number between a minimum and maximum value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Rounds a number to a specified number of decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Calculates the percentage of a value relative to a total
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Calculates the average of an array of numbers
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return sum / numbers.length
}

/**
 * Calculates the median of an array of numbers
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0
  
  const sorted = [...numbers].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  } else {
    return sorted[middle]
  }
}

/**
 * Calculates the standard deviation of an array of numbers
 */
export function calculateStandardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0
  
  const mean = calculateAverage(numbers)
  const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2))
  const variance = calculateAverage(squaredDifferences)
  
  return Math.sqrt(variance)
}

/**
 * Generates a random number between min and max (inclusive)
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Checks if a number is even
 */
export function isEven(num: number): boolean {
  return num % 2 === 0
}

/**
 * Checks if a number is odd
 */
export function isOdd(num: number): boolean {
  return num % 2 !== 0
}

/**
 * Converts degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Converts radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Calculates the distance between two points
 */
export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const deltaX = x2 - x1
  const deltaY = y2 - y1
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}

/**
 * Calculates the factorial of a number
 */
export function factorial(n: number): number {
  if (n < 0) return 0
  if (n === 0 || n === 1) return 1
  return n * factorial(n - 1)
}

/**
 * Calculates the greatest common divisor of two numbers
 */
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * Calculates the least common multiple of two numbers
 */
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

/**
 * Checks if a number is prime
 */
export function isPrime(num: number): boolean {
  if (num < 2) return false
  if (num === 2) return true
  if (num % 2 === 0) return false
  
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false
  }
  
  return true
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * Maps a value from one range to another
 */
export function mapRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  const normalized = (value - fromMin) / (fromMax - fromMin)
  return toMin + normalized * (toMax - toMin)
}

/**
 * Calculates win rate as a percentage
 */
export function calculateWinRate(wins: number, totalGames: number): number {
  if (totalGames === 0) return 0
  return roundTo(calculatePercentage(wins, totalGames), 1)
}

/**
 * Calculates points per game average
 */
export function calculatePointsPerGame(totalPoints: number, totalGames: number): number {
  if (totalGames === 0) return 0
  return roundTo(totalPoints / totalGames, 2)
}

/**
 * Calculates goal difference
 */
export function calculateGoalDifference(goalsFor: number, goalsAgainst: number): number {
  return goalsFor - goalsAgainst
}

/**
 * Calculates ranking based on multiple criteria
 */
export interface RankingCriteria {
  points: number
  wins: number
  goalDifference: number
  goalsFor: number
}

export function compareRankings(a: RankingCriteria, b: RankingCriteria): number {
  // Primary: Points (descending)
  if (a.points !== b.points) {
    return b.points - a.points
  }
  
  // Secondary: Goal difference (descending)
  if (a.goalDifference !== b.goalDifference) {
    return b.goalDifference - a.goalDifference
  }
  
  // Tertiary: Goals for (descending)
  if (a.goalsFor !== b.goalsFor) {
    return b.goalsFor - a.goalsFor
  }
  
  // Quaternary: Wins (descending)
  return b.wins - a.wins
}