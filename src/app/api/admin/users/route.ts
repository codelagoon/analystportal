import { NextRequest, NextResponse } from 'next/server'
import { toApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { requireEmail, requireString } from '@/lib/validation'

export async function GET() {
  try {
    const users = await prisma.analystUser.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to fetch users')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await prisma.analystUser.create({
      data: {
        name: requireString(body.name, 'Name'),
        email: requireEmail(body.email),
        role: requireString(body.role, 'Role'),
        cohort: requireString(body.cohort, 'Cohort'),
        status: requireString(body.status, 'Status'),
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    const apiError = toApiError(error, 'Failed to create user')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}