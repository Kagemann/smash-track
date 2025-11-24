/**
 * Test utilities and helpers
 * Simple testing framework for utility functions
 */

/**
 * Simple test runner for utility functions
 */
export class SimpleTest {
  private tests: Array<{ name: string; fn: () => void | Promise<void> }> = []
  private results: Array<{ name: string; passed: boolean; error?: Error }> = []

  /**
   * Add a test case
   * @param name - Test name
   * @param fn - Test function
   */
  test(name: string, fn: () => void | Promise<void>) {
    this.tests.push({ name, fn })
    return this
  }

  /**
   * Run all tests
   * @returns Promise that resolves when all tests complete
   */
  async run(): Promise<{ passed: number; failed: number; total: number }> {
    this.results = []
    
    for (const test of this.tests) {
      try {
        await test.fn()
        this.results.push({ name: test.name, passed: true })
        console.log(`✅ ${test.name}`)
      } catch (error) {
        this.results.push({ 
          name: test.name, 
          passed: false, 
          error: error as Error 
        })
        console.error(`❌ ${test.name}: ${(error as Error).message}`)
      }
    }

    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    
    console.log(`\nTest Results: ${passed}/${this.tests.length} passed`)
    
    return {
      passed,
      failed,
      total: this.tests.length
    }
  }

  /**
   * Get test results
   * @returns Array of test results
   */
  getResults() {
    return this.results
  }
}

/**
 * Assertion helpers
 */
export const assert = {
  /**
   * Assert that a value is truthy
   * @param value - Value to test
   * @param message - Error message
   */
  ok(value: any, message?: string): void {
    if (!value) {
      throw new Error(message || `Expected truthy value, got: ${value}`)
    }
  },

  /**
   * Assert that two values are equal
   * @param actual - Actual value
   * @param expected - Expected value
   * @param message - Error message
   */
  equal<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`)
    }
  },

  /**
   * Assert that two values are deeply equal (JSON comparison)
   * @param actual - Actual value
   * @param expected - Expected value
   * @param message - Error message
   */
  deepEqual<T>(actual: T, expected: T, message?: string): void {
    const actualStr = JSON.stringify(actual)
    const expectedStr = JSON.stringify(expected)
    if (actualStr !== expectedStr) {
      throw new Error(message || `Expected ${expectedStr}, got ${actualStr}`)
    }
  },

  /**
   * Assert that a function throws an error
   * @param fn - Function to test
   * @param message - Error message
   */
  throws(fn: () => any, message?: string): void {
    let threw = false
    try {
      fn()
    } catch {
      threw = true
    }
    if (!threw) {
      throw new Error(message || 'Expected function to throw an error')
    }
  },

  /**
   * Assert that an async function rejects
   * @param fn - Async function to test
   * @param message - Error message
   */
  async rejects(fn: () => Promise<any>, message?: string): Promise<void> {
    let rejected = false
    try {
      await fn()
    } catch {
      rejected = true
    }
    if (!rejected) {
      throw new Error(message || 'Expected function to reject')
    }
  },
}

/**
 * Mock helpers for testing
 */
export const mock = {
  /**
   * Create a mock function that tracks calls
   * @returns Mock function with call tracking
   */
  fn<T extends (...args: any[]) => any>(implementation?: T) {
    const calls: Parameters<T>[] = []
    
    const mockFn = ((...args: Parameters<T>) => {
      calls.push(args)
      return implementation?.(...args)
    }) as T & {
      calls: Parameters<T>[]
      callCount: number
      wasCalledWith: (...args: Parameters<T>) => boolean
    }
    
    Object.defineProperty(mockFn, 'calls', { get: () => calls })
    Object.defineProperty(mockFn, 'callCount', { get: () => calls.length })
    
    mockFn.wasCalledWith = (...args: Parameters<T>) => {
      return calls.some(callArgs => 
        JSON.stringify(callArgs) === JSON.stringify(args)
      )
    }
    
    return mockFn
  },

  /**
   * Create mock data for testing
   */
  data: {
    /**
     * Generate a mock board
     */
    board(overrides = {}) {
      return {
        id: 'board-1',
        name: 'Test Board',
        type: 'LEADERBOARD' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        participants: [],
        columns: [],
        scores: [],
        history: [],
        sessions: [],
        tournaments: [],
        ...overrides,
      }
    },

    /**
     * Generate a mock participant
     */
    participant(overrides = {}) {
      return {
        id: 'participant-1',
        name: 'Test Participant',
        boardId: 'board-1',
        scores: [],
        createdAt: new Date(),
        player1Matches: [],
        player2Matches: [],
        ...overrides,
      }
    },

    /**
     * Generate a mock score
     */
    score(overrides = {}) {
      return {
        id: 'score-1',
        value: 100,
        participantId: 'participant-1',
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        participant: this.participant(),
        ...overrides,
      }
    },
  },
}
