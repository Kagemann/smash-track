// Quick script to verify DATABASE_URL is accessible
require('dotenv').config({ path: '.env.local' })
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')

