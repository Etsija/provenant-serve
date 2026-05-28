import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, DataTableSortableHeader } from '@/components/data-table'
import type { ScanFindingRow } from '@/helpers/scan-result'

type FindingTableProps = {
  label: 'Email' | 'URL'
  rows: ScanFindingRow[]
}

export function FindingTable({ label, rows }: FindingTableProps) {
  return <DataTable columns={createFindingColumns(label)} data={rows} />
}

function createFindingColumns(
  label: 'Email' | 'URL',
): ColumnDef<ScanFindingRow>[] {
  return [
    {
      accessorKey: 'value',
      size: 45,
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title={label} />
      ),
      cell: ({ row }) => (
        <code className="break-all whitespace-normal">
          {row.original.value}
        </code>
      ),
    },
    {
      accessorKey: 'file',
      size: 45,
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="File" />
      ),
      cell: ({ row }) => (
        <code className="break-all whitespace-normal">{row.original.file}</code>
      ),
    },
    {
      accessorKey: 'lines',
      size: 10,
      header: 'Lines',
    },
  ]
}
