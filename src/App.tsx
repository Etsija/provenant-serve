import { HealthPanel } from '@/components/HealthPanel'
import { ScanForm } from '@/components/ScanForm'

export function App() {
  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <section className="rounded-3xl border bg-card p-8 text-card-foreground shadow-xl shadow-foreground/5">
          <p className="mb-3 text-xs font-bold tracking-[0.12em] text-primary uppercase">
            Provenant Serve
          </p>
          <h1 className="text-4xl leading-none font-bold tracking-tight sm:text-5xl">
            Scan GitHub repositories over HTTP
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            This front-end provides a minimal UI for submitting repository scans
            to a locally running{' '}
            <code className="rounded-md bg-muted px-1.5 py-0.5 text-foreground">
              provenant serve
            </code>{' '}
            backend.
          </p>
        </section>

        <HealthPanel />
        <ScanForm />
      </div>
    </main>
  )
}
