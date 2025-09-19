/**
 * Tests for API response utilities
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  handleApiError,
  createNotFoundResponse,
  createUnauthorizedResponse,
} from '../response'

// Mock NextResponse.json
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, options) => ({
      body,
      status: options?.status || 200,
    })),
  },
}))

describe('API Response Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createSuccessResponse', () => {
    it('should create a successful response', () => {
      const data = { id: 1, name: 'Test' }
      const result = createSuccessResponse(data, 'Success message', 201)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          message: 'Success message',
        },
        { status: 201 }
      )
    })

    it('should use default status 200', () => {
      const data = { test: true }
      createSuccessResponse(data)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          message: undefined,
        },
        { status: 200 }
      )
    })
  })

  describe('createErrorResponse', () => {
    it('should create an error response', () => {
      const errorMessage = 'Something went wrong'
      createErrorResponse(errorMessage, 400)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      )
    })

    it('should use default status 500', () => {
      createErrorResponse('Error')
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: 'Error',
        },
        { status: 500 }
      )
    })
  })

  describe('createValidationErrorResponse', () => {
    it('should create validation error response from ZodError', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          path: ['email'],
          message: 'String must contain at least 1 character(s)',
        },
      ])

      createValidationErrorResponse(zodError)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: expect.stringContaining('Validation failed'),
        },
        { status: 400 }
      )
    })
  })

  describe('handleApiError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should handle ZodError', () => {
      const zodError = new ZodError([])
      handleApiError(zodError)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Validation failed'),
        }),
        { status: 400 }
      )
    })

    it('should handle "not found" errors', () => {
      const error = new Error('Record not found')
      handleApiError(error)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'The requested resource was not found.',
        }),
        { status: 404 }
      )
    })

    it('should handle "unauthorized" errors', () => {
      const error = new Error('Access unauthorized')
      handleApiError(error)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'You are not authorized to perform this action.',
        }),
        { status: 401 }
      )
    })

    it('should handle duplicate/unique constraint errors', () => {
      const error = new Error('Unique constraint violation')
      handleApiError(error)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'A record with this data already exists',
        }),
        { status: 409 }
      )
    })

    it('should handle generic Error objects', () => {
      const error = new Error('Custom error message')
      handleApiError(error)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Custom error message',
        }),
        { status: 500 }
      )
    })

    it('should handle unknown error types', () => {
      const error = 'String error'
      handleApiError(error)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'An unexpected error occurred. Please try again.',
        }),
        { status: 500 }
      )
    })
  })

  describe('createNotFoundResponse', () => {
    it('should create a 404 response with default message', () => {
      createNotFoundResponse()
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: 'Resource not found',
        },
        { status: 404 }
      )
    })

    it('should create a 404 response with custom resource name', () => {
      createNotFoundResponse('Board')
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: 'Board not found',
        },
        { status: 404 }
      )
    })
  })

  describe('createUnauthorizedResponse', () => {
    it('should create a 401 response with default message', () => {
      createUnauthorizedResponse()
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: 'You are not authorized to perform this action.',
        },
        { status: 401 }
      )
    })

    it('should create a 401 response with custom message', () => {
      const customMessage = 'Invalid API key'
      createUnauthorizedResponse(customMessage)
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: customMessage,
        },
        { status: 401 }
      )
    })
  })
})