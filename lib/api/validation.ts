/**
 * Validation middleware and utilities for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError, z } from 'zod'
import { createValidationErrorResponse } from './response'

/**
 * Validates request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        response: createValidationErrorResponse(error),
      }
    }
    
    throw error // Re-throw non-validation errors
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams)
    const validatedData = schema.parse(params)
    
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        response: createValidationErrorResponse(error),
      }
    }
    
    throw error // Re-throw non-validation errors
  }
}

/**
 * Validates path parameters against a Zod schema
 */
export async function validatePathParams<T>(
  params: Promise<Record<string, string>>,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const pathParams = await params
    const validatedData = schema.parse(pathParams)
    
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        response: createValidationErrorResponse(error),
      }
    }
    
    throw error // Re-throw non-validation errors
  }
}

/**
 * Creates a middleware function that validates request body
 */
export function withBodyValidation<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest) => {
    return await validateRequestBody(request, schema)
  }
}

/**
 * Creates a middleware function that validates query parameters
 */
export function withQueryValidation<T>(schema: ZodSchema<T>) {
  return (request: NextRequest) => {
    return validateQueryParams(request, schema)
  }
}

/**
 * Creates a middleware function that validates path parameters
 */
export function withParamsValidation<T>(schema: ZodSchema<T>) {
  return async (params: Promise<Record<string, string>>) => {
    return await validatePathParams(params, schema)
  }
}

/**
 * Common validation schemas for path parameters
 */
export const pathParamsSchemas = {
  id: (fieldName = 'id') => ({
    [fieldName]: z.string().min(1, `${fieldName} is required`),
  }),
}

/**
 * Common validation schemas for query parameters
 */
export const queryParamsSchemas = {
  pagination: {
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  },
  
  sorting: {
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  },
}

/**
 * Sanitizes string input by trimming whitespace and removing potentially harmful characters
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .substring(0, 1000) // Limit length
}

/**
 * Sanitizes numeric input
 */
export function sanitizeNumber(input: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (isNaN(input) || !isFinite(input)) {
    return min
  }
  
  return Math.max(min, Math.min(max, input))
}

/**
 * Validates if a string is a valid ID (CUID format)
 */
export function isValidId(id: string): boolean {
  // CUID format: starts with 'c' followed by 24 characters (letters and numbers)
  const cuidRegex = /^c[a-z0-9]{24}$/
  return cuidRegex.test(id)
}

/**
 * Validates email format (basic validation)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}