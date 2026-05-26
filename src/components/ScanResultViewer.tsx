import { Clock, FileJson } from 'lucide-react'
import { useMemo } from 'react'

import type { ScanResult } from '@/api/types'
import { ResultAccordions } from '@/components/scan-result/ResultAccordions'
import { SummaryTile } from '@/components/scan-result/SummaryTile'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getFileRows,
  getNestedFindingRows,
  getPackageRows,
  summarizeResult,
} from '@/helpers/scan-result'

type ScanResultViewerProps = {
  result: ScanResult
}

export function ScanResultViewer({ result }: ScanResultViewerProps) {
  const packageRows = useMemo(() => getPackageRows(result), [result])
  const fileRows = useMemo(() => getFileRows(result), [result])
  const emailRows = useMemo(
    () => getNestedFindingRows(result, 'emails', 'email'),
    [result],
  )
  const urlRows = useMemo(
    () => getNestedFindingRows(result, 'urls', 'url'),
    [result],
  )
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

        <ResultAccordions
          summary={summary}
          emailRows={emailRows}
          fileRows={fileRows}
          packageRows={packageRows}
          urlRows={urlRows}
        />

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
