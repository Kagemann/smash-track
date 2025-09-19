/**
 * Browser and device detection utilities
 * Functions for detecting device capabilities and handling browser-specific features
 */

import { UI } from '@/lib/constants'

/**
 * Device detection utilities
 */
export const device = {
  /**
   * Check if the current device is mobile based on screen width
   * @returns True if mobile device
   */
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < UI.MOBILE_BREAKPOINT
  },

  /**
   * Check if the device supports touch input
   * @returns True if touch device
   */
  isTouch: (): boolean => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  /**
   * Check if the device is likely a tablet
   * @returns True if tablet device
   */
  isTablet: (): boolean => {
    if (typeof window === 'undefined') return false
    const width = window.innerWidth
    return width >= UI.MOBILE_BREAKPOINT && width < 1024 && device.isTouch()
  },

  /**
   * Check if the device is in landscape orientation
   * @returns True if landscape
   */
  isLandscape: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.innerWidth > window.innerHeight
  },
} as const

/**
 * Browser capability detection
 */
export const browser = {
  /**
   * Check if localStorage is available
   * @returns True if localStorage is supported and available
   */
  hasLocalStorage: (): boolean => {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, 'test')
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  /**
   * Check if the browser supports the Clipboard API
   * @returns True if Clipboard API is available
   */
  hasClipboardAPI: (): boolean => {
    return typeof navigator !== 'undefined' && 'clipboard' in navigator
  },

  /**
   * Check if the browser supports the Share API
   * @returns True if Share API is available
   */
  hasShareAPI: (): boolean => {
    return typeof navigator !== 'undefined' && 'share' in navigator
  },

  /**
   * Check if the browser supports Service Workers
   * @returns True if Service Workers are supported
   */
  hasServiceWorker: (): boolean => {
    return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
  },

  /**
   * Check if the browser supports Push Notifications
   * @returns True if Push API is supported
   */
  hasPushNotifications: (): boolean => {
    return typeof window !== 'undefined' && 'PushManager' in window
  },
} as const

/**
 * DOM manipulation utilities
 */
export const dom = {
  /**
   * Copy text to clipboard with fallback for older browsers
   * @param text - Text to copy
   * @returns Promise that resolves when copy is complete
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    if (browser.hasClipboardAPI()) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch {
        return dom.fallbackCopyToClipboard(text)
      }
    }
    return dom.fallbackCopyToClipboard(text)
  },

  /**
   * Fallback method for copying text to clipboard
   * @param text - Text to copy
   * @returns True if successful
   */
  fallbackCopyToClipboard: (text: string): boolean => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    } catch {
      return false
    }
  },

  /**
   * Scroll to top of page smoothly
   */
  scrollToTop: (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  },

  /**
   * Scroll element into view
   * @param element - Element to scroll into view
   * @param behavior - Scroll behavior (smooth or auto)
   */
  scrollIntoView: (element: Element, behavior: 'smooth' | 'auto' = 'smooth'): void => {
    element.scrollIntoView({
      behavior,
      block: 'nearest',
      inline: 'nearest'
    })
  },

  /**
   * Get viewport dimensions
   * @returns Object with viewport width and height
   */
  getViewportSize: (): { width: number; height: number } => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 }
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  },
} as const

/**
 * Performance utilities
 */
export const performance = {
  /**
   * Debounce function execution
   * @param func - Function to debounce
   * @param wait - Wait time in milliseconds
   * @returns Debounced function
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  /**
   * Throttle function execution
   * @param func - Function to throttle
   * @param wait - Wait time in milliseconds
   * @returns Throttled function
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall >= wait) {
        lastCall = now
        func(...args)
      }
    }
  },

  /**
   * Request animation frame with fallback
   * @param callback - Callback to execute
   * @returns Request ID for cancellation
   */
  requestAnimationFrame: (callback: () => void): number => {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      return window.requestAnimationFrame(callback)
    }
    return setTimeout(callback, 16) as unknown as number
  },
} as const
