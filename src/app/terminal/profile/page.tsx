import {
  ActivityFeed,
  AppShell,
  ChartContainer,
  ComparisonChart,
  KpiCard,
  Panel,
  StatusPill,
} from '@/components/terminal/ui-kit'
import { sidebarNav } from '@/lib/mock-terminal-data'

export default function AnalystProfilePage() {
  return (
    <AppShell
      nav={sidebarNav}
      title="Analyst Profile"
      subtitle="Coverage footprint, quality signal, and research output"
      rightRail={
        <Panel title="Credibility Markers" description="Quality controls and consistency">
          <div className="space-y-2">
            <StatusPill label="Review SLA 97%" />
            <StatusPill label="Citation Completeness 94%" />
            <StatusPill label="Methodology Score 8.8" />
          </div>
        </Panel>
      }
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Published Research" value="27" delta="+4 this quarter" />
        <KpiCard label="Primary Sectors" value="2" delta="Semis, Software" />
        <KpiCard label="Coverage Companies" value="11" delta="+2 this semester" />
        <KpiCard label="Quality Score" value="8.7" delta="+0.4" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Sector Focus" description="Primary and secondary focus">
          <div className="space-y-2 text-sm text-zinc-200">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2">Semiconductors (Primary)</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2">Software Infrastructure (Secondary)</div>
          </div>
        </Panel>

        <Panel title="Published Research" description="Recent output">
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">AI Infrastructure Capex: Cycle Duration and Margin Structure</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Semiconductor Supply Elasticity Tracker</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Compute Demand under Lower Rate Regime</div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Research Output Trend" description="Research cadence by month">
          <ChartContainer title="Published Research" points={[4, 5, 6, 8, 7, 9, 10, 11, 12]} />
        </Panel>

        <Panel title="Coverage Mix" description="Company and sector concentration">
          <ComparisonChart
            title="Coverage Distribution"
            items={[
              { label: 'Semiconductors', value: 64, display: '64%', meta: 'Primary coverage weight' },
              { label: 'Software', value: 36, display: '36%', meta: 'Secondary coverage weight' },
            ]}
          />
        </Panel>
      </div>

      <Panel title="Recent Activity" description="Execution and workflow history">
        <ActivityFeed
          items={[
            { actor: 'You', action: 'submitted Quarterly Model Refresh: NVDA', time: '22m ago' },
            { actor: 'Reviewer', action: 'requested revisions on managed care research note', time: '4h ago' },
            { actor: 'You', action: 'added catalyst note to coverage tracker', time: '1d ago' },
          ]}
        />
      </Panel>
    </AppShell>
  )
}
