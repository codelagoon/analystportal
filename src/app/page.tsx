import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Analyst Portal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Weekly meeting system with recurring Zoom sessions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Student Portal</CardTitle>
              <CardDescription>
                View your assignments, submit work, and join review meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access your assignment list, view details, and join Zoom meetings for your scheduled review sessions.
                </p>
                <Link href="/assignments">
                  <Button className="w-full" size="lg">
                    View Assignments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription>
                Manage recurring meetings and assignment scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure Monday, Wednesday, and Friday recurring Zoom meetings. Link assignments to meeting days.
                </p>
                <Link href="/admin/recurring-meetings">
                  <Button className="w-full" size="lg" variant="outline">
                    Manage Meetings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <h3 className="font-semibold mb-1">Recurring Meetings</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Three weekly Zoom meetings (Mon, Wed, Fri) for review sessions
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🔗</div>
                  <h3 className="font-semibold mb-1">Link Assignments</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Assignments are tagged with a meeting day for scheduled reviews
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold mb-1">One Click Join</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Students see the correct recurring meeting link on each assignment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
