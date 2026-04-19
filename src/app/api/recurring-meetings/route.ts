import { NextRequest, NextResponse } from 'next/server'
import { toApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { isDisplayMeetingDay, toPrismaMeetingDay } from '@/lib/meeting-day'
import { readOptionalString, requireString } from '@/lib/validation'

export async function GET() {
  try {
    const meetings = await prisma.recurringMeeting.findMany({
      select: {
        id: true,
        dayOfWeek: true,
        title: true,
        zoomMeetingId: true,
        zoomJoinUrl: true,
        zoomStartUrl: true,
        scheduledTime: true,
        active: true,
        notes: true,
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    })
    return NextResponse.json(meetings)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to fetch recurring meetings')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dayOfWeek, title, zoomMeetingId, zoomJoinUrl, zoomStartUrl, scheduledTime, notes } = body
    if (!isDisplayMeetingDay(dayOfWeek)) {
      return NextResponse.json({ error: 'Day of week is invalid' }, { status: 400 })
    }

    const normalizedDay = toPrismaMeetingDay(dayOfWeek)

    const meeting = await prisma.recurringMeeting.create({
      data: {
        dayOfWeek: normalizedDay,
        title: requireString(title, 'Title'),
        zoomMeetingId: readOptionalString(zoomMeetingId),
        zoomJoinUrl: readOptionalString(zoomJoinUrl),
        zoomStartUrl: readOptionalString(zoomStartUrl),
        scheduledTime: readOptionalString(scheduledTime),
        notes: readOptionalString(notes),
      },
      include: {
        assignments: true,
      },
    })

    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    const apiError = toApiError(error, 'Failed to create recurring meeting')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}
