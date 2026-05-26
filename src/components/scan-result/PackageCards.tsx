import type { ColumnDef } from '@tanstack/react-table'
import { Package } from 'lucide-react'

import { DataTableCards } from '@/components/data-table-cards'
import { LicenseBadge } from '@/components/scan-result/LicenseBadge'
import { Badge } from '@/components/ui/badge'
import type { ScanPackageRow } from '@/helpers/scan-result'

type PackageCardsProps = {
  rows: ScanPackageRow[]
}

const packageColumns: ColumnDef<ScanPackageRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'version',
    header: 'Version',
  },
  {
    accessorKey: 'declaredLicense',
    header: 'License',
  },
  {
    accessorKey: 'sourceFile',
    header: 'Source file',
  },
]

function PackageCards({ rows }: PackageCardsProps) {
  return (
    <DataTableCards
      columns={packageColumns}
      data={rows}
      renderCard={(row) => <PackageCard row={row} />}
    />
  )
}

export { PackageCards }
export default PackageCards

function PackageCard({ row }: { row: ScanPackageRow }) {
  return (
    <article className="space-y-1 text-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h4 className="flex items-center gap-2 font-semibold text-foreground">
            <Package className="size-4 shrink-0" aria-hidden="true" />
            <span className="break-all">{row.name}</span>
          </h4>
          <code className="block break-all text-xs text-muted-foreground">
            {row.purl}
          </code>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Badge variant="secondary">{row.type}</Badge>
          {row.version !== 'Unknown' ? (
            <Badge variant="outline">v{row.version}</Badge>
          ) : null}
          {row.dependenciesCount > 0 ? (
            <Badge variant="outline">{row.dependenciesCount} deps</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <span className="font-medium text-foreground">Source: </span>
          <code className="break-all">{row.sourceFile}</code>
        </div>
        <div className="min-w-0 shrink-0 sm:text-right">
          <span className="font-medium text-foreground">
            Declared license:{' '}
          </span>
          <LicenseBadge license={row.declaredLicense} />
        </div>
      </div>

      {row.description !== 'Unknown' ? (
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
          {row.description}
        </p>
      ) : null}
    </article>
  )
}
