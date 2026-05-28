import type { ColumnDef } from '@tanstack/react-table'
import { Scale } from 'lucide-react'

import { DataTableCards } from '@/components/data-table-cards'
import { LicenseBadge } from '@/components/scan-result/LicenseBadge'
import { Badge } from '@/components/ui/badge'
import type { ScanLicenseRow } from '@/helpers/scan-result'

type LicenseCardsProps = {
  rows: ScanLicenseRow[]
}

const licenseColumns: ColumnDef<ScanLicenseRow>[] = [
  {
    accessorKey: 'expression',
    header: 'Expression',
  },
  {
    accessorKey: 'file',
    header: 'File',
  },
  {
    accessorKey: 'score',
    header: 'Score',
  },
  {
    accessorKey: 'source',
    header: 'Source',
  },
]

function LicenseCards({ rows }: LicenseCardsProps) {
  return (
    <DataTableCards
      columns={licenseColumns}
      data={rows}
      renderCard={(row) => <LicenseCard row={row} />}
    />
  )
}

export { LicenseCards }
export default LicenseCards

function LicenseCard({ row }: { row: ScanLicenseRow }) {
  return (
    <article className="space-y-3 text-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h4 className="text-foreground flex items-center gap-2 font-semibold">
            <Scale className="size-4 shrink-0" aria-hidden="true" />
            <span>Detected license</span>
          </h4>
          <LicenseBadge license={row.expression} />
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {row.score !== undefined ? (
            <Badge variant="outline">{row.score}%</Badge>
          ) : null}
          <Badge variant="secondary">{row.source}</Badge>
          {row.category !== 'Unknown' ? (
            <Badge variant="outline">{row.category}</Badge>
          ) : null}
        </div>
      </div>

      <div className="text-muted-foreground grid gap-2 text-xs sm:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <span className="text-foreground font-medium">Source: </span>
          <code className="break-all">{row.file}</code>
        </div>
        <div className="shrink-0 sm:text-right">
          <span className="text-foreground font-medium">Lines: </span>
          <code>{row.lines}</code>
        </div>
      </div>

      {row.licenseKeys.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-foreground font-medium">Keys:</span>
          {row.licenseKeys.map((key) => (
            <Badge key={key} variant="outline">
              {key}
            </Badge>
          ))}
        </div>
      ) : null}

      {row.rule !== 'Unknown' ? (
        <p className="text-muted-foreground text-xs">
          <span className="text-foreground font-medium">Rule: </span>
          <code className="break-all">{row.rule}</code>
        </p>
      ) : null}

      {row.matchedText !== 'Unknown' ? (
        <p className="text-muted-foreground line-clamp-3 text-xs leading-5">
          {row.matchedText}
        </p>
      ) : null}
    </article>
  )
}
