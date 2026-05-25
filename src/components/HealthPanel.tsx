import { useQueries } from '@tanstack/react-query'
import { Activity, Server, ShieldCheck, Wrench } from 'lucide-react'

import { getLivez, getReadyz, getVersion } from '@/api/provenantApi'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ServiceCheck = {
  label: string
  value: string
  status: 'loading' | 'ok' | 'error'
}

export function HealthPanel() {
  const [livez, readyz, version] = useQueries({
    queries: [
      {
        queryKey: ['provenant', 'livez'],
        queryFn: getLivez,
        refetchInterval: 10_000,
      },
      {
        queryKey: ['provenant', 'readyz'],
        queryFn: getReadyz,
        refetchInterval: 10_000,
      },
      {
        queryKey: ['provenant', 'version'],
        queryFn: getVersion,
        staleTime: 60_000,
      },
    ],
  })

  const checks: ServiceCheck[] = [
    {
      label: 'Liveness',
      value: livez.data?.status ?? 'Checking',
      status: livez.isPending ? 'loading' : livez.isError ? 'error' : 'ok',
    },
    {
      label: 'Readiness',
      value: readyz.data?.status ?? 'Checking',
      status: readyz.isPending ? 'loading' : readyz.isError ? 'error' : 'ok',
    },
    {
      label: 'API version',
      value: version.data?.api_version ?? readyz.data?.api_version ?? 'Unknown',
      status: version.isPending ? 'loading' : version.isError ? 'error' : 'ok',
    },
    {
      label: 'Tool version',
      value: version.data?.tool_version ?? 'Unknown',
      status: version.isPending ? 'loading' : version.isError ? 'error' : 'ok',
    },
  ]

  const error = livez.error ?? readyz.error ?? version.error

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="size-5" aria-hidden="true" />
          Provenant service
        </CardTitle>
        <CardDescription>
          Health and version information from the local backend proxy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <Wrench className="size-4" aria-hidden="true" />
            <AlertTitle>Backend unavailable</AlertTitle>
            <AlertDescription>
              Start <code>provenant serve --bind 127.0.0.1:8080</code> and
              refresh this page.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {checks.map((check) => (
            <div
              key={check.label}
              className="rounded-lg border bg-background p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {check.label}
                </span>
                <StatusBadge status={check.status} />
              </div>
              <p className="truncate text-base font-semibold">{check.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: ServiceCheck['status'] }) {
  if (status === 'loading') {
    return (
      <Badge variant="secondary">
        <Activity className="size-3" aria-hidden="true" />
        Checking
      </Badge>
    )
  }

  if (status === 'error') {
    return <Badge variant="destructive">Error</Badge>
  }

  return (
    <Badge variant="outline">
      <ShieldCheck className="size-3" aria-hidden="true" />
      OK
    </Badge>
  )
}
