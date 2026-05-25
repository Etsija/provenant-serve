export function App() {
  return (
    <main className="grid min-h-screen place-items-center px-8 py-12">
      <section className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/10">
        <p className="mb-3 text-xs font-bold tracking-[0.12em] text-blue-700 uppercase">
          Provenant Serve
        </p>
        <h1 className="text-4xl leading-none font-bold tracking-tight text-slate-950 sm:text-5xl">
          Scan GitHub repositories over HTTP
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          This front-end will provide a minimal UI for submitting repository
          scans to a locally running{' '}
          <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-800">
            provenant serve
          </code>{' '}
          backend.
        </p>
      </section>
    </main>
  )
}
