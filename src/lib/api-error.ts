import { Prisma } from '@/generated/prisma/client'

type ApiError = {
  message: string
  status: number
}

const validationMessagePattern = /required|invalid|must be/i

export function toApiError(error: unknown, fallbackMessage: string): ApiError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return {
        message: 'A record with this value already exists',
        status: 409,
      }
    }

    if (error.code === 'P2025') {
      return {
        message: 'Record not found',
        status: 404,
      }
    }

    if (error.code === 'P2003') {
      return {
        message: 'Referenced record does not exist',
        status: 400,
      }
    }
  }

  if (error instanceof SyntaxError) {
    return {
      message: 'Request body must be valid JSON',
      status: 400,
    }
  }

  if (error instanceof Error && validationMessagePattern.test(error.message)) {
    return {
      message: error.message,
      status: 400,
    }
  }

  return {
    message: fallbackMessage,
    status: 500,
  }
}