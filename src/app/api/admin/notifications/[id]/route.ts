import { NextRequest, NextResponse } from 'next/server'
import { toApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.notification.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const apiError = toApiError(error, 'Failed to delete notification')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        active: Boolean(body.active),
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    const apiError = toApiError(error, 'Failed to update notification')
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}
