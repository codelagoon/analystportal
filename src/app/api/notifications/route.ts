import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toApiError } from '@/lib/api-error'

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(
      notifications.map((notification) => ({
        id: notification.id,
        kind: notification.kind.toLowerCase(),
        title: notification.title,
        preview: notification.preview,
        href: notification.href,
        timestamp: notification.createdAt.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      }))
    )
  } catch (error) {
    const apiError = toApiError(error, 'Failed to fetch notifications')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}
