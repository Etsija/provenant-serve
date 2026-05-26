import {
  type Column,
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type DataTableCardsProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  emptyMessage?: string
  renderCard: (row: TData) => React.ReactNode
}

export function DataTableCards<TData, TValue>({
  columns,
  data,
  emptyMessage = 'No results.',
  renderCard,
}: DataTableCardsProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  // TanStack Table intentionally returns non-memoizable functions from this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const rows = table.getRowModel().rows

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end border-b pb-3">
        <DataTableCardsSort columns={table.getAllColumns()} />
      </div>

      {rows.length > 0 ? (
        <div className="grid gap-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border bg-background p-4">
              {renderCard(row.original)}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-background p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      {rows.length > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount() || 1}
          </p>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Go to first page"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="size-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to previous page"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to next page"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to last page"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DataTableCardsSort<TData>({
  columns,
}: {
  columns: Column<TData, unknown>[]
}) {
  const sortableColumns = columns.filter((column) => column.getCanSort())
  const isSortingActive = sortableColumns.some((column) => column.getIsSorted())

  if (sortableColumns.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-sm font-medium">
          Sort
          <ChevronDown
            className={cn('size-4', isSortingActive && 'text-primary')}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {sortableColumns.map((column) => {
            const sorting = column.getIsSorted()

            return (
              <DropdownMenuItem
                key={column.id}
                onClick={() => column.toggleSorting(sorting === 'asc')}
              >
                {sorting === 'asc' ? (
                  <ChevronUp className="mr-2 size-4 text-primary" />
                ) : sorting === 'desc' ? (
                  <ChevronDown className="mr-2 size-4 text-primary" />
                ) : (
                  <ChevronsUpDown className="mr-2 size-4" />
                )}
                {getColumnTitle(column)}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        {isSortingActive ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-center"
              onClick={() => {
                for (const column of sortableColumns) {
                  column.clearSorting()
                }
              }}
            >
              Clear sorting
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getColumnTitle<TData>(column: Column<TData, unknown>) {
  const header = column.columnDef.header
  return typeof header === 'string' ? header : column.id
}
