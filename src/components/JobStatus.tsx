import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'
import { useEffect } from 'react'

import { getJob, getJobResult } from '@/api/provenantApi'
import type { ScanJobState, ScanResult } from '@/api/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getBooleanStatusTone,
  getScanJobStateTone,
  indicatorColors,
} from '@/lib/colors'
import { cn } from '@/lib/utils'

type JobStatusProps = {
  jobId: string
  onResultFetched?: (result: ScanResult) => void
}

const terminalStates = new Set(['succeeded', 'failed'])

export function JobStatus({ jobId, onResultFetched }: JobStatusProps) {
  const jobQuery = useQuery({
    queryKey: ['provenant', 'job', jobId],
    queryFn: () => getJob(jobId),
    refetchInterval: (query) => {
      const state = query.state.data?.state
      return state && terminalStates.has(state) ? false : 2_000
    },
  })

  const resultQuery = useQuery({
    queryKey: ['provenant', 'job', jobId, 'result'],
    queryFn: () => getJobResult(jobId),
    enabled: jobQuery.data?.result_ready === true,
    retry: false,
  })

  const state = jobQuery.data?.state ?? 'loading'
  const resultReady = jobQuery.data?.result_ready ?? false

  useEffect(() => {
    if (resultQuery.data) {
      onResultFetched?.(resultQuery.data)
    }
  }, [onResultFetched, resultQuery.data])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StateIcon state={state} />
          Job status
        </CardTitle>
        <CardDescription>
          Polling Provenant job <code>{jobId}</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobQuery.error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not fetch job status</AlertTitle>
            <AlertDescription>
              The job may have expired from Provenant&apos;s in-memory job
              store.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <StatusTile label="State">
            <Badge
              variant="outline"
              className={indicatorColors[getScanJobStateTone(state)].badge}
            >
              {state}
            </Badge>
          </StatusTile>
          <StatusTile label="Result ready">
            <Badge
              variant="outline"
              className={
                indicatorColors[getBooleanStatusTone(resultReady)].badge
              }
            >
              {resultReady ? 'Yes' : 'No'}
            </Badge>
          </StatusTile>
          <StatusTile label="Processors">
            <span className="font-semibold">
              {jobQuery.data?.allocated_processors ?? 'Unknown'}
            </span>
          </StatusTile>
        </div>

        {state === 'failed' ? (
          <Alert variant="destructive">
            <XCircle className="size-4" aria-hidden="true" />
            <AlertTitle>Scan failed</AlertTitle>
            <AlertDescription>
              Provenant reported that the scan job failed.
            </AlertDescription>
          </Alert>
        ) : null}

        {resultQuery.isFetching ? (
          <Alert>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <AlertTitle>Fetching result</AlertTitle>
            <AlertDescription>
              Downloading the completed scan result.
            </AlertDescription>
          </Alert>
        ) : null}

        {resultQuery.error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not fetch result</AlertTitle>
            <AlertDescription>
              The result endpoint returned an error even though the job reported
              readiness.
            </AlertDescription>
          </Alert>
        ) : null}

        {resultQuery.data ? (
          <Alert>
            <CheckCircle2 className="size-4" aria-hidden="true" />
            <AlertTitle>Result fetched</AlertTitle>
            <AlertDescription>
              The scan result is available below.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}

function StatusTile({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function StateIcon({ state }: { state: ScanJobState | 'loading' }) {
  const tone = getScanJobStateTone(state)
  const className = cn(
    'size-5',
    state === 'running' || state === 'loading' ? 'animate-spin' : undefined,
    indicatorColors[tone].icon,
  )

  if (state === 'succeeded') {
    return <CheckCircle2 className={className} aria-hidden="true" />
  }

  if (state === 'failed') {
    return <XCircle className={className} aria-hidden="true" />
  }

  if (state === 'pending') {
    return <Clock className={className} aria-hidden="true" />
  }

  return <Loader2 className={className} aria-hidden="true" />
}
