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

  const users = [
    {
      email: 'maya@echelonequity.co',
      name: 'Maya Tran',
      role: 'Senior Analyst',
      cohort: 'Spring 2026',
      status: 'Active',
    },
    {
      email: 'alex@echelonequity.co',
      name: 'Alex Patel',
      role: 'Analyst',
      cohort: 'Spring 2026',
      status: 'Active',
    },
  ]

  for (const user of users) {
    await prisma.analystUser.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    })
  }

  await prisma.homepageSettings.upsert({
    where: { id: 'homepage-settings' },
    update: {
      bannerTitle: 'Weekly research briefings and live assignment reviews',
      bannerBody: 'Banner copy is managed from the admin homepage editor and reflected on the public landing page.',
      bannerStartAt: '2026-04-18T08:00:00.000Z',
      bannerEndAt: '2026-04-19T08:00:00.000Z',
    },
    create: {
      id: 'homepage-settings',
      bannerTitle: 'Weekly research briefings and live assignment reviews',
      bannerBody: 'Banner copy is managed from the admin homepage editor and reflected on the public landing page.',
      bannerStartAt: '2026-04-18T08:00:00.000Z',
      bannerEndAt: '2026-04-19T08:00:00.000Z',
    },
  })

  const homepageFeatures = [
    {
      id: 'homepage-feature-ai-capex',
      title: 'AI Infrastructure Capex: Cycle Duration and Margin Structure',
      author: 'M. Tran',
      status: 'Featured',
      position: 0,
      active: true,
    },
    {
      id: 'homepage-feature-managed-care',
      title: 'Managed Care Revision Risk in 2H26',
      author: 'A. Patel',
      status: 'Queued',
      position: 1,
      active: true,
    },
    {
      id: 'homepage-feature-renewables',
      title: 'Renewable Yield Vehicles and Cost of Capital Compression',
      author: 'S. Carter',
      status: 'Featured',
      position: 2,
      active: true,
    },
  ]

  for (const feature of homepageFeatures) {
    await prisma.homepageFeature.upsert({
      where: { id: feature.id },
      update: feature,
      create: feature,
    })
  }

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
