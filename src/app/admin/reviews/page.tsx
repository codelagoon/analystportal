import { AppShell, DataTable, Panel, StatusPill } from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'
import { prisma } from '@/lib/prisma'

function formatAge(date: Date) {
  const elapsedMs = Date.now() - date.getTime()
  const elapsedHours = Math.max(1, Math.floor(elapsedMs / (1000 * 60 * 60)))
  if (elapsedHours < 24) {
    return `${elapsedHours}h`
  }
  return `${Math.floor(elapsedHours / 24)}d`
}

export default async function AdminReviewsPage() {
  const now = new Date()
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const reviewQueue = await prisma.assignment.findMany({
    where: {
      submissionUrl: {
        not: null,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 20,
  })

  return (
    <AppShell section="admin" nav={adminNav} title="Reviews" subtitle="Review queue and SLA visibility">
      <Panel title="Review Queue" description="Submissions awaiting reviewer action">
        <DataTable
          columns={['Submission', 'Reviewer', 'Age', 'Priority', 'Status']}
          rows={reviewQueue.map((assignment) => [
            assignment.title,
            assignment.reviewer ?? 'Unassigned',
            formatAge(assignment.updatedAt),
            assignment.dueDate && assignment.dueDate <= soon ? 'High' : 'Normal',
            <StatusPill key={assignment.id} label={assignment.feedback ? 'Reviewed' : 'Awaiting Review'} />,
          ])}
        />
      </Panel>
    </AppShell>
  )
}
