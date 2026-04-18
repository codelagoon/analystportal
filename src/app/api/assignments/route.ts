import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MeetingDay } from '@/generated/prisma/client'

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        recurringMeeting: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    })
    return NextResponse.json(assignments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
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

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        type,
        company,
        sector,
        dueDate: dueDate ? new Date(dueDate) : null,
        reviewer,
        recurringMeetingId,
        meetingDay: meetingDay ? (meetingDay as MeetingDay) : null,
        submissionUrl,
      },
      include: {
        recurringMeeting: true,
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}
