import { NextRequest, NextResponse } from 'next/server'
import { toApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { requireEmail, requireString } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await prisma.analystUser.findUnique({ where: { id } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to fetch user')
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
    const user = await prisma.analystUser.update({
      where: { id },
      data: {
        name: requireString(body.name, 'Name'),
        email: requireEmail(body.email),
        role: requireString(body.role, 'Role'),
        cohort: requireString(body.cohort, 'Cohort'),
        status: requireString(body.status, 'Status'),
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to update user')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.analystUser.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const apiError = toApiError(error, 'Failed to delete user')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}