import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a1f2e] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background gradient accents */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
          <div className="space-y-6">
            <div className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                Institutional Research Platform
              </p>
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
              Echelon Analyst Portal
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-zinc-300 sm:text-xl">
              Coverage discipline, assignment accountability, review rigor, and consistent execution cadence. All in one platform.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <Link href="/terminal">
                <Button className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-blue-500/50 hover:shadow-2xl">
                  Open the terminal
                </Button>
              </Link>
              <Link href="/admin">
                <button className="h-12 rounded-lg border border-zinc-700 bg-zinc-900/50 px-8 text-base font-semibold text-white transition hover:border-zinc-600 hover:bg-zinc-800/50">
                  Admin Center
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
