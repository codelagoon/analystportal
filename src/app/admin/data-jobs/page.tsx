import { AppShell, Panel } from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'

export default function AdminDataJobsPage() {
  return (
    <AppShell section="admin" nav={adminNav} title="Data Jobs" subtitle="Sync pipeline execution and failure diagnostics">
      <Panel title="Job Runs" description="Recent job health">
        <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-400">
          Data-jobs telemetry is not configured yet. Connect a jobs source to display run status, duration, and retry actions.
        </div>
      </Panel>
    </AppShell>
  )
}
