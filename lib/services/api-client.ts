/**
 * Base API client with common functionality
 * Provides consistent error handling and response processing
 */

import { API_ENDPOINTS } from '@/lib/constants'
import type { ApiResponse } from '@/types'

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Base API client configuration
 */
interface ApiClientConfig {
  baseUrl?: string
  timeout?: number
  defaultHeaders?: Record<string, string>
}

/**
 * Request options for API calls
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

/**
 * Base API client class
 */
class ApiClient {
  private baseUrl: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || ''
    this.timeout = config.timeout || 10000
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    }
  }

  /**
   * Make a generic API request
   * @param url - Request URL
   * @param options - Request options
   * @returns Promise with typed response
   */
  private async request<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
    } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const data = await response.json()
      return data as ApiResponse<T>
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408)
        }
        throw new ApiError(error.message, 0)
      }
      
      throw new ApiError('Unknown error occurred', 0)
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body })
  }
}

// Create and export a default API client instance
export const apiClient = new ApiClient()

/**
 * Utility function to handle API responses consistently
 * @param response - API response
 * @returns Data from successful response
 * @throws ApiError if response indicates failure
 */
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiError(response.error || 'API request failed', 400, response)
  }
  
  if (response.data === undefined) {
    throw new ApiError('No data received from API', 404, response)
  }
  
  return response.data
}

/**
 * Create a URL with query parameters
 * @param baseUrl - Base URL
 * @param params - Query parameters
 * @returns URL with query string
 */
export function createUrlWithParams(baseUrl: string, params: Record<string, string | number | boolean | undefined>): string {
  const validParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  
  if (validParams.length === 0) {
    return baseUrl
  }
  
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${validParams.join('&')}`
}
