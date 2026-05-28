import { HealthPanel } from '@/components/HealthPanel'
import { JobStatus } from '@/components/JobStatus'
import { ScanForm } from '@/components/ScanForm'
import ScanResultViewer from '@/components/ScanResultViewer'
import { useScanStore } from '@/stores/scan-store'

export function App() {
  const jobId = useScanStore((state) => state.jobId)
  const scanResult = useScanStore((state) => state.scanResult)
  const acceptJob = useScanStore((state) => state.acceptJob)
  const setScanResult = useScanStore((state) => state.setScanResult)

  return (
    <main className="bg-muted/30 min-h-screen px-6 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <section className="bg-card text-card-foreground shadow-foreground/5 rounded-3xl border p-8 shadow-xl">
          <p className="mb-3 text-xs font-bold tracking-[0.12em] text-orange-500 uppercase">
            Provenant Serve
          </p>
          <h1 className="text-3xl leading-none tracking-tight uppercase">
            Scan GitHub repositories over HTTP
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl leading-8">
            This front-end provides a minimal UI for submitting repository scans
            to a locally running{' '}
            <code className="bg-muted text-foreground rounded-md px-1.5 py-0.5">
              provenant serve
            </code>{' '}
            backend.
          </p>
        </section>

        <HealthPanel />
        <ScanForm onJobAccepted={acceptJob} />
        {jobId ? (
          <JobStatus jobId={jobId} onResultFetched={setScanResult} />
        ) : null}
        {scanResult ? <ScanResultViewer result={scanResult} /> : null}
      </div>
    </main>
  )
}
