'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  Command,
  LayoutGrid,
  Search,
  Sparkles,
  Target,
  Triangle,
  Users2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  notificationFeed,
  quickActionItems,
  shellSearchIndex,
} from '@/lib/mock-terminal-data'
import { cn } from '@/lib/utils'

type ShellControlsProps = {
  section?: 'terminal' | 'admin'
  primaryActionLabel?: string
}

type SearchResult = (typeof shellSearchIndex)[number]

type QuickAction = (typeof quickActionItems)[number]

type NotificationItem = (typeof notificationFeed)[number]

const searchIcons = {
  company: Building2,
  sector: Triangle,
  analyst: Users2,
  assignment: Target,
  meeting: LayoutGrid,
  action: Sparkles,
} as const

const notificationIcons = {
  assignment: Target,
  meeting: LayoutGrid,
  sector: Triangle,
} as const

function scoreSearchResult(result: SearchResult, query: string) {
  if (!query) {
    return result.featured ? 50 : 10
  }

  const normalizedQuery = query.toLowerCase()
  const title = result.title.toLowerCase()
  const meta = result.meta.toLowerCase()
  const keywords = result.keywords.join(' ').toLowerCase()

  let score = 0
  if (title === normalizedQuery) score += 120
  if (title.startsWith(normalizedQuery)) score += 90
  if (title.includes(normalizedQuery)) score += 60
  if (meta.includes(normalizedQuery)) score += 28
  if (keywords.includes(normalizedQuery)) score += 42
  if (result.category.toLowerCase().includes(normalizedQuery)) score += 18

  return score
}

