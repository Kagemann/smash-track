/**
 * Tests for math utilities
 */

import {
  clamp,
  roundTo,
  calculatePercentage,
  calculateAverage,
  calculateMedian,
  randomBetween,
  randomIntBetween,
  isEven,
  isOdd,
  calculateDistance,
  factorial,
  gcd,
  lcm,
  isPrime,
  lerp,
  mapRange,
  calculateWinRate,
  calculatePointsPerGame,
  calculateGoalDifference,
  compareRankings,
} from '../math'

describe('Math Utilities', () => {
  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('roundTo', () => {
    it('should round to specified decimal places', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14)
      expect(roundTo(3.14159, 0)).toBe(3)
      expect(roundTo(3.14159, 4)).toBe(3.1416)
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25)
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 2)
      expect(calculatePercentage(0, 0)).toBe(0)
    })
  })

  describe('calculateAverage', () => {
    it('should calculate average of numbers', () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3)
      expect(calculateAverage([10, 20])).toBe(15)
      expect(calculateAverage([])).toBe(0)
    })
  })

  describe('calculateMedian', () => {
    it('should calculate median correctly', () => {
      expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3)
      expect(calculateMedian([1, 2, 3, 4])).toBe(2.5)
      expect(calculateMedian([5, 1, 3])).toBe(3)
      expect(calculateMedian([])).toBe(0)
    })
  })

  describe('randomBetween', () => {
    it('should generate numbers within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomBetween(1, 10)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
      }
    })
  })

  describe('randomIntBetween', () => {
    it('should generate integers within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomIntBetween(1, 10)
        expect(Number.isInteger(result)).toBe(true)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
      }
    })
  })

  describe('isEven', () => {
    it('should identify even numbers', () => {
      expect(isEven(2)).toBe(true)
      expect(isEven(4)).toBe(true)
      expect(isEven(1)).toBe(false)
      expect(isEven(3)).toBe(false)
      expect(isEven(0)).toBe(true)
    })
  })

  describe('isOdd', () => {
    it('should identify odd numbers', () => {
      expect(isOdd(1)).toBe(true)
      expect(isOdd(3)).toBe(true)
      expect(isOdd(2)).toBe(false)
      expect(isOdd(4)).toBe(false)
      expect(isOdd(0)).toBe(false)
    })
  })

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      expect(calculateDistance(0, 0, 3, 4)).toBe(5)
      expect(calculateDistance(1, 1, 1, 1)).toBe(0)
      expect(calculateDistance(0, 0, 1, 1)).toBeCloseTo(1.414, 3)
    })
  })

  describe('factorial', () => {
    it('should calculate factorial correctly', () => {
      expect(factorial(0)).toBe(1)
      expect(factorial(1)).toBe(1)
      expect(factorial(5)).toBe(120)
      expect(factorial(-1)).toBe(0)
    })
  })

  describe('gcd', () => {
    it('should calculate greatest common divisor', () => {
      expect(gcd(12, 8)).toBe(4)
      expect(gcd(17, 13)).toBe(1)
      expect(gcd(0, 5)).toBe(5)
    })
  })

  describe('lcm', () => {
    it('should calculate least common multiple', () => {
      expect(lcm(12, 8)).toBe(24)
      expect(lcm(3, 5)).toBe(15)
    })
  })

  describe('isPrime', () => {
    it('should identify prime numbers', () => {
      expect(isPrime(2)).toBe(true)
      expect(isPrime(3)).toBe(true)
      expect(isPrime(17)).toBe(true)
      expect(isPrime(4)).toBe(false)
      expect(isPrime(1)).toBe(false)
      expect(isPrime(0)).toBe(false)
    })
  })

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5)
      expect(lerp(10, 20, 0.2)).toBe(12)
      expect(lerp(0, 10, 0)).toBe(0)
      expect(lerp(0, 10, 1)).toBe(10)
    })
  })

  describe('mapRange', () => {
    it('should map values from one range to another', () => {
      expect(mapRange(5, 0, 10, 0, 100)).toBe(50)
      expect(mapRange(0, 0, 10, 20, 30)).toBe(20)
      expect(mapRange(10, 0, 10, 20, 30)).toBe(30)
    })
  })

  describe('calculateWinRate', () => {
    it('should calculate win rate percentage', () => {
      expect(calculateWinRate(5, 10)).toBe(50)
      expect(calculateWinRate(3, 9)).toBe(33.3)
      expect(calculateWinRate(0, 0)).toBe(0)
    })
  })

  describe('calculatePointsPerGame', () => {
    it('should calculate points per game average', () => {
      expect(calculatePointsPerGame(20, 10)).toBe(2)
      expect(calculatePointsPerGame(15, 6)).toBe(2.5)
      expect(calculatePointsPerGame(0, 0)).toBe(0)
    })
  })

  describe('calculateGoalDifference', () => {
    it('should calculate goal difference', () => {
      expect(calculateGoalDifference(10, 5)).toBe(5)
      expect(calculateGoalDifference(3, 7)).toBe(-4)
      expect(calculateGoalDifference(0, 0)).toBe(0)
    })
  })

  describe('compareRankings', () => {
    it('should rank by points first', () => {
      const a = { points: 10, wins: 5, goalDifference: 2, goalsFor: 8 }
      const b = { points: 8, wins: 6, goalDifference: 3, goalsFor: 10 }
      expect(compareRankings(a, b)).toBeLessThan(0) // a ranks higher
    })

    it('should rank by goal difference when points are equal', () => {
      const a = { points: 10, wins: 5, goalDifference: 5, goalsFor: 8 }
      const b = { points: 10, wins: 6, goalDifference: 3, goalsFor: 10 }
      expect(compareRankings(a, b)).toBeLessThan(0) // a ranks higher
    })

    it('should rank by goals for when points and goal difference are equal', () => {
      const a = { points: 10, wins: 5, goalDifference: 5, goalsFor: 12 }
      const b = { points: 10, wins: 6, goalDifference: 5, goalsFor: 10 }
      expect(compareRankings(a, b)).toBeLessThan(0) // a ranks higher
    })

    it('should rank by wins when all other criteria are equal', () => {
      const a = { points: 10, wins: 6, goalDifference: 5, goalsFor: 10 }
      const b = { points: 10, wins: 5, goalDifference: 5, goalsFor: 10 }
      expect(compareRankings(a, b)).toBeLessThan(0) // a ranks higher
    })
  })
})