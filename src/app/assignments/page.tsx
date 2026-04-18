'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  description: string | null
  type: string | null
  company: string | null
  sector: string | null
  dueDate: string | null
  reviewer: string | null
  meetingDay: 'MONDAY' | 'WEDNESDAY' | 'FRIDAY' | null
  recurringMeeting: {
    id: string
    title: string
    zoomJoinUrl: string | null
    dayOfWeek: 'MONDAY' | 'WEDNESDAY' | 'FRIDAY'
  } | null
  submissionUrl: string | null
  feedback: string | null
  createdAt: string
  updatedAt: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments')
      const data = await response.json()
      setAssignments(data)
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getMeetingDayBadge = (meetingDay: string | null) => {
    if (!meetingDay) return null
    const colors: Record<string, string> = {
      MONDAY: 'bg-blue-500',
      WEDNESDAY: 'bg-green-500',
      FRIDAY: 'bg-purple-500',
    }
    return (
      <Badge className={colors[meetingDay] || 'bg-gray-500'}>
        {meetingDay}
      </Badge>
    )
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Assignments</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-xl">{assignment.title}</CardTitle>
                {getMeetingDayBadge(assignment.meetingDay)}
              </div>
              <CardDescription className="flex flex-wrap gap-2">
                {assignment.type && <Badge variant="outline">{assignment.type}</Badge>}
                {assignment.company && <Badge variant="outline">{assignment.company}</Badge>}
                {assignment.sector && <Badge variant="outline">{assignment.sector}</Badge>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignment.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                )}
                
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Due:</span> {formatDate(assignment.dueDate)}
                  </div>
                  {assignment.reviewer && (
                    <div>
                      <span className="font-medium">Reviewer:</span> {assignment.reviewer}
                    </div>
                  )}
                  {assignment.meetingDay && assignment.recurringMeeting && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Meeting:</span>
                      <span>{assignment.recurringMeeting.title}</span>
                      {assignment.recurringMeeting.zoomJoinUrl && (
                        <Badge variant="secondary" className="text-xs">
                          Zoom Available
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <Link href={`/assignments/${assignment.id}`}>
                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No assignments found</p>
        </div>
      )}
    </div>
  )
}
