import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, DataTableSortableHeader } from '@/components/data-table'
import type { ScanFileRow } from '@/helpers/scan-result'

type FileTableProps = {
  rows: ScanFileRow[]
}

const fileColumns: ColumnDef<ScanFileRow>[] = [
  {
    accessorKey: 'file',
    size: 70,
    header: ({ column }) => (
      <DataTableSortableHeader column={column} title="File" />
    ),
    cell: ({ row }) => (
      <code className="block min-w-0 break-all whitespace-normal">
        {row.original.file}
      </code>
    ),
  },
  {
    accessorKey: 'sha1',
    size: 30,
    header: 'SHA1',
    cell: ({ row }) => (
      <code className="block min-w-0 break-all whitespace-normal">
        {row.original.sha1}
      </code>
    ),
  },
]

export function FileTable({ rows }: FileTableProps) {
  return <DataTable columns={fileColumns} data={rows} />
}
