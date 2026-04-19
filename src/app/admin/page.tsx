import {
  AppShell,
  DataTable,
  KpiCard,
  Panel,
  StatusPill,
} from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/mock-terminal-data'

export default function AdminOverviewPage() {
  return (
    <AppShell
      section="admin"
      nav={adminNav}
      title="Admin Overview"
      subtitle="Operational control center for users, assignments, research, meetings, and platform health"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Users" value="284" delta="+12 this week" />
        <KpiCard label="Assignments Due Soon" value="41" delta="18 within 24h" />
        <KpiCard label="Awaiting Review" value="26" delta="+4 vs yesterday" />
        <KpiCard label="Failed Syncs" value="2" delta="Data jobs" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Meeting Link Health" description="Recurring session status">
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2"><span>Monday</span><StatusPill label="Configured" /></div>
            <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2"><span>Wednesday</span><StatusPill label="Configured" /></div>
            <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2"><span>Friday</span><StatusPill label="Missing" /></div>
          </div>
        </Panel>

        <Panel title="Recent Research" description="Most recent research publication events">
          <DataTable
            columns={['Research', 'Analyst', 'Status', 'Time']}
            rows={[
              ['AI Infrastructure Capex', 'M. Tran', <StatusPill key="s1" label="Published" />, '1h ago'],
              ['Managed Care Revision Risk', 'A. Patel', <StatusPill key="s2" label="Under Review" />, '3h ago'],
              ['Yield Vehicle Cost of Capital', 'S. Carter', <StatusPill key="s3" label="Published" />, '1d ago'],
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  )
}
