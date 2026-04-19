import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect('/')
  }

  try {
    // Get the user's primary email address
    const userEmail = user.emailAddresses[0]?.emailAddress

    if (!userEmail) {
      redirect('/terminal')
    }

    // Check if user exists in the database as an analyst
    const analystUser = await prisma.analystUser.findUnique({
      where: {
        email: userEmail,
      },
    })

    if (analystUser) {
      // User is an analyst
      redirect('/terminal')
    }

    // User is not an analyst, treat as admin
    redirect('/admin')
  } catch {
    // Fallback to terminal if there's an error checking
    redirect('/terminal')
  }
}
