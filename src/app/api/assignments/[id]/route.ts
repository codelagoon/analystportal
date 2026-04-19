import { NextRequest, NextResponse } from 'next/server'
import { toApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { isDisplayMeetingDay, toPrismaMeetingDay } from '@/lib/meeting-day'
import { readOptionalString, requireString } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        recurringMeeting: true,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to fetch assignment')
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
      submissionUrl,
      feedback
    } = body

    if (meetingDay !== undefined && meetingDay !== null && !isDisplayMeetingDay(meetingDay)) {
      return NextResponse.json({ error: 'Meeting day is invalid' }, { status: 400 })
    }

    const normalizedMeetingDay = isDisplayMeetingDay(meetingDay) ? toPrismaMeetingDay(meetingDay) : null

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        title: requireString(title, 'Title'),
        description,
        type: readOptionalString(type),
        company: readOptionalString(company),
        sector: readOptionalString(sector),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        reviewer: requireString(reviewer, 'Reviewer'),
        recurringMeetingId,
        meetingDay: normalizedMeetingDay ?? undefined,
        submissionUrl: readOptionalString(submissionUrl),
        feedback: readOptionalString(feedback),
      },
      include: {
        recurringMeeting: true,
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to update assignment')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.assignment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const apiError = toApiError(error, 'Failed to delete assignment')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}
