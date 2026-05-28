import type { ScanResult } from '@/api/types'

export type ResultSummary = {
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

export type ScanFindingRow = {
  value: string
  file: string
  lines: string
}

export type ScanFileRow = {
  file: string
  sha1: string
}

export type ScanPackageRow = {
  id: string
  sourceFile: string
  type: string
  name: string
  version: string
  namespace: string
  purl: string
  declaredLicense: string
  description: string
  dependenciesCount: number
}

export type ScanCopyrightRow = {
  id: string
  statement: string
  file: string
  lines: string
  holders: string[]
  authors: string[]
  years: string[]
}

export function summarizeResult(result: ScanResult): ResultSummary {
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

export function getPackageRows(result: ScanResult): ScanPackageRow[] {
  const topLevelPackages = getArray(result, 'packages')
  const packageRows = topLevelPackages
    ? topLevelPackages.flatMap((packageRecord, index) =>
        buildPackageRow(packageRecord, 'Top-level package', index),
      )
    : []

  const files = getArray(result, 'files')
  if (!files) {
    return packageRows
  }

  for (const file of files) {
    if (!file || typeof file !== 'object') {
      continue
    }

    const fileRecord = file as Record<string, unknown>
    const sourceFile = getString(fileRecord, 'path') ?? 'Unknown'
    const packageData = getArray(fileRecord, 'package_data')

    for (const [index, packageRecord] of (packageData ?? []).entries()) {
      packageRows.push(...buildPackageRow(packageRecord, sourceFile, index))
    }
  }

  return packageRows
}

export function getCopyrightRows(result: ScanResult): ScanCopyrightRow[] {
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
    const copyrights = getArray(fileRecord, 'copyrights')

    if (!copyrights) {
      return []
    }

    return copyrights.flatMap((copyright, index) => {
      if (!copyright || typeof copyright !== 'object') {
        return []
      }

      const copyrightRecord = copyright as Record<string, unknown>
      const statement =
        getString(copyrightRecord, 'copyright') ??
        getString(copyrightRecord, 'statement') ??
        getString(copyrightRecord, 'value')

      if (!statement) {
        return []
      }

      return [
        {
          id: `${path}:${index}:${statement}`,
          statement,
          file: path,
          lines: formatLineRange(
            getNumber(copyrightRecord, 'start_line'),
            getNumber(copyrightRecord, 'end_line'),
          ),
          holders: getStringArray(copyrightRecord, 'holders'),
          authors: getStringArray(copyrightRecord, 'authors'),
          years: getStringArray(copyrightRecord, 'years'),
        },
      ]
    })
  })
}

export function getFileRows(result: ScanResult): ScanFileRow[] {
  const files = getArray(result, 'files')

  if (!files) {
    return []
  }

  return files.flatMap((file) => {
    if (!file || typeof file !== 'object') {
      return []
    }

    const fileRecord = file as Record<string, unknown>
    const path = getString(fileRecord, 'path')

    if (!path) {
      return []
    }

    return [
      {
        file: path,
        sha1: getString(fileRecord, 'sha1') ?? 'Unknown',
      },
    ]
  })
}

export function getNestedFindingRows(
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

function buildPackageRow(
  packageRecord: unknown,
  sourceFile: string,
  index: number,
): ScanPackageRow[] {
  if (!packageRecord || typeof packageRecord !== 'object') {
    return []
  }

  const record = packageRecord as Record<string, unknown>
  const dependencies = getArray(record, 'dependencies')

  return [
    {
      id: `${sourceFile}:${index}:${getString(record, 'purl') ?? getString(record, 'name') ?? 'package'}`,
      sourceFile,
      type: getString(record, 'type') ?? 'Unknown',
      name: getString(record, 'name') ?? 'Unknown',
      version: getString(record, 'version') ?? 'Unknown',
      namespace: getString(record, 'namespace') ?? 'Unknown',
      purl: getString(record, 'purl') ?? 'Unknown',
      declaredLicense:
        getString(record, 'declared_license_expression') ??
        getString(record, 'declared_license') ??
        'Unknown',
      description: getString(record, 'description') ?? 'Unknown',
      dependenciesCount: dependencies?.length ?? 0,
    },
  ]
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

function getStringArray(
  record: Record<string, unknown>,
  key: string,
): string[] {
  const value = getArray(record, key)

  if (!value) {
    return []
  }

  return value.flatMap((item) => (typeof item === 'string' ? [item] : []))
}