export function ShellControls({ section = 'terminal', primaryActionLabel }: ShellControlsProps) {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchPanelRef = useRef<HTMLDivElement>(null)
  const quickMenuRef = useRef<HTMLDivElement>(null)
  const notificationPanelRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchIndex, setSearchIndex] = useState(0)
  const [quickOpen, setQuickOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(notificationFeed)

  const unreadCount = notifications.filter((item) => item.unread).length

  const groupedSearchResults = useMemo(() => {
    const query = searchQuery.trim()

    const scored = shellSearchIndex
      .map((result) => ({ result, score: scoreSearchResult(result, query) }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 10)

    const groups = scored.reduce<Record<string, SearchResult[]>>((accumulator, entry) => {
      const group = entry.result.category
      if (!accumulator[group]) accumulator[group] = []
      accumulator[group].push(entry.result)
      return accumulator
    }, {})

    return Object.entries(groups)
  }, [searchQuery])

  const flattenedResults = useMemo(
    () => groupedSearchResults.flatMap(([category, results]) => results.map((result) => ({ category, result }))),
    [groupedSearchResults]
  )

  const quickActions = useMemo(() => quickActionItems, [])

  const activeSearchItem = flattenedResults[searchIndex]

  useEffect(() => {
    if (!searchOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setQuickOpen(false)
        setNotificationsOpen(false)
        searchInputRef.current?.blur()
        return
      }

      if (event.metaKey || event.ctrlKey) {
        if (event.key.toLowerCase() === 'k') {
          event.preventDefault()
          setSearchOpen(true)
          setQuickOpen(false)
          setNotificationsOpen(false)
          searchInputRef.current?.focus()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        searchPanelRef.current?.contains(target) ||
        quickMenuRef.current?.contains(target) ||
        notificationPanelRef.current?.contains(target)
      ) {
        return
      }
      if (searchInputRef.current && !searchInputRef.current.contains(target)) {
        setSearchOpen(false)
      }
      setQuickOpen(false)
      setNotificationsOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    setSearchIndex(0)
  }, [searchQuery, searchOpen])

  useEffect(() => {
    if (searchIndex >= flattenedResults.length) {
      setSearchIndex(0)
    }
  }, [flattenedResults.length, searchIndex])

  function openSearchResult(result: SearchResult) {
    setSearchOpen(false)
    setQuickOpen(false)
    setNotificationsOpen(false)
    setSearchQuery('')

    if (result.action === 'search') {
      searchInputRef.current?.focus()
      return
    }

    if (result.href) {
      router.push(result.href)
    }
  }

  function openQuickAction(action: QuickAction) {
    setQuickOpen(false)

    if (action.kind === 'search') {
      setSearchOpen(true)
      searchInputRef.current?.focus()
      return
    }

    if (action.href) {
      router.push(action.href)
    }
  }

  function markRead(id: string) {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, unread: false } : item)))
  }

  function markAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })))
  }

  function clearNotifications() {
    setNotifications([])
  }

  const searchPaletteOpen = searchOpen || searchQuery.length > 0
  const hasSearchResults = flattenedResults.length > 0
  const hasUnreadNotifications = unreadCount > 0
  const primaryLabel = primaryActionLabel ?? (section === 'admin' ? 'Create Assignment' : 'Open Assignments')
  const surfaceLabel = section === 'admin' ? 'Admin Control Surface' : 'Research Control Surface'

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="relative w-full max-w-3xl flex-1" ref={searchPanelRef}>
        <div
          className={cn(
            'flex h-12 items-center gap-3 rounded-[14px] border border-white/8 bg-[#0a111c]/96 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition',
            searchPaletteOpen ? 'border-sky-400/20 bg-[#0d1521]' : 'hover:border-white/12'
          )}
          onClick={() => searchInputRef.current?.focus()}
        >
          <Search className="size-4 shrink-0 text-zinc-500" />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                if (flattenedResults.length > 0) {
                  setSearchIndex((current) => (current + 1) % flattenedResults.length)
                }
                return
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault()
                if (flattenedResults.length > 0) {
                  setSearchIndex((current) => (current - 1 + flattenedResults.length) % flattenedResults.length)
                }
                return
              }

              if (event.key === 'Enter' && activeSearchItem) {
                event.preventDefault()
                openSearchResult(activeSearchItem.result)
                return
              }

              if (event.key === 'Escape') {
                setSearchOpen(false)
                searchInputRef.current?.blur()
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
            placeholder="Search Nvidia, semiconductors, assignment, or next meeting"
          />
          <button
            type="button"
            onClick={() => {
              setSearchOpen(true)
              searchInputRef.current?.focus()
            }}
            className="rounded-md border border-white/8 bg-white/[0.03] px-1.5 py-0.5 text-[10px] tracking-[0.14em] text-zinc-400 transition hover:border-white/12 hover:text-zinc-200"
          >
            ⌘ K
          </button>
        </div>

        {searchPaletteOpen && (
          <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-full overflow-hidden rounded-[18px] border border-white/8 bg-[#060c16]/98 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-zinc-100">Global Search</p>
                <p className="text-xs text-zinc-500">Type a ticker, sector, assignment, or meeting name, then press Enter.</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                <span className="rounded border border-white/8 bg-white/[0.03] px-1.5 py-0.5">Enter</span>
                <span className="rounded border border-white/8 bg-white/[0.03] px-1.5 py-0.5">Esc</span>
              </div>
            </div>

            <div className="max-h-[28rem] overflow-y-auto p-2">
              {hasSearchResults ? (
                <div className="space-y-3">
                  {groupedSearchResults.map(([group, results]) => (
                    <div key={group}>
                      <div className="px-2 pb-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">{group}</div>
                      <div className="space-y-1">
                        {results.map((result) => {
                          const Icon = searchIcons[result.icon]
                          const active = activeSearchItem?.result.id === result.id
                          return (
                            <button
                              key={result.id}
                              type="button"
                              onMouseEnter={() => {
                                const index = flattenedResults.findIndex((item) => item.result.id === result.id)
                                if (index >= 0) setSearchIndex(index)
                              }}
                              onClick={() => openSearchResult(result)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition',
                                active
                                  ? 'bg-sky-400/10 ring-1 ring-sky-400/20'
                                  : 'hover:bg-white/[0.035]'
                              )}
                            >
                              <div className="grid size-9 place-items-center rounded-lg border border-white/6 bg-[#0a1117] text-zinc-300">
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-zinc-100">{result.title}</p>
                                  {result.featured && (
                                    <Badge className="h-5 rounded-full border border-sky-400/20 bg-sky-400/10 px-1.5 text-[10px] text-sky-200">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <p className="truncate text-xs text-zinc-500">{result.meta}</p>
                              </div>
                              <ChevronRight className="size-4 text-zinc-600" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="rounded-[14px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
                  <p className="text-sm font-medium text-zinc-200">No matches for {searchQuery.trim()}</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                    Try a ticker, sector, company, or assignment keyword. You can also jump straight to a quick action.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[14px] border border-white/6 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Good starting points</p>
                    <div className="mt-2 space-y-1.5">
                      {shellSearchIndex
                        .filter((item) => item.featured)
                        .slice(0, 3)
                        .map((item) => {
                          const Icon = searchIcons[item.icon]
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => openSearchResult(item)}
                              className="flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left transition hover:bg-white/[0.035]"
                            >
                              <Icon className="size-4 text-zinc-500" />
                              <span className="flex-1 text-sm text-zinc-200">{item.title}</span>
                              <span className="text-xs text-zinc-500">{item.category}</span>
                            </button>
                          )
                        })}
                    </div>
                  </div>

                  <div className="rounded-[14px] border border-white/6 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Common next steps</p>
                    <div className="mt-2 space-y-1.5">
                      {quickActions.slice(0, 4).map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => openQuickAction(action)}
                          className="flex w-full items-center justify-between rounded-[10px] px-2.5 py-2 text-left transition hover:bg-white/[0.035]"
                        >
                          <div>
                            <p className="text-sm text-zinc-100">{action.label}</p>
                            <p className="text-xs text-zinc-500">{action.description}</p>
                          </div>
                          <ChevronRight className="size-4 text-zinc-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-10 rounded-[10px] bg-zinc-100 px-3.5 text-sm font-medium text-zinc-900 shadow-none transition hover:bg-zinc-200"
          onClick={() => router.push(section === 'admin' ? '/admin/assignments' : '/assignments')}
        >
          <Target className="size-4" />
          {primaryLabel}
        </Button>

        <div className="relative" ref={quickMenuRef}>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-10 rounded-[10px] border-white/8 bg-[#0b111a] px-3 text-sm text-zinc-200 transition hover:border-white/12 hover:bg-white/[0.03]',
              quickOpen && 'border-sky-400/20 bg-sky-400/8 text-sky-100'
            )}
            onClick={() => {
              setQuickOpen((current) => !current)
              setNotificationsOpen(false)
              setSearchOpen(false)
            }}
          >
            <Sparkles className="size-4" />
            Quick Actions
          </Button>

          {quickOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-[19rem] rounded-[16px] border border-white/8 bg-[#060c16]/98 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-xl">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-zinc-100">Action Center</p>
                <p className="text-xs text-zinc-500">Common flows for assignments, meetings, and navigation.</p>
              </div>
              <div className="px-3 pb-2">
                <span className="inline-flex rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                  {surfaceLabel}
                </span>
              </div>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => openQuickAction(action)}
                    className="flex w-full items-start gap-3 rounded-[12px] px-3 py-2.5 text-left transition hover:bg-white/[0.035]"
                  >
                    <div className="mt-0.5 grid size-8 place-items-center rounded-lg border border-white/6 bg-white/[0.03] text-zinc-300">
                      <span className="text-xs font-semibold">{action.shortLabel}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-100">{action.label}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-[10px] border-white/8 bg-[#0b111a] px-3 text-sm text-zinc-200 transition hover:border-white/12 hover:bg-white/[0.03]"
          onClick={() => {
            setSearchOpen(true)
            setQuickOpen(false)
            setNotificationsOpen(false)
            searchInputRef.current?.focus()
          }}
        >
          <Command className="size-4" />
          Command
        </Button>

        <div className="relative" ref={notificationPanelRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((current) => !current)
              setQuickOpen(false)
              setSearchOpen(false)
            }}
            className={cn(
              'relative grid size-10 place-items-center rounded-[10px] border border-white/8 bg-[#0b111a] text-zinc-400 transition hover:border-white/12 hover:text-zinc-100',
              notificationsOpen && 'border-sky-400/20 bg-sky-400/8 text-sky-100'
            )}
            aria-label="Open notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border border-[#050a11] bg-sky-400 px-1.5 py-0.5 text-[10px] font-semibold text-[#04111b]">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-[24rem] overflow-hidden rounded-[18px] border border-white/8 bg-[#060c16]/98 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3 border-b border-white/6 px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-zinc-100">Notifications</p>
                  <p className="text-xs text-zinc-500">
                    {hasUnreadNotifications ? `${unreadCount} unread updates` : 'All caught up across assignments, meetings, and research notes'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-white/12 hover:text-zinc-100"
                  >
                    Mark all as read
                  </button>
                  <button
                    type="button"
                    onClick={clearNotifications}
                    className="rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-white/12 hover:text-zinc-100"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="max-h-[26rem] overflow-y-auto p-2">
                {notifications.length === 0 ? (
                  <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center">
                    <p className="text-sm font-medium text-zinc-200">Notification center is empty</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
                      New review comments, research updates, and meeting updates will appear here.
                    </p>
                  </div>
                ) : hasUnreadNotifications ? (
                  <div className="space-y-1">
                    {notifications.map((notification) => {
                      const Icon = notificationIcons[notification.kind]
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            'rounded-[14px] border px-3 py-2.5 transition hover:bg-white/[0.03]',
                            notification.unread
                              ? 'border-sky-400/18 bg-sky-400/6'
                              : 'border-white/6 bg-white/[0.015]'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn('mt-0.5 grid size-9 place-items-center rounded-lg border', notification.unread ? 'border-sky-400/20 bg-sky-400/10 text-sky-200' : 'border-white/6 bg-white/[0.03] text-zinc-300')}>
                              <Icon className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-medium text-zinc-100">{notification.title}</p>
                                    {notification.unread && <span className="size-1.5 rounded-full bg-sky-300" />}
                                  </div>
                                  <p className="mt-0.5 text-xs text-zinc-500">{notification.preview}</p>
                                </div>
                                <p className="shrink-0 text-[11px] text-zinc-600">{notification.timestamp}</p>
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                <Link
                                  href={notification.href}
                                  className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-white/12 hover:text-zinc-100"
                                  onClick={() => markRead(notification.id)}
                                >
                                  Open
                                  <ChevronRight className="size-3" />
                                </Link>
                                {notification.unread && (
                                  <button
                                    type="button"
                                    onClick={() => markRead(notification.id)}
                                    className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-white/12 hover:text-zinc-100"
                                  >
                                    <Check className="size-3" />
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-[16px] border border-white/6 bg-white/[0.015] px-4 py-8">
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 place-items-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                        <Check className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">All caught up</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          No unread assignment, meeting, or research note updates are waiting right now.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[10px] border border-white/8 bg-[#0b111a] px-2.5 text-zinc-200 transition hover:border-white/12 hover:text-zinc-100"
        >
          <span className="grid size-6 place-items-center rounded-full bg-white/6 text-[10px] font-semibold text-zinc-200">
            ET
          </span>
          <span className="hidden text-xs text-zinc-400 md:inline">Ops</span>
        </button>
      </div>
    </div>
  )
}
