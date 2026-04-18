import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MeetingDay } from '@/generated/prisma/client'

export async function GET() {
  try {
    const meetings = await prisma.recurringMeeting.findMany({
      include: {
        assignments: true,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    })
    return NextResponse.json(meetings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recurring meetings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dayOfWeek, title, zoomMeetingId, zoomJoinUrl, zoomStartUrl, scheduledTime, notes } = body

    const meeting = await prisma.recurringMeeting.create({
      data: {
        dayOfWeek: dayOfWeek as MeetingDay,
        title,
        zoomMeetingId,
        zoomJoinUrl,
        zoomStartUrl,
        scheduledTime,
        notes,
      },
      include: {
        assignments: true,
      },
    })

    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create recurring meeting' }, { status: 500 })
  }
}
