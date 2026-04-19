import { NextRequest, NextResponse } from 'next/server'
import { toApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { isDisplayMeetingDay, toPrismaMeetingDay } from '@/lib/meeting-day'
import { readOptionalString, requireString } from '@/lib/validation'

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        company: true,
        sector: true,
        reviewer: true,
        dueDate: true,
        meetingDay: true,
        createdAt: true,
        recurringMeeting: {
          select: {
            zoomJoinUrl: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })
    return NextResponse.json(assignments)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to fetch assignments')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      type, 
      company, 
      sector, 
      dueDate, 
      reviewer, 
      recurringMeetingId, 
      meetingDay,
      submissionUrl 
    } = body

    if (!isDisplayMeetingDay(meetingDay)) {
      return NextResponse.json({ error: 'Meeting day is invalid' }, { status: 400 })
    }

    const normalizedMeetingDay = toPrismaMeetingDay(meetingDay)

    const assignment = await prisma.assignment.create({
      data: {
        title: requireString(title, 'Title'),
        description,
        type: readOptionalString(type),
        company: readOptionalString(company),
        sector: readOptionalString(sector),
        dueDate: dueDate ? new Date(dueDate) : null,
        reviewer: requireString(reviewer, 'Reviewer'),
        recurringMeetingId,
        meetingDay: normalizedMeetingDay,
        submissionUrl: readOptionalString(submissionUrl),
      },
      include: {
        recurringMeeting: true,
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    const apiError = toApiError(error, 'Failed to create assignment')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}
