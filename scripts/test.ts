/**
 * Test runner script
 * Runs all tests in the project
 */

import { runAllUtilityTests } from '../lib/__tests__/utils.test'

async function runTests() {
  try {
    console.log('🚀 Starting SmashTrack test suite...\n')
    
    const results = await runAllUtilityTests()
    
    if (results.success) {
      console.log('\n🎉 All tests passed!')
      process.exit(0)
    } else {
      console.log('\n💥 Some tests failed!')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Test runner error:', error)
    process.exit(1)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runTests()
}

export { runTests }
