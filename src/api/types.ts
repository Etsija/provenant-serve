export type ProvenantHealthStatus = {
  status: string
}

export type ProvenantReadyStatus = {
  status: string
  api_version?: string
  [key: string]: unknown
}

export type ProvenantVersion = {
  service: string
  api_version: string
  tool_version: string
}

export type ScanInput =
  | {
      type: 'repository'
      url: string
      ref?: string
    }
  | {
      type: 'url'
      url: string
    }
  | {
      type: 'paths'
      paths: string[]
    }
  | {
      type: 'upload'
      filename: string
      content_base64: string
    }

export type LicenseDetectionOption =
  | {
      type: 'embedded'
    }
  | boolean

export type ScanOptions = {
  collect_info?: boolean
  detect_license?: LicenseDetectionOption
  detect_packages?: boolean
  detect_system_packages?: boolean
  detect_packages_in_compiled?: boolean
  detect_copyrights?: boolean
  detect_emails?: boolean
  detect_urls?: boolean
  detect_generated?: boolean
  include?: string[]
  exclude?: string[]
  strip_root?: boolean
  full_root?: boolean
  license_text?: boolean
  license_text_diagnostics?: boolean
  license_diagnostics?: boolean
  unknown_licenses?: boolean
  license_score?: number
  only_findings?: boolean
  mark_source?: boolean
  classify?: boolean
  summary?: boolean
  license_clarity_score?: boolean
  license_references?: boolean
  tallies?: boolean
  tallies_key_files?: boolean
  tallies_with_details?: boolean
  facets?: boolean
  tallies_by_facet?: boolean
}

export type ScanRequest = {
  input: ScanInput
  options?: ScanOptions
}

export type AsyncScanAccepted = {
  status: 'accepted'
  job_id: string
  state: ScanJobState
  status_url: string
  result_url: string
}

export type ScanJobState =
  | 'pending'
  | 'running'
  | 'succeeded'
  | 'failed'
  | string

export type ScanJobStatus = {
  job_id: string
  state: ScanJobState
  result_ready: boolean
  allocated_processors?: number
  [key: string]: unknown
}

export type ScanResult = Record<string, unknown>
