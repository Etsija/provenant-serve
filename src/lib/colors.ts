import type { ScanJobState } from '@/api/types'

export type IndicatorTone =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'

export type ServiceStatus = 'loading' | 'ok' | 'error'

export type IndicatorColors = {
  badge: string
  icon: string
}

export const indicatorColors: Record<IndicatorTone, IndicatorColors> = {
  success: {
    badge:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  danger: {
    badge:
      'border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20',
    icon: 'text-destructive',
  },
  warning: {
    badge:
      'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    badge: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  neutral: {
    badge: 'border-border bg-muted/50 text-muted-foreground',
    icon: 'text-muted-foreground',
  },
}

export function getServiceStatusTone(status: ServiceStatus): IndicatorTone {
  if (status === 'ok') {
    return 'success'
  }

  if (status === 'error') {
    return 'danger'
  }

  return 'info'
}

export function getScanJobStateTone(
  state: ScanJobState | 'loading',
): IndicatorTone {
  if (state === 'succeeded') {
    return 'success'
  }

  if (state === 'failed') {
    return 'danger'
  }

  if (state === 'pending') {
    return 'warning'
  }

  if (state === 'running' || state === 'loading') {
    return 'info'
  }

  return 'neutral'
}

export function getBooleanStatusTone(value: boolean): IndicatorTone {
  return value ? 'success' : 'neutral'
}
