import type {
  AsyncScanAccepted,
  ProvenantHealthStatus,
  ProvenantReadyStatus,
  ProvenantVersion,
  ScanJobStatus,
  ScanRequest,
  ScanResult,
} from './types'

const API_BASE_URL = '/api'

export class ProvenantApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseBody: unknown,
  ) {
    super(message)
    this.name = 'ProvenantApiError'
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })

  const responseBody = await parseResponseBody(response)

  if (!response.ok) {
    throw new ProvenantApiError(
      `Provenant API request failed with status ${response.status}`,
      response.status,
      responseBody,
    )
  }

  return responseBody as T
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()

  if (text.length === 0) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export function getLivez() {
  return requestJson<ProvenantHealthStatus>('/livez')
}

export function getReadyz() {
  return requestJson<ProvenantReadyStatus>('/readyz')
}

export function getVersion() {
  return requestJson<ProvenantVersion>('/version')
}

export function submitAsyncScan(scanRequest: ScanRequest) {
  return requestJson<AsyncScanAccepted>('/v1/scans:async', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(scanRequest),
  })
}

export function getJob(jobId: string) {
  return requestJson<ScanJobStatus>(`/v1/jobs/${encodeURIComponent(jobId)}`)
}

export function getJobResult(jobId: string) {
  return requestJson<ScanResult>(`/v1/jobs/${encodeURIComponent(jobId)}/result`)
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ProvenantApiError) {
    return formatApiError(error)
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

function formatApiError(error: ProvenantApiError) {
  const bodyMessage = extractResponseMessage(error.responseBody)

  if (bodyMessage) {
    return `${error.message}: ${bodyMessage}`
  }

  return error.message
}

function extractResponseMessage(responseBody: unknown): string | undefined {
  if (typeof responseBody === 'string') {
    return responseBody
  }

  if (!responseBody || typeof responseBody !== 'object') {
    return undefined
  }

  const record = responseBody as Record<string, unknown>
  const message = record.message ?? record.error ?? record.detail

  if (typeof message === 'string') {
    return message
  }

  return JSON.stringify(responseBody)
}
