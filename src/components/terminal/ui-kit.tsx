'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  Menu,
  Search,
  XCircle,
} from 'lucide-react'
import { ReactNode, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ShellControls } from '@/components/terminal/shell-controls'

type NavItem = {
  href: string
  label: string
}

type ShellProps = {
  title: string
  subtitle?: string
  nav: NavItem[]
  quickActions?: string[]
  children: ReactNode
  rightRail?: ReactNode
  section?: 'terminal' | 'admin'
}

export function AppShell({
  title,
  subtitle,
  nav,
  quickActions,
  children,
  rightRail,
  section = 'terminal',
}: ShellProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#04070d_0%,#07101b_38%,#050911_100%)] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(53,92,153,0.16),transparent_30%),radial-gradient(circle_at_52%_0%,rgba(40,72,124,0.08),transparent_26%),radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.02),transparent_20%)]" />
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <aside
          className={cn(
            'hidden border-r border-white/5 bg-[#050913]/92 lg:flex lg:flex-col',
            collapsed ? 'w-[86px]' : 'w-[260px]'
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
            <div className="flex items-center gap-2">
              {!collapsed && (
                <div>
                  <p className="text-sm font-semibold tracking-wide">Echelon Terminal</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Workspace</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="rounded-md p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
              aria-label="Collapse sidebar"
            >
              <Menu className="size-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between rounded-[10px] border px-3 py-2 text-sm transition',
                    active
                      ? 'border-sky-400/18 bg-sky-400/8 text-zinc-50'
                      : 'border-transparent text-zinc-400 hover:border-white/8 hover:bg-white/4 hover:text-zinc-100'
                  )}
                >
                  <span className={cn(collapsed && 'hidden')}>{item.label}</span>
                  {!collapsed && (
                    <ChevronRight
                      className={cn(
                        'size-3 transition',
                        active ? 'text-sky-200' : 'text-zinc-600 group-hover:text-zinc-400'
                      )}
                    />
                  )}
                  {collapsed && <span className="text-xs">{item.label.slice(0, 2)}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/5 p-4">
            <p className={cn('text-xs text-zinc-500', collapsed && 'hidden')}>
              Command center latency
            </p>
            <div className={cn('mt-2 flex items-center gap-2 text-xs', collapsed && 'justify-center')}>
              <span className="size-2 rounded-full bg-emerald-400" />
              <span className={cn('text-zinc-300', collapsed && 'hidden')}>Realtime feed stable</span>
            </div>
          </div>
        </aside>

        <div className="grid grid-rows-[72px_1fr]">
          <header className="sticky top-0 z-20 border-b border-white/6 bg-[#050912]/92 px-4 backdrop-blur-md xl:px-6">
            <div className="flex h-full items-center justify-between gap-4">
              <ShellControls section={section} primaryActionLabel={quickActions?.[0]} />
            </div>
          </header>

          <div className={cn('grid h-full gap-4 p-4 xl:p-6', rightRail ? '2xl:grid-cols-[1fr_320px]' : '')}>
            <main className="space-y-4">
              <PageHeader title={title} subtitle={subtitle} />
              {children}
            </main>
            {rightRail && (
              <aside className="space-y-4 rounded-xl border border-white/6 bg-[#070d15]/60 p-4">
                {rightRail}
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-white/6 bg-[#070c14]/60 px-4 py-3">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-100 lg:text-[1.55rem]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
    </div>
  )
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('gap-4 border-white/6 bg-[#070c14]/70 py-4 text-zinc-100', className)}>
      <CardHeader className="px-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold tracking-wide text-zinc-100">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1 text-xs text-zinc-500">{description}</CardDescription>
            )}
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent className="px-4">{children}</CardContent>
    </Card>
  )
}

export function KpiCard({
  label,
  value,
  delta,
}: {
  label: string
  value: string
  delta?: string
}) {
  const positive = delta?.startsWith('+')
  return (
    <div className="rounded-lg border border-white/6 bg-[#070c14]/72 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-zinc-100">{value}</p>
      {delta && (
        <p className={cn('mt-1 text-xs', positive ? 'text-emerald-300' : 'text-rose-300')}>{delta}</p>
      )}
    </div>
  )
}

export function StatusPill({ label }: { label: string }) {
  const tone = useMemo(() => {
    const lower = label.toLowerCase()
    if (lower.includes('publish') || lower.includes('complete') || lower.includes('configured')) {
      return 'border-sky-400/20 bg-sky-400/10 text-sky-200'
    }
    if (lower.includes('review') || lower.includes('assigned')) {
      return 'border-sky-500/20 bg-sky-500/10 text-sky-100'
    }
    if (lower.includes('overdue') || lower.includes('error') || lower.includes('missing')) {
      return 'border-rose-500/30 bg-rose-500/10 text-rose-300'
    }
    if (lower.includes('inactive') || lower.includes('archived')) {
      return 'border-zinc-600 bg-zinc-800/70 text-zinc-300'
    }
    return 'border-zinc-600 bg-zinc-900 text-zinc-200'
  }, [label])

  return <Badge className={cn('h-6 rounded-full border text-[11px] font-medium', tone)}>{label}</Badge>
}

export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400">{title}</h2>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

export function FilterChip({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs transition',
        active
          ? 'border-sky-400/20 bg-sky-400/10 text-sky-100'
          : 'border-white/8 bg-white/[0.03] text-zinc-400 hover:border-white/12 hover:text-zinc-200'
      )}
    >
      {label}
    </button>
  )
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[]
  rows: Array<Array<ReactNode>>
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/6">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#0b1118]/90 text-xs uppercase tracking-[0.12em] text-zinc-500">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-3 py-2.5 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/6 text-zinc-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-[#070c14]/50 transition hover:bg-white/[0.035]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ChartContainer({ title, points }: { title: string; points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const last = points[points.length - 1]
  const first = points[0]
  const width = 420
  const height = 160
  const paddingX = 18
  const paddingY = 18
  const innerWidth = width - paddingX * 2
  const innerHeight = height - paddingY * 2

  const normalize = (value: number) => {
    if (max === min) return height / 2
    return paddingY + innerHeight - ((value - min) / (max - min)) * innerHeight
  }

  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : innerWidth
  const coordinates = points.map((point, index) => ({
    x: paddingX + stepX * index,
    y: normalize(point),
    value: point,
  }))
  const path = coordinates.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${path} L ${paddingX + innerWidth} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`
  return (
    <div className="rounded-lg border border-white/6 bg-[#070c14]/45 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{title}</p>
          <p className="mt-1 text-[11px] text-zinc-600">
            {first} → {last} • range {min} - {max}
          </p>
        </div>
        <Badge className="h-6 rounded-full border border-white/8 bg-white/[0.03] px-2 text-[10px] text-zinc-300">
          Trend
        </Badge>
      </div>
      <div className="rounded-md border border-white/6 bg-[linear-gradient(180deg,rgba(8,15,25,0.9),rgba(5,9,16,0.95))] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full overflow-visible">
          <defs>
            <linearGradient id={`chart-fill-${title.replace(/\s+/g, '-').toLowerCase()}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(125, 211, 252, 0.26)" />
              <stop offset="100%" stopColor="rgba(125, 211, 252, 0.02)" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((tick) => {
            const y = paddingY + (innerHeight / 3) * tick
            return <line key={tick} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />
          })}
          <path d={areaPath} fill={`url(#chart-fill-${title.replace(/\s+/g, '-').toLowerCase()})`} />
          <path d={path} fill="none" stroke="rgba(125, 211, 252, 0.92)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
          {coordinates.map((point) => (
            <g key={`${point.x}-${point.y}`}>
              <circle cx={point.x} cy={point.y} r="3.4" fill="rgba(7, 14, 24, 1)" stroke="rgba(125, 211, 252, 0.92)" strokeWidth="1.8" />
              <title>{point.value}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export function ComparisonChart({
  title,
  items,
}: {
  title: string
  items: { label: string; value: number; meta?: string; display?: string }[]
}) {
  const max = Math.max(...items.map((item) => Math.abs(item.value)), 1)

  return (
    <div className="rounded-lg border border-white/6 bg-[#070c14]/45 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{title}</p>
        <span className="text-[11px] text-zinc-600">Relative comparison</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const positive = item.value >= 0
          const width = `${Math.max(8, (Math.abs(item.value) / max) * 100)}%`
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-zinc-300">{item.label}</span>
                <span className={cn('font-medium', positive ? 'text-emerald-300' : 'text-rose-300')}>
                  {item.display ?? `${item.value > 0 ? '+' : ''}${item.value}`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.04]">
                <div
                  className={cn('h-full rounded-full transition', positive ? 'bg-sky-400/80' : 'bg-rose-400/75')}
                  style={{ width }}
                />
              </div>
              {item.meta && <p className="text-[11px] text-zinc-600">{item.meta}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ActivityFeed({ items }: { items: { actor: string; action: string; time: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item.actor}-${index}`} className="rounded-lg border border-white/6 bg-[#070c14]/60 p-3">
          <p className="text-sm text-zinc-200">
            <span className="font-medium text-zinc-100">{item.actor}</span> {item.action}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{item.time}</p>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string
  detail: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center">
      <p className="text-sm font-medium text-zinc-200">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function SkeletonPanel() {
  return (
    <div className="space-y-3 rounded-lg border border-white/6 bg-[#070c14]/60 p-4">
      <div className="h-4 w-40 animate-pulse rounded bg-white/8" />
      <div className="h-8 w-full animate-pulse rounded bg-white/8" />
      <div className="h-8 w-2/3 animate-pulse rounded bg-white/8" />
    </div>
  )
}

export function AlertBanner({
  kind,
  title,
  detail,
}: {
  kind: 'info' | 'error' | 'warning' | 'success'
  title: string
  detail: string
}) {
  const icon = {
    info: <Clock3 className="size-4" />,
    error: <XCircle className="size-4" />,
    warning: <AlertTriangle className="size-4" />,
    success: <CheckCircle2 className="size-4" />,
  }[kind]

  const tone = {
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  }[kind]

  return (
    <div className={cn('flex items-start gap-2 rounded-lg border p-3 text-sm', tone)}>
      {icon}
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-xs opacity-90">{detail}</p>
      </div>
    </div>
  )
}

export function CommandPalettePreview() {
  return (
    <Panel
      title="Search example"
      description="Type Nvidia, semiconductors, assignment, company, or next meeting to jump to the right place."
      actions={<StatusPill label="Keyboard First" />}
    >
      <div className="rounded-lg border border-white/6 bg-[#070c14]/70 p-3">
        <div className="flex items-center gap-2 rounded-md border border-white/8 bg-[#050a12] px-2 py-2">
          <Search className="size-4 text-zinc-500" />
          <span className="text-sm text-zinc-400">Search NVDA, semiconductors, or next meeting...</span>
          <span className="ml-auto rounded border border-white/8 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-zinc-500">
            Esc
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { type: 'Ticker', name: 'NVDA', meta: 'Semiconductors' },
            { type: 'Research Note', name: 'AI Infrastructure Capex', meta: 'Published Apr 16' },
            { type: 'Assignment', name: 'Quarterly Model Refresh: NVDA', meta: 'Due Wednesday' },
          ].map((entry) => (
            <div
              key={entry.name}
              className="flex items-center justify-between rounded-md border border-white/6 bg-[#060b12]/70 px-2.5 py-2 text-sm hover:border-white/10"
            >
              <div className="flex items-center gap-2">
                <StatusPill label={entry.type} />
                <span className="text-zinc-200">{entry.name}</span>
              </div>
              <span className="text-xs text-zinc-500">{entry.meta}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

export function ToolbarRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/6 bg-[#070c14]/50 p-2.5">
      {children}
    </div>
  )
}

export function Timeline({
  entries,
}: {
  entries: { title: string; detail: string; at: string }[]
}) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.title + entry.at} className="flex gap-3">
          <div className="mt-1 size-2 rounded-full bg-emerald-300" />
          <div>
            <p className="text-sm text-zinc-200">{entry.title}</p>
            <p className="text-xs text-zinc-500">{entry.detail}</p>
            <p className="mt-1 text-[11px] text-zinc-600">{entry.at}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function StateGallery() {
  return (
    <Panel title="UI States" description="Loading, empty, error, restricted, archived">
      <div className="grid gap-3 md:grid-cols-2">
        <SkeletonPanel />
        <EmptyState
          title="No assignments yet"
          detail="Your research workspace is ready. Open an assignment or search a company to start."
          action={
            <Link href="/assignments">
              <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                Open Assignments
              </Button>
            </Link>
          }
        />
        <AlertBanner
          kind="error"
          title="Inactive meeting link"
          detail="Friday session is inactive. Contact operations before submission deadline."
        />
        <AlertBanner
          kind="warning"
          title="Permission restricted"
          detail="You can view this item but cannot publish without reviewer approval."
        />
        <AlertBanner
          kind="info"
          title="Filtered no results"
          detail="No companies match EV/EBITDA < 8 and Rev Growth > 15%. Adjust filters."
        />
        <AlertBanner
          kind="success"
          title="Submission recorded"
          detail="Your model package was queued for Wednesday meeting review."
        />
      </div>
    </Panel>
  )
}

export function CompactPaginator() {
  const [page, setPage] = useState(1)
  const totalPages = 9

  return (
    <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
      <p>
        Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, 164)} of 164
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="xs"
          className="border-zinc-700 bg-zinc-900 text-zinc-200"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
        >
          Prev
        </Button>
        <span className="rounded border border-white/8 bg-white/[0.03] px-2 py-1 text-[11px] text-zinc-400">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="xs"
          className="border-zinc-700 bg-zinc-900 text-zinc-200"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export function TableToolbar() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [exportState, setExportState] = useState<'idle' | 'queued' | 'ready'>('idle')

  return (
    <ToolbarRow>
      <div className="flex flex-wrap items-center gap-1.5">
        {['All', 'Overdue', 'In Review', 'Archived'].map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            active={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'border-zinc-700 bg-zinc-900 text-zinc-200',
            showFilters && 'border-sky-400/20 bg-sky-400/10 text-sky-100'
          )}
          onClick={() => setShowFilters((current) => !current)}
        >
          <Filter className="size-3.5" />
          Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 bg-zinc-900 text-zinc-200"
          onClick={() => setExportState('queued')}
        >
          {exportState === 'idle' ? 'Export' : exportState === 'queued' ? 'Export Queued' : 'CSV Ready'}
        </Button>
      </div>
      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/6 pt-3">
          <Badge className="h-6 rounded-full border border-white/8 bg-white/[0.03] px-2 text-[11px] text-zinc-300">
            Market Cap &gt; $5B
          </Badge>
          <Badge className="h-6 rounded-full border border-white/8 bg-white/[0.03] px-2 text-[11px] text-zinc-300">
            Revenue Growth &gt; 12%
          </Badge>
          <Badge className="h-6 rounded-full border border-white/8 bg-white/[0.03] px-2 text-[11px] text-zinc-300">
            EV / EBITDA &lt; 20x
          </Badge>
        </div>
      )}
      {exportState === 'queued' && (
        <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
          Export queued. The file will be ready in a few seconds.
        </div>
      )}
    </ToolbarRow>
  )
}

export function InfoPill({ text }: { text: string }) {
  return (
    <span className="rounded border border-white/8 bg-white/[0.03] px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
      {text}
    </span>
  )
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/6 bg-[#070c14]/70 px-2.5 py-2">
      <p className="text-[11px] uppercase tracking-[0.1em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-100">{value}</p>
    </div>
  )
}

export function SearchResultDropdown() {
  return (
    <Panel title="Search shortcuts" description="Try these first: Nvidia, semiconductors, assignment, company, or next meeting.">
      <div className="space-y-2 rounded-lg border border-white/6 bg-[#070c14]/80 p-2">
        {[
          { name: 'NVDA / Nvidia', kind: 'Company', meta: 'Open the company research page', href: '/terminal/company/NVDA' },
          { name: 'Semiconductors', kind: 'Sector', meta: 'See the sector view and movers', href: '/terminal/sectors/semiconductors' },
          { name: 'Quarterly Model Refresh: NVDA', kind: 'Assignment', meta: 'Open the current work queue item', href: '/assignments/asg-101' },
          { name: 'Next Meeting', kind: 'Meeting', meta: 'Check the recurring Wednesday session', href: '/terminal/meetings' },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center justify-between rounded-md px-2 py-2 transition hover:bg-white/[0.035]"
          >
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-zinc-500" />
              <div>
                <p className="text-sm text-zinc-100">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.meta}</p>
              </div>
            </div>
            <StatusPill label={item.kind} />
          </Link>
        ))}
      </div>
    </Panel>
  )
}
