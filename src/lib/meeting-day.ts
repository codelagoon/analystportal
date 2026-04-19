import { MeetingDay as PrismaMeetingDay } from '@/generated/prisma/client'

export const displayMeetingDays = ['Monday', 'Wednesday', 'Friday'] as const

export type DisplayMeetingDay = (typeof displayMeetingDays)[number]

const displayToPrisma: Record<DisplayMeetingDay, PrismaMeetingDay> = {
  Monday: PrismaMeetingDay.MONDAY,
  Wednesday: PrismaMeetingDay.WEDNESDAY,
  Friday: PrismaMeetingDay.FRIDAY,
}

const prismaToDisplay: Record<PrismaMeetingDay, DisplayMeetingDay> = {
  [PrismaMeetingDay.MONDAY]: 'Monday',
  [PrismaMeetingDay.WEDNESDAY]: 'Wednesday',
  [PrismaMeetingDay.FRIDAY]: 'Friday',
}

export function toPrismaMeetingDay(day: DisplayMeetingDay): PrismaMeetingDay {
  return displayToPrisma[day]
}

export function fromPrismaMeetingDay(day: PrismaMeetingDay): DisplayMeetingDay {
  return prismaToDisplay[day]
}

export function isDisplayMeetingDay(value: unknown): value is DisplayMeetingDay {
  return typeof value === 'string' && displayMeetingDays.includes(value as DisplayMeetingDay)
}