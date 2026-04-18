'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface RecurringMeeting {
  id: string
  dayOfWeek: 'MONDAY' | 'WEDNESDAY' | 'FRIDAY'
  title: string
  zoomMeetingId: string | null
  zoomJoinUrl: string | null
  zoomStartUrl: string | null
  scheduledTime: string | null
  active: boolean
  notes: string | null
  assignments: any[]
  createdAt: string
  updatedAt: string
}

export default function RecurringMeetingsPage() {
  const [meetings, setMeetings] = useState<RecurringMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMeeting, setEditingMeeting] = useState<RecurringMeeting | null>(null)
  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY' as 'MONDAY' | 'WEDNESDAY' | 'FRIDAY',
    title: '',
    zoomMeetingId: '',
    zoomJoinUrl: '',
    zoomStartUrl: '',
    scheduledTime: '',
    active: true,
    notes: '',
  })

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/recurring-meetings')
      const data = await response.json()
      setMeetings(data)
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingMeeting
        ? `/api/recurring-meetings/${editingMeeting.id}`
        : '/api/recurring-meetings'
      const method = editingMeeting ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchMeetings()
        setEditingMeeting(null)
        setFormData({
          dayOfWeek: 'MONDAY',
          title: '',
          zoomMeetingId: '',
          zoomJoinUrl: '',
          zoomStartUrl: '',
          scheduledTime: '',
          active: true,
          notes: '',
        })
      }
    } catch (error) {
      console.error('Failed to save meeting:', error)
    }
  }

  const handleEdit = (meeting: RecurringMeeting) => {
    setEditingMeeting(meeting)
    setFormData({
      dayOfWeek: meeting.dayOfWeek,
      title: meeting.title,
      zoomMeetingId: meeting.zoomMeetingId || '',
      zoomJoinUrl: meeting.zoomJoinUrl || '',
      zoomStartUrl: meeting.zoomStartUrl || '',
      scheduledTime: meeting.scheduledTime || '',
      active: meeting.active,
      notes: meeting.notes || '',
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return
    try {
      await fetch(`/api/recurring-meetings/${id}`, { method: 'DELETE' })
      await fetchMeetings()
    } catch (error) {
      console.error('Failed to delete meeting:', error)
    }
  }

  const handleCancel = () => {
    setEditingMeeting(null)
    setFormData({
      dayOfWeek: 'MONDAY',
      title: '',
      zoomMeetingId: '',
      zoomJoinUrl: '',
      zoomStartUrl: '',
      scheduledTime: '',
      active: true,
      notes: '',
    })
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Recurring Meetings</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingMeeting ? 'Edit Meeting' : 'Create New Meeting'}</CardTitle>
          <CardDescription>
            {editingMeeting
              ? 'Update the recurring meeting details'
              : 'Create a new recurring weekly meeting'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, dayOfWeek: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONDAY">Monday</SelectItem>
                    <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                    <SelectItem value="FRIDAY">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="scheduledTime">Scheduled Time</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="zoomMeetingId">Zoom Meeting ID</Label>
                <Input
                  id="zoomMeetingId"
                  value={formData.zoomMeetingId}
                  onChange={(e) => setFormData({ ...formData, zoomMeetingId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="zoomJoinUrl">Zoom Join URL</Label>
                <Input
                  id="zoomJoinUrl"
                  type="url"
                  value={formData.zoomJoinUrl}
                  onChange={(e) => setFormData({ ...formData, zoomJoinUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="zoomStartUrl">Zoom Start URL</Label>
                <Input
                  id="zoomStartUrl"
                  type="url"
                  value={formData.zoomStartUrl}
                  onChange={(e) => setFormData({ ...formData, zoomStartUrl: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingMeeting ? 'Update' : 'Create'}</Button>
              {editingMeeting && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className={!meeting.active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{meeting.title}</CardTitle>
                <Badge variant={meeting.active ? 'default' : 'secondary'}>
                  {meeting.dayOfWeek}
                </Badge>
              </div>
              <CardDescription>
                {meeting.scheduledTime && `at ${meeting.scheduledTime}`}
                {meeting.active ? '' : ' (Inactive)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {meeting.zoomJoinUrl && (
                  <div>
                    <span className="font-medium">Join URL:</span>{' '}
                    <a
                      href={meeting.zoomJoinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
                {meeting.zoomMeetingId && (
                  <div>
                    <span className="font-medium">Meeting ID:</span> {meeting.zoomMeetingId}
                  </div>
                )}
                {meeting.notes && (
                  <div>
                    <span className="font-medium">Notes:</span> {meeting.notes}
                  </div>
                )}
                <div>
                  <span className="font-medium">Linked Assignments:</span>{' '}
                  {meeting.assignments.length}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(meeting)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(meeting.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
