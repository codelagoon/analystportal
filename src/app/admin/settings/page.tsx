import { AppShell, Panel } from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'

export default function AdminSettingsPage() {
  return (
    <AppShell section="admin" nav={adminNav} title="Settings" subtitle="System defaults, policy controls, and operational safeguards">
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Platform Policy" description="Submission and review guardrails">
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Late submission penalty thresholds</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Review SLA windows</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Publish permission matrix</div>
          </div>
        </Panel>

        <Panel title="Security and Access" description="Role defaults and session controls">
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Default role mappings</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">2FA requirement toggle surface</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Session timeout policy surface</div>
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
