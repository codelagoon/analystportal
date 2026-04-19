import { NextRequest, NextResponse } from 'next/server'
import { toApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { parseBoolean, readOptionalString, requireString } from '@/lib/validation'

const SETTINGS_ID = 'homepage-settings'

function normalizeFeatureInput(value: unknown, fallbackPosition: number) {
  if (!value || typeof value !== 'object') {
    throw new Error('Feature row is invalid')
  }

  const entry = value as Record<string, unknown>
  return {
    id: typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : crypto.randomUUID(),
    title: requireString(entry.title, 'Feature title'),
    author: requireString(entry.author, 'Feature author'),
    status: requireString(entry.status, 'Feature status'),
    position: Number.isFinite(Number(entry.position)) ? Number(entry.position) : fallbackPosition,
    active: parseBoolean(entry.active),
  }
}

export async function GET() {
  try {
    const [settings, features] = await Promise.all([
      prisma.homepageSettings.findUnique({ where: { id: SETTINGS_ID } }),
      prisma.homepageFeature.findMany({ orderBy: { position: 'asc' } }),
    ])

    return NextResponse.json({ settings, features })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch homepage controls' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const settingsBody = body?.settings ?? {}
    const featuresBody = Array.isArray(body?.features) ? body.features : []

    const settings = {
      bannerTitle: requireString(settingsBody.bannerTitle, 'Banner title'),
      bannerBody: requireString(settingsBody.bannerBody, 'Banner body'),
      bannerStartAt: readOptionalString(settingsBody.bannerStartAt),
      bannerEndAt: readOptionalString(settingsBody.bannerEndAt),
    }

    const features = featuresBody.map((feature: unknown, index: number) => normalizeFeatureInput(feature, index))

    await prisma.$transaction(async (transaction) => {
      await transaction.homepageSettings.upsert({
        where: { id: SETTINGS_ID },
        update: settings,
        create: { id: SETTINGS_ID, ...settings },
      })

      const featureIds = features.map((feature: ReturnType<typeof normalizeFeatureInput>) => feature.id)
      await transaction.homepageFeature.deleteMany({
        where: featureIds.length > 0 ? { id: { notIn: featureIds } } : {},
      })

      for (const feature of features) {
        await transaction.homepageFeature.upsert({
          where: { id: feature.id },
          update: {
            title: feature.title,
            author: feature.author,
            status: feature.status,
            position: feature.position,
            active: feature.active,
          },
          create: feature,
        })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const apiError = toApiError(error, 'Failed to save homepage controls')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}