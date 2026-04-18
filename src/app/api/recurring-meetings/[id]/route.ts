import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MeetingDay } from '@/generated/prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await prisma.recurringMeeting.findUnique({
      where: { id: params.id },
      include: {
        assignments: true,
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    return NextResponse.json(meeting)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recurring meeting' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { dayOfWeek, title, zoomMeetingId, zoomJoinUrl, zoomStartUrl, scheduledTime, active, notes } = body

    const meeting = await prisma.recurringMeeting.update({
      where: { id: params.id },
      data: {
        dayOfWeek: dayOfWeek ? (dayOfWeek as MeetingDay) : undefined,
        title,
        zoomMeetingId,
        zoomJoinUrl,
        zoomStartUrl,
        scheduledTime,
        active,
        notes,
      },
      include: {
        assignments: true,
      },
    })

    return NextResponse.json(meeting)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update recurring meeting' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.recurringMeeting.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete recurring meeting' }, { status: 500 })
  }
}
