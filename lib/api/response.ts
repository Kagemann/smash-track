/**
 * API response utilities for consistent response handling
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiResponse } from '@/lib/types/api'
import { ERROR_MESSAGES } from '@/lib/constants'

/**
 * Creates a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  )
}

/**
 * Creates an error API response
 */
export function createErrorResponse(
  error: string,
  status = 500
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

/**
 * Creates a validation error response from Zod error
 */
export function createValidationErrorResponse(
  zodError: ZodError
): NextResponse<ApiResponse> {
  const errorMessages = zodError.errors.map(
    (error) => `${error.path.join('.')}: ${error.message}`
  )
  
  return createErrorResponse(
    `Validation failed: ${errorMessages.join(', ')}`,
    400
  )
}

/**
 * Handles common API errors and returns appropriate responses
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return createValidationErrorResponse(error)
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('not found')) {
      return createErrorResponse(ERROR_MESSAGES.NOT_FOUND, 404)
    }
    
    if (error.message.includes('unauthorized')) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401)
    }

    if (error.message.includes('duplicate') || error.message.includes('unique constraint')) {
      return createErrorResponse('A record with this data already exists', 409)
    }

    // Return the specific error message for known errors
    return createErrorResponse(error.message, 500)
  }

  // Generic error for unknown error types
  return createErrorResponse(ERROR_MESSAGES.GENERIC, 500)
}

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<ApiResponse<R>>>
): (...args: T) => Promise<NextResponse<ApiResponse<R>>> {
  return async (...args: T): Promise<NextResponse<ApiResponse<R>>> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error) as NextResponse<ApiResponse<R>>
    }
  }
}

/**
 * Creates a 404 Not Found response
 */
export function createNotFoundResponse(
  resource = 'Resource'
): NextResponse<ApiResponse> {
  return createErrorResponse(`${resource} not found`, 404)
}

/**
 * Creates a 401 Unauthorized response
 */
export function createUnauthorizedResponse(
  message = ERROR_MESSAGES.UNAUTHORIZED
): NextResponse<ApiResponse> {
  return createErrorResponse(message, 401)
}

/**
 * Creates a 403 Forbidden response
 */
export function createForbiddenResponse(
  message = 'Access forbidden'
): NextResponse<ApiResponse> {
  return createErrorResponse(message, 403)
}

/**
 * Creates a 409 Conflict response
 */
export function createConflictResponse(
  message = 'Conflict with existing resource'
): NextResponse<ApiResponse> {
  return createErrorResponse(message, 409)
}

/**
 * Creates a 429 Too Many Requests response
 */
export function createRateLimitResponse(
  message = 'Too many requests'
): NextResponse<ApiResponse> {
  return createErrorResponse(message, 429)
}