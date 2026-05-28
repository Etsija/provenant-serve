import { Copyright, FileJson, Link, Mail, Package, Scale } from 'lucide-react'

import CopyrightCards from '@/components/scan-result/CopyrightCards'
import { FileTable } from '@/components/scan-result/FileTable'
import { FindingTable } from '@/components/scan-result/FindingTable'
import LicenseCards from '@/components/scan-result/LicenseCards'
import PackageCards from '@/components/scan-result/PackageCards'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type {
  ResultSummary,
  ScanCopyrightRow,
  ScanFileRow,
  ScanFindingRow,
  ScanLicenseRow,
  ScanPackageRow,
} from '@/helpers/scan-result'

type ResultAccordionsProps = {
  summary: ResultSummary
  copyrightRows: ScanCopyrightRow[]
  emailRows: ScanFindingRow[]
  fileRows: ScanFileRow[]
  licenseRows: ScanLicenseRow[]
  packageRows: ScanPackageRow[]
  urlRows: ScanFindingRow[]
}

type ResultAccordion = {
  key: string
  label: string
  count: number
  icon: React.ReactNode
}

export function ResultAccordions({
  summary,
  copyrightRows,
  emailRows,
  fileRows,
  licenseRows,
  packageRows,
  urlRows,
}: ResultAccordionsProps) {
  const accordions = getResultAccordions(summary)

  if (accordions.length === 0) {
    return null
  }

  return (
    <Accordion type="multiple" className="gap-3">
      {accordions.map((accordion) => (
        <AccordionItem
          key={accordion.key}
          value={accordion.key}
          className="bg-background rounded-lg border px-4"
        >
          <AccordionTrigger className="py-4 hover:no-underline">
            <span className="flex w-full items-center gap-3 pr-4">
              {accordion.icon}
              <span>{accordion.label}</span>
              <span className="ml-auto font-semibold">{accordion.count}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {accordion.key === 'packages' ? (
              <PackageCards rows={packageRows} />
            ) : accordion.key === 'files' ? (
              <FileTable rows={fileRows} />
            ) : accordion.key === 'licenses' ? (
              <LicenseCards rows={licenseRows} />
            ) : accordion.key === 'copyrights' ? (
              <CopyrightCards rows={copyrightRows} />
            ) : accordion.key === 'urls' ? (
              <FindingTable label="URL" rows={urlRows} />
            ) : accordion.key === 'emails' ? (
              <FindingTable label="Email" rows={emailRows} />
            ) : (
              <p className="text-muted-foreground">Item list coming next.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
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
