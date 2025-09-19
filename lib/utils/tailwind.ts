/**
 * Tailwind CSS utilities
 * Helper functions for working with Tailwind classes
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS classes intelligently
 * Handles conflicts and removes duplicate classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Conditionally applies classes based on a condition
 */
export function conditionalClass(condition: boolean, trueClass: string, falseClass = '') {
  return condition ? trueClass : falseClass
}

/**
 * Creates responsive classes for different breakpoints
 */
export function responsiveClass(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
) {
  return cn(
    base,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`
  )
}

/**
 * Generates variant classes for components
 */
export function variantClass(
  variant: string,
  variants: Record<string, string>,
  defaultVariant = 'default'
) {
  return variants[variant] || variants[defaultVariant] || ''
}

/**
 * Combines base classes with size and variant classes
 */
export function componentClass(
  base: string,
  size?: string,
  variant?: string,
  additional?: string
) {
  return cn(base, size, variant, additional)
}