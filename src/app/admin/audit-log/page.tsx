import { AppShell, DataTable, Panel, TableToolbar } from '@/components/terminal/ui-kit'
import { adminNav, auditEvents } from '@/lib/mock-terminal-data'

export default function AdminAuditLogPage() {
  return (
    <AppShell section="admin" nav={adminNav} title="Audit Log" subtitle="Filterable log for role, assignment, meeting, and content curation changes">
      <TableToolbar />
      <Panel title="Audit Events" description="Chronological platform activity">
        <DataTable
          columns={['Timestamp', 'Actor', 'Action', 'Resource', 'Detail']}
          rows={auditEvents.map((event) => [event.ts, event.actor, event.action, event.resource, event.detail])}
        />
      </Panel>
    </AppShell>
  )
}
