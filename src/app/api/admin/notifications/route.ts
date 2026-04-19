import { NextRequest, NextResponse } from 'next/server'
import { NotificationKind } from '@/generated/prisma/client'
import { toApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { requireString } from '@/lib/validation'

const allowedKinds = ['ASSIGNMENT', 'MEETING', 'SECTOR'] as const

type AllowedKind = (typeof allowedKinds)[number]

function parseKind(value: unknown): NotificationKind {
  const normalized = requireString(value, 'Kind').toUpperCase()
  if (!allowedKinds.includes(normalized as AllowedKind)) {
    throw new Error('Kind is invalid')
  }

  return normalized as NotificationKind
}

function parseHref(value: unknown) {
  const href = requireString(value, 'Link')
  if (!href.startsWith('/')) {
    throw new Error('Link is invalid')
  }

  return href
}

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to fetch notifications')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const notification = await prisma.notification.create({
      data: {
        kind: parseKind(body.kind),
        title: requireString(body.title, 'Title'),
        preview: requireString(body.preview, 'Preview'),
        href: parseHref(body.href),
        active: body.active === undefined ? true : Boolean(body.active),
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    const apiError = toApiError(error, 'Failed to create notification')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}
