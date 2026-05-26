import type { ColumnDef } from '@tanstack/react-table'
import {
  Clock,
  Copyright,
  FileJson,
  Link,
  Mail,
  Package,
  Scale,
} from 'lucide-react'
import { useMemo } from 'react'

import type { ScanResult } from '@/api/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { DataTable, DataTableSortableHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ScanResultViewerProps = {
  result: ScanResult
}

type ResultSummary = {
  filesCount?: number
  packagesCount?: number
  licensesCount?: number
  copyrightsCount?: number
  urlsCount?: number
  emailsCount?: number
  startTime?: string
  endTime?: string
  duration?: string
}

type ResultAccordion = {
  key: string
  label: string
  count: number
  icon: React.ReactNode
}

type ScanFindingRow = {
  value: string
  file: string
  lines: string
}

export function ScanResultViewer({ result }: ScanResultViewerProps) {
  const emailRows = useMemo(
    () => getNestedFindingRows(result, 'emails', 'email'),
    [result],
  )
  const urlRows = useMemo(
    () => getNestedFindingRows(result, 'urls', 'url'),
    [result],
  )
  const summary = summarizeResult(result)
  const accordions = getResultAccordions(summary)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="size-5" aria-hidden="true" />
          Scan result
        </CardTitle>
        <CardDescription>
          Minimal summary and raw ScanCode-compatible JSON output.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryTile
            icon={<Clock className="size-4" aria-hidden="true" />}
            label="Start time"
            value={summary.startTime}
            valueClassName="text-base"
          />
          <SummaryTile
            icon={<Clock className="size-4" aria-hidden="true" />}
            label="End time"
            value={summary.endTime}
            valueClassName="text-base"
          />
          <SummaryTile
            icon={<Clock className="size-4" aria-hidden="true" />}
            label="Duration"
            value={summary.duration}
            valueClassName="text-base"
          />
        </div>

        {accordions.length > 0 ? (
          <Accordion type="multiple" className="gap-3">
            {accordions.map((accordion) => (
              <AccordionItem
                key={accordion.key}
                value={accordion.key}
                className="rounded-lg border bg-background px-4"
              >
                <AccordionTrigger className="py-4 hover:no-underline">
                  <span className="flex w-full items-center gap-3 pr-4">
                    {accordion.icon}
                    <span>{accordion.label}</span>
                    <span className="ml-auto font-semibold">
                      {accordion.count}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {accordion.key === 'urls' ? (
                    <DataTable columns={urlColumns} data={urlRows} />
                  ) : accordion.key === 'emails' ? (
                    <DataTable columns={emailColumns} data={emailRows} />
                  ) : (
                    <p className="text-muted-foreground">
                      Item list coming next.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : null}

        <details className="group rounded-lg border bg-background">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium select-none">
            <span className="inline-flex items-center gap-2">
              Raw JSON
              <Badge variant="secondary">expand</Badge>
            </span>
          </summary>
          <pre className="max-h-[36rem] overflow-auto border-t bg-muted/40 p-4 text-xs leading-5">
            <code>{JSON.stringify(result, null, 2)}</code>
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}

function SummaryTile({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode
  label: string
  value?: number | string
  valueClassName?: string
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={cn('text-2xl font-semibold', valueClassName)}>
        {value ?? 'Unknown'}
      </p>
    </div>
  )
}

const emailColumns = createFindingColumns('Email')
const urlColumns = createFindingColumns('URL')

function createFindingColumns(
  label: 'Email' | 'URL',
): ColumnDef<ScanFindingRow>[] {
  return [
    {
      accessorKey: 'value',
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title={label} />
      ),
      cell: ({ row }) => (
        <code className="whitespace-normal break-all">
          {row.original.value}
        </code>
      ),
    },
    {
      accessorKey: 'file',
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="File" />
      ),
      cell: ({ row }) => (
        <code className="whitespace-normal break-all">{row.original.file}</code>
      ),
    },
    {
      accessorKey: 'lines',
      header: 'Lines',
    },
  ]
}

function summarizeResult(result: ScanResult): ResultSummary {
  const files = getArray(result, 'files')
  const packages = getArray(result, 'packages')
  const header = getFirstHeader(result)
  const startDate = parseScanTimestamp(getString(header, 'start_timestamp'))
  const endDate = parseScanTimestamp(getString(header, 'end_timestamp'))

  return {
    filesCount: files?.length,
    packagesCount: packages?.length,
    licensesCount: countLicenses(result, files),
    copyrightsCount: countNestedFileItems(files, 'copyrights'),
    urlsCount: countNestedFileItems(files, 'urls'),
    emailsCount: countNestedFileItems(files, 'emails'),
    startTime: formatLocalTime(startDate),
    endTime: formatLocalTime(endDate),
    duration: formatDuration(getDurationSeconds(header, startDate, endDate)),
  }
}

function getResultAccordions(summary: ResultSummary): ResultAccordion[] {
  return [
    {
      key: 'packages',
      label: 'Packages',
      count: summary.packagesCount ?? 0,
      icon: <Package className="size-4" aria-hidden="true" />,
    },
    {
      key: 'files',
      label: 'Files',
      count: summary.filesCount ?? 0,
      icon: <FileJson className="size-4" aria-hidden="true" />,
    },
    {
      key: 'licenses',
      label: 'Licenses',
      count: summary.licensesCount ?? 0,
      icon: <Scale className="size-4" aria-hidden="true" />,
    },
    {
      key: 'copyrights',
      label: 'Copyrights',
      count: summary.copyrightsCount ?? 0,
      icon: <Copyright className="size-4" aria-hidden="true" />,
    },
    {
      key: 'urls',
      label: 'URLs',
      count: summary.urlsCount ?? 0,
      icon: <Link className="size-4" aria-hidden="true" />,
    },
    {
      key: 'emails',
      label: 'Emails',
      count: summary.emailsCount ?? 0,
      icon: <Mail className="size-4" aria-hidden="true" />,
    },
  ].filter((accordion) => accordion.count > 0)
}

function getNestedFindingRows(
  result: ScanResult,
  collectionKey: string,
  valueKey: string,
): ScanFindingRow[] {
  const files = getArray(result, 'files')

  if (!files) {
    return []
  }

  return files.flatMap((file) => {
    if (!file || typeof file !== 'object') {
      return []
    }

    const fileRecord = file as Record<string, unknown>
    const path = getString(fileRecord, 'path') ?? 'Unknown'
    const findings = getArray(fileRecord, collectionKey)

    if (!findings) {
      return []
    }

    return findings.flatMap((finding) => {
      if (!finding || typeof finding !== 'object') {
        return []
      }

      const findingRecord = finding as Record<string, unknown>
      const value = getString(findingRecord, valueKey)

      if (!value) {
        return []
      }

      return [
        {
          value,
          file: path,
          lines: formatLineRange(
            getNumber(findingRecord, 'start_line'),
            getNumber(findingRecord, 'end_line'),
          ),
        },
      ]
    })
  })
}

function countNestedFileItems(
  files: unknown[] | undefined,
  key: string,
): number | undefined {
  if (!files) {
    return undefined
  }

  return files.reduce<number>((count, file) => {
    if (!file || typeof file !== 'object') {
      return count
    }

    const items = getArray(file as Record<string, unknown>, key)
    return count + (items?.length ?? 0)
  }, 0)
}

function countLicenses(result: ScanResult, files?: unknown[]) {
  const topLevelLicenses = getArray(result, 'licenses')

  if (topLevelLicenses) {
    return topLevelLicenses.length
  }

  if (!files) {
    return undefined
  }

  const licenseKeys = new Set<string>()

  for (const file of files) {
    if (!file || typeof file !== 'object') {
      continue
    }

    const fileRecord = file as Record<string, unknown>
    addLicenseExpression(licenseKeys, fileRecord.license_expression)
    addLicenseExpression(licenseKeys, fileRecord.detected_license_expression)

    const licenseDetections = getArray(fileRecord, 'license_detections')
    for (const detection of licenseDetections ?? []) {
      if (!detection || typeof detection !== 'object') {
        continue
      }

      const detectionRecord = detection as Record<string, unknown>
      addLicenseExpression(licenseKeys, detectionRecord.license_expression)
      addLicenseExpression(
        licenseKeys,
        detectionRecord.detected_license_expression,
      )
    }
  }

  return licenseKeys.size
}

function addLicenseExpression(licenseKeys: Set<string>, value: unknown) {
  if (typeof value === 'string' && value.length > 0 && value !== 'unknown') {
    licenseKeys.add(value)
  }
}

function getFirstHeader(result: ScanResult) {
  const headers = getArray(result, 'headers')
  const header = headers?.[0]

  if (header && typeof header === 'object') {
    return header as Record<string, unknown>
  }

  return undefined
}

function getDurationSeconds(
  header: Record<string, unknown> | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined,
) {
  const duration = header?.duration

  if (typeof duration === 'number') {
    return duration
  }

  if (typeof duration === 'string') {
    const parsedDuration = Number(duration)
    return Number.isFinite(parsedDuration) ? parsedDuration : undefined
  }

  if (startDate && endDate) {
    return (endDate.getTime() - startDate.getTime()) / 1000
  }

  return undefined
}

function parseScanTimestamp(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d+))?$/.exec(value)

  if (match) {
    const [, year, month, day, hour, minute, second, fraction = '0'] = match
    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
        Number(fraction.padEnd(3, '0').slice(0, 3)),
      ),
    )
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatLocalTime(date: Date | undefined) {
  if (!date) {
    return undefined
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date)
}

function formatDuration(durationSeconds: number | undefined) {
  if (durationSeconds === undefined || !Number.isFinite(durationSeconds)) {
    return undefined
  }

  const totalSeconds = Math.max(0, Math.round(durationSeconds))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':')
}

function formatLineRange(
  startLine: number | undefined,
  endLine: number | undefined,
) {
  if (startLine === undefined) {
    return 'Unknown'
  }

  if (endLine === undefined || endLine === startLine) {
    return startLine.toString()
  }

  return `${startLine}-${endLine}`
}

function getString(
  record: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = record?.[key]
  return typeof value === 'string' ? value : undefined
}

function getNumber(
  record: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const value = record?.[key]
  return typeof value === 'number' ? value : undefined
}

function getArray(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return Array.isArray(value) ? value : undefined
}
