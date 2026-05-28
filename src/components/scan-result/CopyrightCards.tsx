import type { ColumnDef } from '@tanstack/react-table'
import { Copyright, UserRound, UsersRound } from 'lucide-react'

import { DataTableCards } from '@/components/data-table-cards'
import { Badge } from '@/components/ui/badge'
import type { ScanCopyrightRow } from '@/helpers/scan-result'

type CopyrightCardsProps = {
  rows: ScanCopyrightRow[]
}

const copyrightColumns: ColumnDef<ScanCopyrightRow>[] = [
  {
    accessorKey: 'statement',
    header: 'Statement',
  },
  {
    accessorKey: 'file',
    header: 'File',
  },
  {
    accessorKey: 'lines',
    header: 'Lines',
  },
]

function CopyrightCards({ rows }: CopyrightCardsProps) {
  return (
    <DataTableCards
      columns={copyrightColumns}
      data={rows}
      renderCard={(row) => <CopyrightCard row={row} />}
    />
  )
}

export { CopyrightCards }
export default CopyrightCards

function CopyrightCard({ row }: { row: ScanCopyrightRow }) {
  return (
    <article className="space-y-3 text-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="text-foreground flex min-w-0 items-start gap-2 font-semibold">
          <Copyright className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="break-words">{row.statement}</span>
        </h4>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {row.years.map((year) => (
            <Badge key={year} variant="outline">
              {year}
            </Badge>
          ))}
          {row.holders.length > 0 ? (
            <Badge variant="secondary">{row.holders.length} holders</Badge>
          ) : null}
          {row.authors.length > 0 ? (
            <Badge variant="secondary">{row.authors.length} authors</Badge>
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

      <CopyrightPeople
        icon={<UsersRound />}
        label="Holders"
        values={row.holders}
      />
      <CopyrightPeople
        icon={<UserRound />}
        label="Authors"
        values={row.authors}
      />
    </article>
  )
}

function CopyrightPeople({
  icon,
  label,
  values,
}: {
  icon: React.ReactElement
  label: string
  values: string[]
}) {
  if (values.length === 0) {
    return null
  }

  return (
    <div className="text-muted-foreground flex items-start gap-2 text-xs">
      {icon}
      <div className="min-w-0">
        <span className="text-foreground font-medium">{label}: </span>
        <span className="break-words">{values.join(', ')}</span>
      </div>
    </div>
  )
}
