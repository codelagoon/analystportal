import { prisma } from '@/lib/prisma'

const fallbackHomepage = {
  bannerTitle: 'Run your analyst program like a real research desk.',
  bannerBody:
    'Echelon Terminal gives student teams an institutional operating environment: coverage discipline, assignment accountability, review rigor, and consistent execution cadence.',
  bannerStartAt: null as string | null,
  bannerEndAt: null as string | null,
  featuredResearch: [
    'AI Infrastructure Capex: Cycle Duration and Margin Structure',
    'Managed Care Revision Risk in 2H26',
    'Renewable Yield Vehicles and Cost of Capital Compression',
  ],
}

export async function getHomepageContent() {
  try {
    const [settings, features] = await Promise.all([
      prisma.homepageSettings.findUnique({ where: { id: 'homepage-settings' } }),
      prisma.homepageFeature.findMany({
        where: { active: true },
        orderBy: { position: 'asc' },
      }),
    ])

    return {
      bannerTitle: settings?.bannerTitle ?? fallbackHomepage.bannerTitle,
      bannerBody: settings?.bannerBody ?? fallbackHomepage.bannerBody,
      bannerStartAt: settings?.bannerStartAt ?? fallbackHomepage.bannerStartAt,
      bannerEndAt: settings?.bannerEndAt ?? fallbackHomepage.bannerEndAt,
      featuredResearch: features.length > 0 ? features.map((feature) => feature.title) : fallbackHomepage.featuredResearch,
    }
  } catch {
    return fallbackHomepage
  }
}