/**
 * Tests for utility functions
 * Basic tests to ensure utility functions work correctly
 */

import { SimpleTest, assert, mock } from '../test-utils'
import { formatScore, formatTime, formatLargeNumber } from '../utils/format'
import { generateBoardUrl, generateShareData } from '../utils/url'
import { calculateRanks, validateScore } from '../utils/scoring'
import { validateBoardName, validateParticipantName } from '../utils/validation'
import { find, filter, sort, aggregate } from '../utils/data'

/**
 * Format utility tests
 */
export const formatTests = new SimpleTest()
  .test('formatScore - formats numbers correctly', () => {
    assert.equal(formatScore(1000, 'NUMBER'), '1,000')
    assert.equal(formatScore(1, 'BOOLEAN'), 'Yes')
    assert.equal(formatScore(0, 'BOOLEAN'), 'No')
    assert.equal(formatScore(123), '123')
  })
  .test('formatTime - formats seconds to MM:SS', () => {
    assert.equal(formatTime(90), '1:30')
    assert.equal(formatTime(65), '1:05')
    assert.equal(formatTime(30), '0:30')
  })
  .test('formatLargeNumber - formats large numbers with suffixes', () => {
    assert.equal(formatLargeNumber(1500), '1.5K')
    assert.equal(formatLargeNumber(1500000), '1.5M')
    assert.equal(formatLargeNumber(1500000000), '1.5B')
    assert.equal(formatLargeNumber(500), '500')
  })

/**
 * URL utility tests
 */
export const urlTests = new SimpleTest()
  .test('generateBoardUrl - creates correct URLs', () => {
    const publicUrl = generateBoardUrl('board123', 'public')
    const adminUrl = generateBoardUrl('board123', 'admin')
    
    assert.ok(publicUrl.includes('/boards/board123'))
    assert.ok(adminUrl.includes('/boards/board123/admin'))
  })
  .test('generateShareData - creates share object', () => {
    const board = mock.data.board({ id: 'test-board', name: 'Test Board' })
    const shareData = generateShareData(board)
    
    assert.ok(shareData.publicUrl)
    assert.ok(shareData.adminUrl)
    assert.equal(shareData.boardName, 'Test Board')
  })

/**
 * Scoring utility tests
 */
export const scoringTests = new SimpleTest()
  .test('validateScore - validates different score types', () => {
    assert.equal(validateScore(100, 'NUMBER'), true)
    assert.equal(validateScore(-10, 'NUMBER'), true) // Negative values allowed for score increments
    assert.equal(validateScore(1, 'BOOLEAN'), true)
    assert.equal(validateScore(2, 'BOOLEAN'), false)
    assert.equal(validateScore(NaN, 'NUMBER'), false)
  })
  .test('calculateRanks - calculates participant rankings', () => {
    const participants = [
      mock.data.participant({ id: '1', name: 'Player 1' }),
      mock.data.participant({ id: '2', name: 'Player 2' }),
    ]
    const scores = [
      mock.data.score({ participantId: '1', value: 100 }),
      mock.data.score({ participantId: '2', value: 150 }),
    ]
    
    const ranks = calculateRanks(scores, participants)
    
    assert.equal(ranks[0].rank, 1)
    assert.equal(ranks[0].participantId, '2')
    assert.equal(ranks[1].rank, 2)
    assert.equal(ranks[1].participantId, '1')
  })

/**
 * Validation utility tests
 */
export const validationTests = new SimpleTest()
  .test('validateBoardName - validates board names', () => {
    assert.equal(validateBoardName('Valid Board').valid, true)
    assert.equal(validateBoardName('').valid, false)
    assert.equal(validateBoardName('a'.repeat(101)).valid, false)
  })
  .test('validateParticipantName - validates participant names', () => {
    assert.equal(validateParticipantName('Valid Player').valid, true)
    assert.equal(validateParticipantName('').valid, false)
    assert.equal(validateParticipantName('a'.repeat(51)).valid, false)
  })

/**
 * Data utility tests
 */
export const dataTests = new SimpleTest()
  .test('find.participantById - finds participant by ID', () => {
    const participants = [
      mock.data.participant({ id: '1', name: 'Player 1' }),
      mock.data.participant({ id: '2', name: 'Player 2' }),
    ]
    
    const found = find.participantById(participants, '2')
    assert.equal(found?.name, 'Player 2')
    
    const notFound = find.participantById(participants, '3')
    assert.equal(notFound, undefined)
  })
  .test('filter.scoresByParticipant - filters scores by participant', () => {
    const scores = [
      mock.data.score({ participantId: '1', value: 100 }),
      mock.data.score({ participantId: '2', value: 150 }),
      mock.data.score({ participantId: '1', value: 50 }),
    ]
    
    const player1Scores = filter.scoresByParticipant(scores, '1')
    assert.equal(player1Scores.length, 2)
    assert.ok(player1Scores.every(s => s.participantId === '1'))
  })
  .test('aggregate.boardsByType - aggregates boards by type', () => {
    const boards = [
      mock.data.board({ type: 'LEADERBOARD' }),
      mock.data.board({ type: 'MULTISCORE' }),
      mock.data.board({ type: 'LEADERBOARD' }),
    ]
    
    const stats = aggregate.boardsByType(boards)
    assert.equal(stats.leaderboards, 2)
    assert.equal(stats.multiscore, 1)
    assert.equal(stats.total, 3)
  })

/**
 * Run all utility tests
 */
export async function runAllUtilityTests() {
  console.log('🧪 Running utility tests...\n')
  
  const results = await Promise.all([
    formatTests.run(),
    urlTests.run(),
    scoringTests.run(),
    validationTests.run(),
    dataTests.run(),
  ])
  
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0)
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
  const totalTests = results.reduce((sum, r) => sum + r.total, 0)
  
  console.log(`\n🏁 All utility tests complete!`)
  console.log(`✅ ${totalPassed}/${totalTests} tests passed`)
  
  if (totalFailed > 0) {
    console.log(`❌ ${totalFailed} tests failed`)
  }
  
  return {
    passed: totalPassed,
    failed: totalFailed,
    total: totalTests,
    success: totalFailed === 0,
  }
}

// Test suites are already exported above as named exports
