import { AppShell, DataTable, Panel, StatusPill } from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminSectorsPage() {
  const assignments = await prisma.assignment.findMany({
    where: {
      sector: {
        not: null,
      },
    },
    select: {
      sector: true,
      reviewer: true,
    },
  })

  const sectorMap = new Map<string, { count: number; reviewerCounts: Map<string, number> }>()
  for (const assignment of assignments) {
    const sector = assignment.sector?.trim()
    if (!sector) {
      continue
    }

    const current = sectorMap.get(sector) ?? { count: 0, reviewerCounts: new Map<string, number>() }
    current.count += 1

    const reviewer = assignment.reviewer?.trim()
    if (reviewer) {
      current.reviewerCounts.set(reviewer, (current.reviewerCounts.get(reviewer) ?? 0) + 1)
    }

    sectorMap.set(sector, current)
  }

  const sectorRows = Array.from(sectorMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([sector, info]) => {
      let leadAnalyst = 'Unassigned'
      let leadCount = 0
      for (const [reviewer, count] of info.reviewerCounts.entries()) {
        if (count > leadCount) {
          leadCount = count
          leadAnalyst = reviewer
        }
      }

      return [
        sector,
        leadAnalyst,
        `${info.count}`,
        <StatusPill key={sector} label={leadAnalyst === 'Unassigned' ? 'Needs Owner' : 'Active'} />,
      ]
    })

  return (
    <AppShell section="admin" nav={adminNav} title="Sectors" subtitle="Universe-level sector management and analyst ownership">
      <Panel title="Sector Registry" description="Coverage ownership, active status, and counts">
        <DataTable
          columns={['Sector', 'Lead Analyst', 'Companies', 'Status']}
          rows={sectorRows}
        />
      </Panel>
    </AppShell>
  )
}
