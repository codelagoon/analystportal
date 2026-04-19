import { AppShell, DataTable, KpiCard, Panel, StatusPill } from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminAnalystsPage() {
  const [analysts, assignments] = await Promise.all([
    prisma.analystUser.findMany({ orderBy: { name: 'asc' } }),
    prisma.assignment.findMany({
      select: {
        reviewer: true,
        submissionUrl: true,
      },
    }),
  ])

  const coverageByReviewer = new Map<string, { coverage: number; published: number }>()
  for (const assignment of assignments) {
    const reviewer = assignment.reviewer?.trim()
    if (!reviewer) {
      continue
    }

    const current = coverageByReviewer.get(reviewer) ?? { coverage: 0, published: 0 }
    current.coverage += 1
    if (assignment.submissionUrl) {
      current.published += 1
    }
    coverageByReviewer.set(reviewer, current)
  }

  const activeAnalysts = analysts.filter((analyst) => analyst.status === 'Active').length
  const unassignedReviews = assignments.filter((assignment) => !assignment.reviewer || !assignment.reviewer.trim()).length

  return (
    <AppShell section="admin" nav={adminNav} title="Analysts" subtitle="Cohort distribution, quality markers, and coverage oversight">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Analysts" value={`${activeAnalysts}`} delta="Live" />
        <KpiCard label="Total Analysts" value={`${analysts.length}`} delta="Live" />
        <KpiCard label="Coverage Gaps" value={`${unassignedReviews}`} delta="Assignments without reviewer" />
        <KpiCard label="Flagged Reviews" value="n/a" delta="No quality scoring source" />
      </div>
      <Panel title="Analyst Coverage Table" description="Role, cohort, assignment coverage, and submission activity">
        <DataTable
          columns={['Analyst', 'Role', 'Cohort', 'Coverage Count', 'Published', 'Status']}
          rows={analysts.map((analyst) => {
            const stats = coverageByReviewer.get(analyst.name) ?? { coverage: 0, published: 0 }
            return [
              analyst.name,
              analyst.role,
              analyst.cohort,
              `${stats.coverage}`,
              `${stats.published}`,
              <StatusPill key={analyst.id} label={analyst.status} />,
            ]
          })}
        />
      </Panel>
    </AppShell>
  )
}
