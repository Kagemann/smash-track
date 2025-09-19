/**
 * UI component prop types and component-specific interfaces
 * These types define the shape of props for React components
 */

import { Board, Participant, Score, Column } from './database'
import { CreateParticipantRequest, UpdateScoreRequest } from './api'

// Navigation component types
export interface NavigationProps {
  variant?: 'public' | 'admin' | 'session'
  boardName?: string
  sessionName?: string
}

// Board component types
export interface BoardCardProps {
  board: Board
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
}

export interface ScoreTableProps {
  board: Board
  onScoreUpdate: (data: UpdateScoreRequest) => void
  onParticipantAdd: (data: CreateParticipantRequest) => void
  onParticipantRemove: (id: string) => void
}

export interface ParticipantListProps {
  participants: Participant[]
  onAdd: (data: CreateParticipantRequest) => void
  onRemove: (id: string) => void
  onBulkDelete?: (ids: string[]) => void
}

// Score input component types
export interface ScoreInputProps {
  value: number
  onChange: (value: number) => void
  onIncrement?: () => void
  onDecrement?: () => void
  disabled?: boolean
  className?: string
}

export interface RankChipProps {
  rank: number
  participant: Participant
  score: number
  isTied?: boolean
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Modal and dialog types
export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

// Form component types
export interface BoardWizardProps {
  onSubmit: (data: any) => void
  onCancel?: () => void
  initialData?: Partial<Board>
  isLoading?: boolean
}

// Table and data display types
export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: TableColumn[]
  sortConfig?: SortConfig
  onSort?: (config: SortConfig) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
}

// Layout types
export interface LayoutProps {
  children: React.ReactNode
  navigation?: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

// Theme and styling types
export type ThemeVariant = 'light' | 'dark' | 'system'

export interface ThemeContextType {
  theme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
}

// Error boundary types
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  error?: string | null
  lastUpdated?: Date
}

// Responsive breakpoint types
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface ResponsiveValue<T> {
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

// Animation and transition types
export interface AnimationConfig {
  duration?: number
  delay?: number
  easing?: string
  onComplete?: () => void
}

export interface TransitionProps {
  show: boolean
  appear?: boolean
  enter?: string
  enterFrom?: string
  enterTo?: string
  leave?: string
  leaveFrom?: string
  leaveTo?: string
  className?: string
  children: React.ReactNode
}