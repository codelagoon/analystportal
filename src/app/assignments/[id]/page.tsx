'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
    zoomStartUrl: string | null
    zoomMeetingId: string | null
    scheduledTime: string | null
    dayOfWeek: 'MONDAY' | 'WEDNESDAY' | 'FRIDAY'
    notes: string | null
  } | null
  submissionUrl: string | null
  feedback: string | null
  createdAt: string
  updatedAt: string
}

export default function AssignmentDetailPage() {
  const params = useParams()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submissionText, setSubmissionText] = useState('')

  useEffect(() => {
    fetchAssignment()
  }, [params.id])

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.id}`)
      const data = await response.json()
      setAssignment(data)
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmission = async () => {
    if (!assignment) return
    try {
      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assignment,
          submissionUrl: submissionText,
        }),
      })
      if (response.ok) {
        await fetchAssignment()
        setSubmissionText('')
        alert('Submission saved!')
      }
    } catch (error) {
      console.error('Failed to save submission:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (!assignment) {
    return <div className="p-8">Assignment not found</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/assignments" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Assignments
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
              <CardDescription className="flex flex-wrap gap-2">
                {assignment.type && <Badge variant="outline">{assignment.type}</Badge>}
                {assignment.company && <Badge variant="outline">{assignment.company}</Badge>}
                {assignment.sector && <Badge variant="outline">{assignment.sector}</Badge>}
                {getMeetingDayBadge(assignment.meetingDay)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assignment.description && (
            <p className="text-gray-700 mb-4">{assignment.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Due Date:</span>{' '}
              {formatDate(assignment.dueDate)}
            </div>
            {assignment.reviewer && (
              <div>
                <span className="font-medium">Reviewer:</span> {assignment.reviewer}
              </div>
            )}
            {assignment.company && (
              <div>
                <span className="font-medium">Company:</span> {assignment.company}
              </div>
            )}
            {assignment.sector && (
              <div>
                <span className="font-medium">Sector:</span> {assignment.sector}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {assignment.recurringMeeting && (
        <Card className="mb-6 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📅</span>
              <span>Meeting Details</span>
            </CardTitle>
            <CardDescription>
              {assignment.recurringMeeting.title} - {assignment.recurringMeeting.dayOfWeek}
              {assignment.recurringMeeting.scheduledTime && ` at ${assignment.recurringMeeting.scheduledTime}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignment.recurringMeeting.zoomJoinUrl && (
                <div>
                  <Button
                    asChild
                    className="w-full md:w-auto"
                    size="lg"
                  >
                    <a
                      href={assignment.recurringMeeting.zoomJoinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Zoom Meeting
                    </a>
                  </Button>
                </div>
              )}
              
              <div className="text-sm space-y-1">
                {assignment.recurringMeeting.zoomMeetingId && (
                  <div>
                    <span className="font-medium">Meeting ID:</span> {assignment.recurringMeeting.zoomMeetingId}
                  </div>
                )}
                {assignment.recurringMeeting.notes && (
                  <div>
                    <span className="font-medium">Meeting Notes:</span> {assignment.recurringMeeting.notes}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Submission</CardTitle>
          <CardDescription>Submit your work for this assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignment.submissionUrl && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ You have submitted: <a href={assignment.submissionUrl} target="_blank" rel="noopener noreferrer" className="underline">{assignment.submissionUrl}</a>
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="submission">Submission URL</Label>
              <Textarea
                id="submission"
                placeholder="Enter the URL to your submission (e.g., Google Drive, GitHub, etc.)"
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button onClick={handleSubmission} disabled={!submissionText.trim()}>
              Submit Assignment
            </Button>
          </div>
        </CardContent>
      </Card>

      {assignment.feedback && (
        <Card className="mb-6 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💬</span>
              <span>Feedback</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{assignment.feedback}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assignment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(assignment.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {new Date(assignment.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
