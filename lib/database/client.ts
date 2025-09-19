/**
 * Database client configuration and connection management
 * Centralized database access with connection pooling and error handling
 */

import { PrismaClient } from '@prisma/client'

// Global variable to store Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Database client configuration options
 */
const databaseConfig = {
  // Log queries in development
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] as const
    : ['error'] as const,
    
  // Connection configuration
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  
  // Error formatting
  errorFormat: 'pretty' as const,
}

/**
 * Creates and configures the Prisma client
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient(databaseConfig)
}

/**
 * Singleton Prisma client instance
 * Reuses the same instance in development to avoid connection limit issues
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Store the client globally in non-production environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Gracefully handles database connection errors
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

/**
 * Gracefully closes the database connection
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
    throw error
  }
}

/**
 * Checks if the database is connected and accessible
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

/**
 * Executes a database operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on certain errors
      if (
        error instanceof Error &&
        (error.message.includes('Unique constraint') ||
         error.message.includes('Foreign key constraint') ||
         error.message.includes('Record to update not found'))
      ) {
        throw error
      }
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
    }
  }
  
  throw lastError!
}

/**
 * Executes multiple operations in a transaction
 */
export async function executeTransaction<T>(
  operations: (prismaClient: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (prismaClient) => {
    return await operations(prismaClient)
  })
}

/**
 * Database middleware for logging and monitoring
 */
prisma.$use(async (params, next) => {
  const start = Date.now()
  
  try {
    const result = await next(params)
    const duration = Date.now() - start
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`🐌 Slow query detected: ${params.model}.${params.action} took ${duration}ms`)
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    
    console.error(`❌ Database error in ${params.model}.${params.action} after ${duration}ms:`, error)
    
    throw error
  }
})

/**
 * Cleanup function for graceful application shutdown
 */
process.on('beforeExit', async () => {
  await disconnectDatabase()
})

// Handle uncaught exceptions
process.on('SIGINT', async () => {
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await disconnectDatabase()
  process.exit(0)
})

export default prisma