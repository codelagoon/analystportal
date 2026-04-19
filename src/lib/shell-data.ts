export const shellSearchIndex = [
  {
    id: 'search-assignments',
    category: 'Assignments',
    title: 'Assignments',
    meta: 'Open your current work queue',
    href: '/assignments',
    icon: 'assignment',
    keywords: ['assignments', 'work queue', 'tasks'],
    featured: true,
    action: 'route',
  },
  {
    id: 'search-meetings',
    category: 'Meetings',
    title: 'Meetings',
    meta: 'Open recurring weekly sessions',
    href: '/terminal/meetings',
    icon: 'meeting',
    keywords: ['meetings', 'calendar', 'sessions'],
    featured: true,
    action: 'route',
  },
  {
    id: 'search-companies',
    category: 'Companies',
    title: 'Companies',
    meta: 'Browse company research pages',
    href: '/terminal/company/NVDA',
    icon: 'company',
    keywords: ['company', 'ticker', 'research'],
    featured: true,
    action: 'route',
  },
  {
    id: 'search-sectors',
    category: 'Sectors',
    title: 'Sectors',
    meta: 'View sector-level research',
    href: '/terminal/sectors/semiconductors',
    icon: 'sector',
    keywords: ['sector', 'industry', 'coverage'],
    featured: false,
    action: 'route',
  },
  {
    id: 'search-profile',
    category: 'Analysts',
    title: 'Profile',
    meta: 'Open analyst profile',
    href: '/terminal/profile',
    icon: 'analyst',
    keywords: ['profile', 'analyst'],
    featured: false,
    action: 'route',
  },
] as const

export const quickActionItems = [
  {
    label: 'Open Assignments',
    shortLabel: 'AS',
    description: 'Review due work and assignment status.',
    href: '/assignments',
    kind: 'route',
  },
  {
    label: 'Open Meetings',
    shortLabel: 'MT',
    description: 'Check recurring meeting schedule.',
    href: '/terminal/meetings',
    kind: 'route',
  },
  {
    label: 'Open Companies',
    shortLabel: 'CO',
    description: 'Jump to company research coverage.',
    href: '/terminal/company/NVDA',
    kind: 'route',
  },
  {
    label: 'Open Sectors',
    shortLabel: 'SE',
    description: 'Open sector research pages.',
    href: '/terminal/sectors/semiconductors',
    kind: 'route',
  },
] as const

export const notificationFeed: Array<{
  id: string
  kind: 'assignment' | 'meeting' | 'sector'
  title: string
  preview: string
  timestamp: string
  unread: boolean
  href: string
}> = []
