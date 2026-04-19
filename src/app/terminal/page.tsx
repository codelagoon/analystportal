import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ActivityFeed,
  AppShell,
  ChartContainer,
  ComparisonChart,
  KpiCard,
  MiniStat,
  Panel,
  SearchResultDropdown,
  StatusPill,
} from '@/components/terminal/ui-kit'
import { sidebarNav } from '@/lib/navigation'
import { getFinancialQuotes, getSectorPerformance } from '@/lib/financial-data'
import { getHomepageContent } from '@/lib/homepage-content'
import { prisma } from '@/lib/prisma'

// Cache this page for 60 seconds to reduce database load
export const revalidate = 60

function toDisplayMeetingDay(day: 'MONDAY' | 'WEDNESDAY' | 'FRIDAY') {
  if (day === 'MONDAY') return 'Monday'
  if (day === 'WEDNESDAY') return 'Wednesday'
  return 'Friday'
}

function formatDueDate(value: Date | null) {
  if (!value) return 'No due date set'
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default async function TerminalDashboardPage() {
  const [assignments, recurringMeetings, homepageContent, quotes, sectorPerformanceData] = await Promise.all([
    prisma.assignment.findMany({
      select: {
        id: true,
        title: true,
        dueDate: true,
        meetingDay: true,
        updatedAt: true,
        reviewer: true,
        sector: true,
        recurringMeeting: {
          select: { zoomJoinUrl: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      take: 6,
    }),
    prisma.recurringMeeting.findMany({
      select: {
        id: true,
        dayOfWeek: true,
        active: true,
        scheduledTime: true,
        zoomJoinUrl: true,
        updatedAt: true,
        _count: { select: { assignments: true } },
      },
      orderBy: { dayOfWeek: 'asc' },
    }),
    getHomepageContent(),
    getFinancialQuotes(['SPY', 'QQQ', 'DIA', 'VXX']),
    getSectorPerformance(),
  ])

  const nextMeeting =
    recurringMeetings.find((meeting) => meeting.active && meeting.dayOfWeek === 'WEDNESDAY') ??
    recurringMeetings.find((meeting) => meeting.active) ??
    recurringMeetings[0] ??
    null

  const marketSnapshot = [
    { label: 'S&P 500', quote: quotes[0] },
    { label: 'Nasdaq 100', quote: quotes[1] },
    { label: 'Dow Jones', quote: quotes[2] },
    { label: 'Volatility', quote: quotes[3] },
  ].map((entry) => ({
    label: entry.label,
    value: entry.quote ? entry.quote.price.toFixed(2) : '--',
    change:
      entry.quote?.changePercent !== undefined
        ? `${entry.quote.changePercent >= 0 ? '+' : ''}${entry.quote.changePercent.toFixed(2)}%`
        : 'n/a',
  }))

  const quoteChanges = quotes
    .map((quote) => quote?.changePercent)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  const advancers = quoteChanges.filter((value) => value >= 0).length
  const decliners = quoteChanges.filter((value) => value < 0).length
  const totalMoves = Math.max(quoteChanges.length, 1)
  const flat = Math.max(0, 4 - quoteChanges.length)
  const trendPoints = [50, 52, 54, 53, 56, 55, 57, 58, 60].map((base, index) => {
    const signal = quoteChanges[index % totalMoves] ?? 0
    return Math.round(base + signal * 2)
  })

  const featuredResearch = homepageContent.featuredResearch

  const recentActivity = [
    ...assignments.slice(0, 3).map((assignment) => ({
      actor: assignment.reviewer || 'Reviewer',
      action: `updated assignment ${assignment.title}`,
      time: assignment.updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    })),
    ...recurringMeetings.slice(0, 2).map((meeting) => ({
      actor: 'Admin',
      action: `updated ${toDisplayMeetingDay(meeting.dayOfWeek)} recurring meeting`,
      time: meeting.updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    })),
  ].slice(0, 4)

  return (
    <AppShell
      nav={sidebarNav}
      title="Market Command Center"
      subtitle="Start here: open your current assignment, check the next meeting, then use search to jump to companies, sectors, or assignments."
      rightRail={
        <>
          <Panel title="Current assignments" description="These are the items to open first.">
            <div className="space-y-2">
              {assignments.length === 0 && (
                <p className="rounded-md border border-zinc-800 bg-zinc-900/80 p-2.5 text-xs text-zinc-500">
                  No assignments found yet.
                </p>
              )}
              {assignments.map((assignment) => (
                <Link key={assignment.id} href={`/assignments/${assignment.id}`} className="block rounded-md border border-zinc-800 bg-zinc-900/80 p-2.5 transition hover:border-white/12 hover:bg-white/[0.035]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-zinc-100">{assignment.title}</p>
                    <StatusPill label={assignment.dueDate ? 'Scheduled' : 'Assigned'} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Due {formatDueDate(assignment.dueDate)} • discussed in the {assignment.meetingDay ? toDisplayMeetingDay(assignment.meetingDay) : 'Unscheduled'} session
                  </p>
                </Link>
              ))}
            </div>
          </Panel>
          <SearchResultDropdown />
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Start here" description="A first-time analyst should begin with this simple sequence.">
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">1. Open your current assignment and check the due date.</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">2. Review the next recurring meeting and join the correct session.</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">3. Use search to jump to a company, sector, or assignment.</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/assignments">
              <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                Open assignments
              </Button>
            </Link>
            <Link href="/terminal/meetings">
              <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                View meetings calendar
              </Button>
            </Link>
            <Link href="/terminal/company/NVDA">
              <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                Open company research
              </Button>
            </Link>
          </div>
        </Panel>

        <Panel title="Next meeting" description="The next recurring weekly review session and how it fits your work.">
          {nextMeeting ? (
            <div className="grid gap-2 md:grid-cols-3">
              <MiniStat label="Session" value={`${toDisplayMeetingDay(nextMeeting.dayOfWeek)} • ${nextMeeting.scheduledTime ?? 'Time not set'}`} />
              <MiniStat label="Join link" value={nextMeeting.zoomJoinUrl ? 'Configured' : 'Missing'} />
              <MiniStat label="Linked work" value={`${nextMeeting._count.assignments} assignments`} />
            </div>
          ) : (
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-400">No recurring meetings configured.</div>
          )}
          <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-300">
            Use this session to review assignments, ask questions, and hear feedback on the work you submitted.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/terminal/meetings">
              <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                Join next meeting
              </Button>
            </Link>
            <Link href={assignments[0] ? `/assignments/${assignments[0].id}` : '/assignments'}>
              <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                Open a live assignment
              </Button>
            </Link>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {marketSnapshot.map((item) => (
          <KpiCard key={item.label} label={item.label} value={item.value} delta={item.change} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Major Indices and Breadth" description="Intraday structure and dispersion">
          <ChartContainer title="Index Momentum" points={trendPoints} />
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <MiniStat label="Advancers" value={`${Math.round((advancers / totalMoves) * 100)}%`} />
            <MiniStat label="Decliners" value={`${Math.round((decliners / totalMoves) * 100)}%`} />
            <MiniStat label="Flat" value={`${Math.round((flat / 4) * 100)}%`} />
          </div>
        </Panel>

        <Panel title="Sector Performance" description="Relative move vs S&P 500">
          <ComparisonChart
            title="Relative Performance"
            items={sectorPerformanceData.map((sector) => ({
              label: sector.sector,
              value: sector.relativePerformance,
              display: `${sector.relativePerformance > 0 ? '+' : ''}${sector.relativePerformance.toFixed(2)}%`,
              meta: `${sector.symbol} • ${sector.changePercent > 0 ? '+' : ''}${sector.changePercent.toFixed(2)}%`,
            }))}
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Featured research"
          description="Recent research notes, review status, and what changed most recently."
          actions={
            <Link href="/terminal/company/NVDA" className="inline-flex">
              <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                Open company research
              </Button>
            </Link>
          }
        >
          <div className="space-y-2">
            {featuredResearch.map((item) => (
              <div key={item} className="rounded-md border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-zinc-100">{item}</p>
                  <StatusPill label="Featured" />
                </div>
                <p className="mt-1 text-xs text-zinc-500">Homepage feature</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent feedback and activity" description="Review comments and analyst updates that matter right now.">
          <ActivityFeed items={recentActivity.length > 0 ? recentActivity : [{ actor: 'System', action: 'No recent activity yet', time: 'n/a' }]} />
        </Panel>
      </div>

    </AppShell>
  )
}
