import { NextRequest, NextResponse } from 'next/server'
import { toApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { isDisplayMeetingDay, toPrismaMeetingDay } from '@/lib/meeting-day'
import { parseBoolean, readOptionalString, requireString } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const meeting = await prisma.recurringMeeting.findUnique({
      where: { id },
      include: {
        assignments: true,
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    return NextResponse.json(meeting)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to fetch recurring meeting')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { dayOfWeek, title, zoomMeetingId, zoomJoinUrl, zoomStartUrl, scheduledTime, active, notes } = body
    if (dayOfWeek !== undefined && dayOfWeek !== null && !isDisplayMeetingDay(dayOfWeek)) {
      return NextResponse.json({ error: 'Day of week is invalid' }, { status: 400 })
    }

    const normalizedDay = isDisplayMeetingDay(dayOfWeek) ? toPrismaMeetingDay(dayOfWeek) : undefined

    const meeting = await prisma.recurringMeeting.update({
      where: { id },
      data: {
        dayOfWeek: normalizedDay ?? undefined,
        title: requireString(title, 'Title'),
        zoomMeetingId: readOptionalString(zoomMeetingId),
        zoomJoinUrl: readOptionalString(zoomJoinUrl),
        zoomStartUrl: readOptionalString(zoomStartUrl),
        scheduledTime: readOptionalString(scheduledTime),
        active: parseBoolean(active),
        notes: readOptionalString(notes),
      },
      include: {
        assignments: true,
      },
    })

    return NextResponse.json(meeting)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to update recurring meeting')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await prisma.$transaction(async (transaction) => {
      const { count } = await transaction.assignment.updateMany({
        where: { recurringMeetingId: id },
        data: {
          recurringMeetingId: null,
          meetingDay: null,
        },
      })

      await transaction.recurringMeeting.delete({
        where: { id },
      })

      return { unlinkedAssignments: count }
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    const apiError = toApiError(error, 'Failed to delete recurring meeting')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}
