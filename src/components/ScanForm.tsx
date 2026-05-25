import { useMutation } from '@tanstack/react-query'
import { Loader2, Play } from 'lucide-react'
import { FormEvent, useState } from 'react'

import { getErrorMessage, submitAsyncScan } from '@/api/provenantApi'
import type { ScanOptions, ScanRequest } from '@/api/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { JobStatus } from '@/components/JobStatus'
import { Label } from '@/components/ui/label'

type ScanOptionKey =
  | 'detectPackages'
  | 'detectCopyrights'
  | 'detectEmails'
  | 'detectUrls'

type ScanOptionState = Record<ScanOptionKey, boolean> & {
  detectLicense: boolean
}

const defaultOptions: ScanOptionState = {
  detectLicense: true,
  detectPackages: true,
  detectCopyrights: true,
  detectEmails: true,
  detectUrls: true,
}

const optionLabels: Array<{
  key: keyof ScanOptionState
  label: string
  description: string
}> = [
  {
    key: 'detectLicense',
    label: 'Licenses',
    description: 'Use embedded license detection.',
  },
  {
    key: 'detectPackages',
    label: 'Packages',
    description: 'Detect package metadata.',
  },
  {
    key: 'detectCopyrights',
    label: 'Copyrights',
    description: 'Detect copyright statements.',
  },
  {
    key: 'detectEmails',
    label: 'Emails',
    description: 'Detect email addresses.',
  },
  {
    key: 'detectUrls',
    label: 'URLs',
    description: 'Detect URLs in source files.',
  },
]

export function ScanForm() {
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [repositoryRef, setRepositoryRef] = useState('main')
  const [options, setOptions] = useState<ScanOptionState>(defaultOptions)

  const scanMutation = useMutation({
    mutationFn: submitAsyncScan,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const request: ScanRequest = {
      input: {
        type: 'repository',
        url: repositoryUrl.trim(),
        ref: repositoryRef.trim(),
      },
      options: buildScanOptions(options),
    }

    scanMutation.mutate(request)
  }

  function updateOption(key: keyof ScanOptionState, checked: boolean) {
    setOptions((currentOptions) => ({
      ...currentOptions,
      [key]: checked,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository scan</CardTitle>
        <CardDescription>
          Submit a GitHub repository URL to the async Provenant scan endpoint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
            <div className="space-y-2">
              <Label htmlFor="repository-url">Repository URL</Label>
              <Input
                id="repository-url"
                type="url"
                required
                placeholder="https://github.com/owner/repository.git"
                value={repositoryUrl}
                onChange={(event) => setRepositoryUrl(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repository-ref">Ref</Label>
              <Input
                id="repository-ref"
                required
                placeholder="main"
                value={repositoryRef}
                onChange={(event) => setRepositoryRef(event.target.value)}
              />
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Scan options</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {optionLabels.map((option) => (
                <Label
                  key={option.key}
                  className="items-start gap-3 rounded-lg border bg-background p-3"
                >
                  <Checkbox
                    checked={options[option.key]}
                    onCheckedChange={(checked) =>
                      updateOption(option.key, checked === true)
                    }
                  />
                  <span className="grid gap-1">
                    <span>{option.label}</span>
                    <span className="text-sm leading-5 font-normal text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </Label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="submit"
              size="lg"
              disabled={
                scanMutation.isPending ||
                repositoryUrl.trim() === '' ||
                repositoryRef.trim() === ''
              }
            >
              {scanMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
              Submit async scan
            </Button>

            {scanMutation.data ? (
              <Badge variant="outline">State: {scanMutation.data.state}</Badge>
            ) : null}
          </div>
        </form>

        {scanMutation.error ? (
          <Alert className="mt-6" variant="destructive">
            <AlertTitle>Scan submission failed</AlertTitle>
            <AlertDescription>
              {getErrorMessage(scanMutation.error)}
            </AlertDescription>
          </Alert>
        ) : null}

        {scanMutation.data ? (
          <div className="mt-6 space-y-6">
            <Alert>
              <AlertTitle>Scan accepted</AlertTitle>
              <AlertDescription>
                Job <code>{scanMutation.data.job_id}</code> was accepted with
                state <code>{scanMutation.data.state}</code>.
              </AlertDescription>
            </Alert>

            <JobStatus jobId={scanMutation.data.job_id} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function buildScanOptions(options: ScanOptionState): ScanOptions {
  return {
    ...(options.detectLicense
      ? { detect_license: { type: 'embedded' as const } }
      : {}),
    detect_packages: options.detectPackages,
    detect_copyrights: options.detectCopyrights,
    detect_emails: options.detectEmails,
    detect_urls: options.detectUrls,
  }
}
