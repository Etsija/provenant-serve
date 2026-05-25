import { FileJson, Package, Scale } from 'lucide-react'

import type { ScanResult } from '@/api/types'
import { Badge } from '@/components/ui/badge'
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
}

export function ScanResultViewer({ result }: ScanResultViewerProps) {
  const summary = summarizeResult(result)

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
            icon={<FileJson className="size-4" aria-hidden="true" />}
            label="Files"
            value={summary.filesCount}
          />
          <SummaryTile
            icon={<Package className="size-4" aria-hidden="true" />}
            label="Packages"
            value={summary.packagesCount}
          />
          <SummaryTile
            icon={<Scale className="size-4" aria-hidden="true" />}
            label="Licenses"
            value={summary.licensesCount}
          />
        </div>

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
}: {
  icon: React.ReactNode
  label: string
  value?: number
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-2xl font-semibold">{value ?? 'Unknown'}</p>
    </div>
  )
}

function summarizeResult(result: ScanResult): ResultSummary {
  const files = getArray(result, 'files')
  const packages = getArray(result, 'packages')

  return {
    filesCount: files?.length,
    packagesCount: packages?.length,
    licensesCount: countLicenses(result, files),
  }
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

function getArray(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return Array.isArray(value) ? value : undefined
}
