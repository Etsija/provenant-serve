import { cn } from '@/lib/utils'

type SummaryTileProps = {
  icon: React.ReactNode
  label: string
  value?: number | string
  valueClassName?: string
}

export function SummaryTile({
  icon,
  label,
  value,
  valueClassName,
}: SummaryTileProps) {
  return (
    <div className="bg-background rounded-lg border p-3">
      <p className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </p>
      <p className={cn('text-2xl font-semibold', valueClassName)}>
        {value ?? 'Unknown'}
      </p>
    </div>
  )
}
