/**
 * Keyboard interaction and accessibility utilities
 * Functions for handling keyboard events and improving accessibility
 */

/**
 * Common keyboard key constants
 */
export const Keys = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  PLUS: '+',
  MINUS: '-',
  EQUALS: '=',
} as const

/**
 * Keyboard event handler utilities
 */
export const keyboard = {
  /**
   * Handle keyboard score updates (increment/decrement)
   * @param event - Keyboard event
   * @param currentValue - Current score value
   * @param onUpdate - Callback to update the score
   * @param options - Configuration options
   */
  handleScoreUpdate: (
    event: KeyboardEvent,
    currentValue: number,
    onUpdate: (value: number) => void,
    options: {
      allowNegative?: boolean
      step?: number
      max?: number
      min?: number
    } = {}
  ): void => {
    const { allowNegative = false, step = 1, max, min } = options
    const minValue = allowNegative ? (min ?? -Infinity) : (min ?? 0)
    
    let newValue = currentValue
    
    switch (event.key) {
      case Keys.PLUS:
      case Keys.EQUALS:
      case Keys.ARROW_UP:
        event.preventDefault()
        newValue = currentValue + step
        if (max !== undefined && newValue > max) {
          newValue = max
        }
        onUpdate(newValue)
        break
        
      case Keys.MINUS:
      case Keys.ARROW_DOWN:
        event.preventDefault()
        newValue = currentValue - step
        if (newValue < minValue) {
          newValue = minValue
        }
        onUpdate(newValue)
        break
    }
  },

  /**
   * Handle navigation with arrow keys
   * @param event - Keyboard event
   * @param onNavigate - Callback with direction
   */
  handleNavigation: (
    event: KeyboardEvent,
    onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void
  ): void => {
    switch (event.key) {
      case Keys.ARROW_UP:
        event.preventDefault()
        onNavigate('up')
        break
      case Keys.ARROW_DOWN:
        event.preventDefault()
        onNavigate('down')
        break
      case Keys.ARROW_LEFT:
        event.preventDefault()
        onNavigate('left')
        break
      case Keys.ARROW_RIGHT:
        event.preventDefault()
        onNavigate('right')
        break
    }
  },

  /**
   * Check if a key event is an activation key (Enter or Space)
   * @param event - Keyboard event
   * @returns True if activation key
   */
  isActivationKey: (event: KeyboardEvent): boolean => {
    return event.key === Keys.ENTER || event.key === Keys.SPACE
  },

  /**
   * Check if a key event is an escape key
   * @param event - Keyboard event
   * @returns True if escape key
   */
  isEscapeKey: (event: KeyboardEvent): boolean => {
    return event.key === Keys.ESCAPE
  },

  /**
   * Check if modifier keys are pressed
   * @param event - Keyboard event
   * @returns Object with modifier key states
   */
  getModifiers: (event: KeyboardEvent): {
    ctrl: boolean
    alt: boolean
    shift: boolean
    meta: boolean
  } => ({
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey,
  }),

  /**
   * Handle common shortcuts (Ctrl+S, Ctrl+Z, etc.)
   * @param event - Keyboard event
   * @param shortcuts - Object with shortcut handlers
   */
  handleShortcuts: (
    event: KeyboardEvent,
    shortcuts: {
      save?: () => void
      undo?: () => void
      redo?: () => void
      copy?: () => void
      paste?: () => void
      selectAll?: () => void
      find?: () => void
    }
  ): void => {
    const modifiers = keyboard.getModifiers(event)
    
    if (modifiers.ctrl || modifiers.meta) {
      switch (event.key.toLowerCase()) {
        case 's':
          if (shortcuts.save) {
            event.preventDefault()
            shortcuts.save()
          }
          break
        case 'z':
          if (modifiers.shift && shortcuts.redo) {
            event.preventDefault()
            shortcuts.redo()
          } else if (shortcuts.undo) {
            event.preventDefault()
            shortcuts.undo()
          }
          break
        case 'y':
          if (shortcuts.redo) {
            event.preventDefault()
            shortcuts.redo()
          }
          break
        case 'c':
          if (shortcuts.copy) {
            event.preventDefault()
            shortcuts.copy()
          }
          break
        case 'v':
          if (shortcuts.paste) {
            event.preventDefault()
            shortcuts.paste()
          }
          break
        case 'a':
          if (shortcuts.selectAll) {
            event.preventDefault()
            shortcuts.selectAll()
          }
          break
        case 'f':
          if (shortcuts.find) {
            event.preventDefault()
            shortcuts.find()
          }
          break
      }
    }
  },
} as const

/**
 * Accessibility utilities
 */
export const a11y = {
  /**
   * Generate a unique ID for accessibility attributes
   * @param prefix - Prefix for the ID
   * @returns Unique ID string
   */
  generateId: (prefix: string = 'a11y'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Create ARIA label for score input
   * @param participantName - Name of participant
   * @param columnName - Name of column (optional)
   * @param currentValue - Current score value
   * @returns ARIA label string
   */
  createScoreLabel: (
    participantName: string,
    columnName: string | undefined,
    currentValue: number
  ): string => {
    if (columnName) {
      return `${participantName} ${columnName} score: ${currentValue}. Use arrow keys or +/- to adjust.`
    }
    return `${participantName} score: ${currentValue}. Use arrow keys or +/- to adjust.`
  },

  /**
   * Create ARIA label for board navigation
   * @param boardName - Name of the board
   * @param boardType - Type of board
   * @param participantCount - Number of participants
   * @returns ARIA label string
   */
  createBoardLabel: (
    boardName: string,
    boardType: string,
    participantCount: number
  ): string => {
    return `${boardName} - ${boardType} board with ${participantCount} participants`
  },

  /**
   * Create live region announcement for score updates
   * @param participantName - Name of participant
   * @param newValue - New score value
   * @param columnName - Name of column (optional)
   * @returns Announcement string
   */
  createScoreAnnouncement: (
    participantName: string,
    newValue: number,
    columnName?: string
  ): string => {
    if (columnName) {
      return `${participantName} ${columnName} updated to ${newValue}`
    }
    return `${participantName} score updated to ${newValue}`
  },

  /**
   * Focus management utilities
   */
  focus: {
    /**
     * Move focus to element safely
     * @param element - Element to focus or selector string
     */
    moveTo: (element: Element | string | null): void => {
      const target = typeof element === 'string' 
        ? document.querySelector(element)
        : element
        
      if (target && 'focus' in target) {
        (target as HTMLElement).focus()
      }
    },

    /**
     * Focus the first focusable element within a container
     * @param container - Container element
     */
    firstInContainer: (container: Element): void => {
      const focusable = container.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable && 'focus' in focusable) {
        (focusable as HTMLElement).focus()
      }
    },

    /**
     * Trap focus within a container (for modals)
     * @param container - Container element
     * @param event - Keyboard event
     */
    trapInContainer: (container: Element, event: KeyboardEvent): void => {
      if (event.key !== Keys.TAB) return

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
  },
} as const
