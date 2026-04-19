import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ActivityFeed,
  AppShell,
  ChartContainer,
  ComparisonChart,
  KpiCard,
  Panel,
  StatusPill,
  TableToolbar,
} from '@/components/terminal/ui-kit'
import { sidebarNav } from '@/lib/navigation'

const sectorProfiles: Record<string, {
  title: string
  subtitle: string
  returnYtd: string
  revision: string
  multiple: string
  coverage: string
  trend: number[]
  breadth: { label: string; value: number; display: string; meta: string }[]
  movers: { ticker: string; change: string }[]
  comps: { ticker: string; multiple: string }[]
}> = {
  semiconductors: {
    title: 'Semiconductors',
    subtitle: 'Coverage universe, movers, comps, and research signal',
    returnYtd: '+28.4%',
    revision: '+2.1% vs SPX',
    multiple: '21.4x',
    coverage: '34',
    trend: [18, 21, 19, 24, 28, 26, 31, 29, 34],
    breadth: [
      { label: 'Advanced', value: 62, display: '62%', meta: 'Advancers vs decliners' },
      { label: 'Flat', value: 8, display: '8%', meta: 'Quiet names' },
      { label: 'Under Pressure', value: -30, display: '30%', meta: 'Names still below trend' },
    ],
    movers: [
      { ticker: 'NVDA', change: '+3.4%' },
      { ticker: 'AMD', change: '+2.5%' },
      { ticker: 'MRVL', change: '+2.1%' },
      { ticker: 'ON', change: '-1.4%' },
    ],
    comps: [
      { ticker: 'NVDA', multiple: '36.8x' },
      { ticker: 'AMD', multiple: '31.2x' },
      { ticker: 'AVGO', multiple: '27.8x' },
    ],
  },
  software: {
    title: 'Software',
    subtitle: 'Revision momentum, pricing power, and workflow intensity',
    returnYtd: '+19.7%',
    revision: '+1.5% vs SPX',
    multiple: '24.2x',
    coverage: '41',
    trend: [12, 13, 14, 15, 16, 17, 18, 20, 21],
    breadth: [
      { label: 'Advanced', value: 54, display: '54%', meta: 'SaaS breadth remains constructive' },
      { label: 'Flat', value: 11, display: '11%', meta: 'Mixed revision changes' },
      { label: 'Under Pressure', value: -35, display: '35%', meta: 'Higher beta names still lag' },
    ],
    movers: [
      { ticker: 'NOW', change: '+2.8%' },
      { ticker: 'CRM', change: '+1.9%' },
      { ticker: 'ADBE', change: '+1.6%' },
      { ticker: 'SNOW', change: '-1.2%' },
    ],
    comps: [
      { ticker: 'NOW', multiple: '24.2x' },
      { ticker: 'CRM', multiple: '22.1x' },
      { ticker: 'ADBE', multiple: '20.4x' },
    ],
  },
}

export function getSectorProfile(sector: string) {
  return sectorProfiles[sector.toLowerCase()] ?? null
}

export default async function SectorDashboardPage({
  params,
}: {
  params: Promise<{ sector: string }>
}) {
  const { sector } = await params
  const profile = getSectorProfile(sector)
  if (!profile) {
    notFound()
  }

  return (
    <AppShell
      nav={sidebarNav}
      title={`Sector Research: ${profile.title}`}
      subtitle="Use this page to see whether the whole group is improving or weakening before you open a single company."
      rightRail={
        <Panel title="Top Analysts" description="Trailing 90-day scorecard">
          <div className="space-y-2 text-sm text-zinc-200">
            <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2"><span>M. Tran</span><StatusPill label="Quality 9.1" /></div>
            <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2"><span>A. Patel</span><StatusPill label="Quality 8.6" /></div>
            <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2"><span>K. Price</span><StatusPill label="Quality 8.2" /></div>
          </div>
        </Panel>
      }
    >
      <TableToolbar />

      <Panel title="How to use this sector page" description="Start with breadth, then check the movers, then open a company if something stands out.">
        <div className="flex flex-wrap gap-2 text-sm text-zinc-300">
          <StatusPill label="Breadth first" />
          <StatusPill label="Then movers" />
          <StatusPill label="Then comps" />
        </div>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Sector Return (YTD)" value={profile.returnYtd} delta={profile.revision} />
        <KpiCard label="Median Rev Growth" value="17.1%" delta="+0.9%" />
        <KpiCard label="Median EV/EBITDA" value={profile.multiple} delta="-0.3x" />
        <KpiCard label="Coverage Count" value={profile.coverage} delta="+2 this quarter" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Sector overview" description="Broad performance, breadth, and whether the group is leading or lagging." className="xl:col-span-2">
          <ChartContainer title="Performance Trend" points={profile.trend} />
          <div className="mt-4">
            <ComparisonChart title="Breadth Distribution" items={profile.breadth} />
          </div>
        </Panel>
        <Panel title="Top movers" description="The names moving most today. Open one if you need a company view.">
          <div className="space-y-2 text-sm">
            {profile.movers.map((item) => (
              <Link key={item.ticker} href={`/terminal/company/${item.ticker}`} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-zinc-200 transition hover:border-white/12 hover:bg-white/[0.035]">
                <span>{item.ticker}</span>
                <span className={item.change.startsWith('+') ? 'text-emerald-300' : 'text-rose-300'}>{item.change}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Comps table" description="Open any comp to compare the company against the group leader.">
          <div className="space-y-2 text-sm">
            {profile.comps.map((row) => (
              <Link key={row.ticker} href={`/terminal/company/${row.ticker}`} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-zinc-200 transition hover:border-white/12 hover:bg-white/[0.035]">
                <span>{row.ticker}</span>
                <span>{row.multiple}</span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Latest research and notes" description="The most recent internal items tied to this sector.">
          <ActivityFeed
            items={[
              { actor: 'Research', action: 'published AI Infrastructure Capex research note', time: '4h ago' },
              { actor: 'Desk', action: 'flagged inventory datapoint divergence', time: '6h ago' },
              { actor: 'Ops', action: 'updated sector coverage universe', time: '1d ago' },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  )
}
