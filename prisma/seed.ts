import { PrismaClient } from '../src/generated/prisma/client'
import { MeetingDay } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create recurring meetings
  const mondayMeeting = await prisma.recurringMeeting.upsert({
    where: { zoomMeetingId: 'MON-001' },
    update: {},
    create: {
      dayOfWeek: MeetingDay.MONDAY,
      title: 'Monday Review Session',
      zoomMeetingId: 'MON-001',
      zoomJoinUrl: 'https://zoom.us/j/123456789',
      zoomStartUrl: 'https://zoom.us/s/123456789',
      scheduledTime: '14:00',
      active: true,
      notes: 'Weekly review for all Monday assignments',
    },
  })

  const wednesdayMeeting = await prisma.recurringMeeting.upsert({
    where: { zoomMeetingId: 'WED-001' },
    update: {},
    create: {
      dayOfWeek: MeetingDay.WEDNESDAY,
      title: 'Wednesday Review Session',
      zoomMeetingId: 'WED-001',
      zoomJoinUrl: 'https://zoom.us/j/987654321',
      zoomStartUrl: 'https://zoom.us/s/987654321',
      scheduledTime: '15:00',
      active: true,
      notes: 'Weekly review for all Wednesday assignments',
    },
  })

  const fridayMeeting = await prisma.recurringMeeting.upsert({
    where: { zoomMeetingId: 'FRI-001' },
    update: {},
    create: {
      dayOfWeek: MeetingDay.FRIDAY,
      title: 'Friday Review Session',
      zoomMeetingId: 'FRI-001',
      zoomJoinUrl: 'https://zoom.us/j/456789123',
      zoomStartUrl: 'https://zoom.us/s/456789123',
      scheduledTime: '16:00',
      active: true,
      notes: 'Weekly review for all Friday assignments',
    },
  })

  console.log('Created recurring meetings:', { mondayMeeting, wednesdayMeeting, fridayMeeting })

  // Create assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Financial Analysis Project',
      description: 'Analyze the financial statements of a public company and provide investment recommendations.',
      type: 'Research',
      company: 'TechCorp Inc.',
      sector: 'Technology',
      dueDate: new Date('2026-04-25T14:00:00'),
      reviewer: 'John Smith',
      recurringMeetingId: mondayMeeting.id,
      meetingDay: MeetingDay.MONDAY,
      submissionUrl: null,
      feedback: null,
    },
  })

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Market Research Report',
      description: 'Conduct market research on the renewable energy sector and identify key trends.',
      type: 'Analysis',
      company: 'GreenEnergy Ltd.',
      sector: 'Energy',
      dueDate: new Date('2026-04-23T15:00:00'),
      reviewer: 'Sarah Johnson',
      recurringMeetingId: wednesdayMeeting.id,
      meetingDay: MeetingDay.WEDNESDAY,
      submissionUrl: null,
      feedback: null,
    },
  })

  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Competitive Analysis',
      description: 'Analyze the competitive landscape of the e-commerce industry.',
      type: 'Strategy',
      company: 'RetailMax',
      sector: 'Retail',
      dueDate: new Date('2026-04-25T16:00:00'),
      reviewer: 'Mike Davis',
      recurringMeetingId: fridayMeeting.id,
      meetingDay: MeetingDay.FRIDAY,
      submissionUrl: null,
      feedback: null,
    },
  })

  const assignment4 = await prisma.assignment.create({
    data: {
      title: 'Valuation Model',
      description: 'Build a DCF valuation model for a mid-cap company.',
      type: 'Modeling',
      company: 'FinanceGroup',
      sector: 'Financial Services',
      dueDate: new Date('2026-04-30T14:00:00'),
      reviewer: 'Emily Chen',
      recurringMeetingId: mondayMeeting.id,
      meetingDay: MeetingDay.MONDAY,
      submissionUrl: null,
      feedback: null,
    },
  })

  const assignment5 = await prisma.assignment.create({
    data: {
      title: 'Industry Overview',
      description: 'Provide a comprehensive overview of the healthcare industry.',
      type: 'Research',
      company: 'HealthCo',
      sector: 'Healthcare',
      dueDate: new Date('2026-05-02T15:00:00'),
      reviewer: 'David Lee',
      recurringMeetingId: wednesdayMeeting.id,
      meetingDay: MeetingDay.WEDNESDAY,
      submissionUrl: null,
      feedback: null,
    },
  })

  console.log('Created assignments:', { assignment1, assignment2, assignment3, assignment4, assignment5 })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
