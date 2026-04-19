import { AppShell, DataTable, Panel, StatusPill, TableToolbar } from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminCompaniesPage() {
  const assignments = await prisma.assignment.findMany({
    where: {
      company: {
        not: null,
      },
    },
    select: {
      company: true,
      sector: true,
    },
  })

  const companyMap = new Map<string, { sector: string; count: number }>()
  for (const assignment of assignments) {
    const company = assignment.company?.trim()
    if (!company) {
      continue
    }

    const current = companyMap.get(company) ?? { sector: assignment.sector?.trim() || '-', count: 0 }
    current.count += 1
    if (current.sector === '-' && assignment.sector?.trim()) {
      current.sector = assignment.sector.trim()
    }
    companyMap.set(company, current)
  }

  const companyRows = Array.from(companyMap.entries()).sort((a, b) => b[1].count - a[1].count)

  return (
    <AppShell section="admin" nav={adminNav} title="Companies" subtitle="Tracked universe, sector assignment controls, featured markers, refresh actions">
      <TableToolbar />
      <Panel title="Tracked Companies" description="Editable metadata and curation controls">
        <DataTable
          columns={['Ticker', 'Company', 'Sector', 'Featured', 'Metadata', 'Actions']}
          rows={companyRows.map(([company, info]) => {
            const ticker = company.toUpperCase().split(' ')[0]
            return [
              ticker,
              company,
              info.sector,
              <StatusPill key={company} label={info.count >= 2 ? 'Featured' : 'Standard'} />,
              `${info.count} linked assignments`,
              'View assignments',
            ]
          })}
        />
      </Panel>
    </AppShell>
  )
}
