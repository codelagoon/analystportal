import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MeetingDay } from '@/generated/prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        recurringMeeting: true,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      submissionUrl,
      feedback
    } = body

    const assignment = await prisma.assignment.update({
      where: { id: params.id },
      data: {
        title,
        description,
        type,
        company,
        sector,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        reviewer,
        recurringMeetingId,
        meetingDay: meetingDay ? (meetingDay as MeetingDay) : undefined,
        submissionUrl,
        feedback,
      },
      include: {
        recurringMeeting: true,
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.assignment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
  }
}
