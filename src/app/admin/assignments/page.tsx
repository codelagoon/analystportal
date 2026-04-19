'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertBanner,
  AppShell,
  DataTable,
  EmptyState,
  Panel,
  SkeletonPanel,
  StatusPill,
} from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'

type AssignmentRecord = {
  id: string
  title: string
  description: string | null
  type: string | null
  company: string | null
  sector: string | null
  dueDate: string | null
  reviewer: string | null
  recurringMeetingId: string | null
  meetingDay: string | null
  submissionUrl: string | null
  feedback: string | null
}

type MeetingRecord = {
  id: string
  dayOfWeek: string
  title: string
  active: boolean
  scheduledTime: string | null
  zoomJoinUrl: string | null
}

type AssignmentDraft = {
  title: string
  description: string
  type: string
  company: string
  sector: string
  dueDate: string
  reviewer: string
  meetingDay: string
  recurringMeetingId: string
  submissionUrl: string
  feedback: string
}

const blankDraft: AssignmentDraft = {
  title: '',
  description: '',
  type: '',
  company: '',
  sector: '',
  dueDate: '',
  reviewer: '',
  meetingDay: 'Wednesday',
  recurringMeetingId: '',
  submissionUrl: '',
  feedback: '',
}

function displayMeetingDay(value: string | null | undefined) {
  if (!value) return 'Unassigned'
  const normalized = value.toLowerCase()
  if (normalized === 'monday') return 'Monday'
  if (normalized === 'wednesday') return 'Wednesday'
  if (normalized === 'friday') return 'Friday'
  return value
}

function toInputDateTime(value: string | null | undefined) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 16)
}

function fromInputDateTime(value: string) {
  return value ? new Date(value).toISOString() : ''
}

function validateAssignmentDraft(draft: AssignmentDraft) {
  if (!draft.title.trim()) return 'Title is required'
  if (!draft.reviewer.trim()) return 'Reviewer is required'
  if (!draft.dueDate.trim()) return 'Due date is required'
  if (!draft.meetingDay.trim()) return 'Meeting day is required'
  return null
}

export default function AdminAssignmentsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [meetings, setMeetings] = useState<MeetingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AssignmentDraft>(blankDraft)
  const [mode, setMode] = useState<'new' | 'edit' | 'idle'>('idle')

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => assignment.id === selectedId) ?? null,
    [assignments, selectedId]
  )

  const selectedMeeting = useMemo(
    () => meetings.find((meeting) => meeting.id === draft.recurringMeetingId) ?? null,
    [draft.recurringMeetingId, meetings]
  )

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadResources() {
      setLoading(true)
      setError(null)
      try {
        const [assignmentResponse, meetingResponse] = await Promise.all([
          fetch('/api/assignments', { signal: controller.signal, cache: 'no-store' }),
          fetch('/api/recurring-meetings', { signal: controller.signal, cache: 'no-store' }),
        ])

        if (!assignmentResponse.ok || !meetingResponse.ok) {
          throw new Error('Failed to load assignment workspace')
        }

        const assignmentPayload = (await assignmentResponse.json()) as AssignmentRecord[]
        const meetingPayload = (await meetingResponse.json()) as MeetingRecord[]
        setAssignments(assignmentPayload)
        setMeetings(meetingPayload)

        if (assignmentPayload.length > 0) {
          setSelectedId((current) => current ?? assignmentPayload[0].id)
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load assignment workspace')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadResources()

    return () => controller.abort()
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (selectedAssignment && mode === 'edit') {
      setDraft({
        title: selectedAssignment.title,
        description: selectedAssignment.description ?? '',
        type: selectedAssignment.type ?? '',
        company: selectedAssignment.company ?? '',
        sector: selectedAssignment.sector ?? '',
        dueDate: toInputDateTime(selectedAssignment.dueDate),
        reviewer: selectedAssignment.reviewer ?? '',
        meetingDay: displayMeetingDay(selectedAssignment.meetingDay),
        recurringMeetingId: selectedAssignment.recurringMeetingId ?? '',
        submissionUrl: selectedAssignment.submissionUrl ?? '',
        feedback: selectedAssignment.feedback ?? '',
      })
    }
  }, [mode, selectedAssignment])

  useEffect(() => {
    if (!draft.meetingDay) {
      return
    }

    const matchingMeeting = meetings.find((meeting) => displayMeetingDay(meeting.dayOfWeek) === draft.meetingDay)
    if (matchingMeeting && matchingMeeting.id !== draft.recurringMeetingId) {
      setDraft((current) => ({ ...current, recurringMeetingId: matchingMeeting.id }))
    }
  }, [draft.meetingDay, draft.recurringMeetingId, meetings])

  if (!isLoaded) {
    return (
      <AppShell section="admin" nav={adminNav} title="Assignments" subtitle="Create flow, reviewer assignment, due controls, weekly meeting day selector, archive actions">
        <SkeletonPanel />
        <SkeletonPanel />
      </AppShell>
    )
  }

  if (!isSignedIn) {
    return (
      <AppShell section="admin" nav={adminNav} title="Assignments" subtitle="Create flow, reviewer assignment, due controls, weekly meeting day selector, archive actions">
        <Panel title="Permission restricted" description="Sign in to manage assignment records.">
          <div className="space-y-3 text-sm text-zinc-300">
            <p>Assignments are read-only until you authenticate.</p>
            <SignInButton mode="modal">
              <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Sign In</Button>
            </SignInButton>
          </div>
        </Panel>
      </AppShell>
    )
  }

  async function loadAssignmentsAndMeetings() {
    const [assignmentResponse, meetingResponse] = await Promise.all([
      fetch('/api/assignments', { cache: 'no-store' }),
      fetch('/api/recurring-meetings', { cache: 'no-store' }),
    ])

    if (!assignmentResponse.ok || !meetingResponse.ok) {
      throw new Error('Failed to load assignment workspace')
    }

    const assignmentPayload = (await assignmentResponse.json()) as AssignmentRecord[]
    const meetingPayload = (await meetingResponse.json()) as MeetingRecord[]
    setAssignments(assignmentPayload)
    setMeetings(meetingPayload)
    setSelectedId((current) => current ?? assignmentPayload[0]?.id ?? null)
    return { assignmentPayload, meetingPayload }
  }

  function selectAssignment(assignment: AssignmentRecord) {
    setMode('edit')
    setSelectedId(assignment.id)
    setDraft({
      title: assignment.title,
      description: assignment.description ?? '',
      type: assignment.type ?? '',
      company: assignment.company ?? '',
      sector: assignment.sector ?? '',
      dueDate: toInputDateTime(assignment.dueDate),
      reviewer: assignment.reviewer ?? '',
      meetingDay: displayMeetingDay(assignment.meetingDay),
      recurringMeetingId: assignment.recurringMeetingId ?? '',
      submissionUrl: assignment.submissionUrl ?? '',
      feedback: assignment.feedback ?? '',
    })
    setSuccess(null)
    setError(null)
  }

  function startNewAssignment() {
    const defaultMeeting = meetings[0] ?? null
    setMode('new')
    setSelectedId(null)
    setDraft({
      ...blankDraft,
      recurringMeetingId: defaultMeeting?.id ?? '',
      meetingDay: displayMeetingDay(defaultMeeting?.dayOfWeek ?? 'Wednesday'),
    })
    setSuccess(null)
    setError(null)
  }

  function cancelChanges() {
    if (selectedAssignment) {
      selectAssignment(selectedAssignment)
      return
    }

    setMode('idle')
    setDraft(blankDraft)
  }

  async function saveAssignment() {
    const validationMessage = validateAssignmentDraft(draft)
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(mode === 'new' ? '/api/assignments' : `/api/assignments/${selectedId}`, {
        method: mode === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          dueDate: fromInputDateTime(draft.dueDate),
          recurringMeetingId: draft.recurringMeetingId || null,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to save assignment')
      }

      const savedAssignment = (await response.json()) as AssignmentRecord
      const { assignmentPayload } = await loadAssignmentsAndMeetings()
      const persisted = assignmentPayload.find((assignment) => assignment.id === savedAssignment.id) ?? savedAssignment
      setSelectedId(persisted.id)
      setMode('edit')
      setDraft({
        title: persisted.title,
        description: persisted.description ?? '',
        type: persisted.type ?? '',
        company: persisted.company ?? '',
        sector: persisted.sector ?? '',
        dueDate: toInputDateTime(persisted.dueDate),
        reviewer: persisted.reviewer ?? '',
        meetingDay: displayMeetingDay(persisted.meetingDay),
        recurringMeetingId: persisted.recurringMeetingId ?? '',
        submissionUrl: persisted.submissionUrl ?? '',
        feedback: persisted.feedback ?? '',
      })
      setSuccess('Assignment saved')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save assignment')
    } finally {
      setSaving(false)
    }
  }

  async function deleteAssignment() {
    if (!selectedId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/assignments/${selectedId}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to delete assignment')
      }

      const { assignmentPayload } = await loadAssignmentsAndMeetings()
      const nextAssignment = assignmentPayload[0] ?? null
      setSelectedId(nextAssignment?.id ?? null)
      setMode(nextAssignment ? 'edit' : 'idle')
      if (nextAssignment) {
        selectAssignment(nextAssignment)
      } else {
        setDraft(blankDraft)
      }
      setSuccess('Assignment deleted')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete assignment')
    } finally {
      setSaving(false)
    }
  }

  const tableRows = useMemo(
    () =>
      assignments.map((assignment) => [
        assignment.title,
        assignment.reviewer ?? '-',
        assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-',
        displayMeetingDay(assignment.meetingDay),
        <StatusPill key={`${assignment.id}-status`} label={assignment.feedback ? 'In Review' : 'Assigned'} />,
        <Button
          key={`${assignment.id}-action`}
          size="xs"
          variant="outline"
          className="border-zinc-700 bg-zinc-900 text-zinc-200"
          onClick={() => selectAssignment(assignment)}
        >
          {selectedId === assignment.id ? 'Selected' : 'Open'}
        </Button>,
      ]),
    [assignments, selectedId]
  )

  return (
    <AppShell section="admin" nav={adminNav} title="Assignments" subtitle="Create flow, reviewer assignment, due controls, weekly meeting day selector, archive actions">
      {error && <AlertBanner kind="error" title="Unable to save assignments" detail={error} />}
      {success && <AlertBanner kind="success" title="Assignments updated" detail={success} />}

      <Panel
        title="Create Assignment Flow"
        description="Draft details -> Assign reviewer -> Select Monday/Wednesday/Friday session -> Publish"
        actions={
          <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={startNewAssignment}>
            Create Assignment
          </Button>
        }
      >
        <div className="grid gap-2 md:grid-cols-4 text-sm text-zinc-300">
          <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Type selector</div>
          <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Reviewer assignment</div>
          <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Due date controls</div>
          <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">Meeting day: Mon/Wed/Fri</div>
        </div>
      </Panel>

      <Panel title="Assignment List" description="Status, reviewer, meeting day, and closure actions">
        {loading ? (
          <SkeletonPanel />
        ) : assignments.length === 0 ? (
          <EmptyState
            title="No assignments yet"
            detail="Create the first assignment to populate the work queue and unlock the reviewer workflow."
            action={
              <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={startNewAssignment}>
                Create Assignment
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={['Title', 'Reviewer', 'Due', 'Meeting Day', 'Status', 'Actions']}
            rows={tableRows}
          />
        )}
        <div className="mt-3 rounded border border-white/6 bg-white/[0.03] px-3 py-3 text-sm text-zinc-300">
          Active assignment panel: {selectedAssignment?.title ?? 'None selected'}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title={mode === 'new' ? 'Create Assignment' : 'Edit Assignment'} description="Save or cancel to apply the selected assignment record.">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="assignment-title">Title</Label>
              <Input id="assignment-title" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="assignment-description">Description</Label>
              <Textarea id="assignment-description" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-type">Type</Label>
              <Input id="assignment-type" value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-reviewer">Reviewer</Label>
              <Input id="assignment-reviewer" value={draft.reviewer} onChange={(event) => setDraft((current) => ({ ...current, reviewer: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-company">Company</Label>
              <Input id="assignment-company" value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-sector">Sector</Label>
              <Input id="assignment-sector" value={draft.sector} onChange={(event) => setDraft((current) => ({ ...current, sector: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-due">Due Date</Label>
              <Input id="assignment-due" type="datetime-local" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-meeting-day">Meeting Day</Label>
              <Input id="assignment-meeting-day" value={draft.meetingDay} onChange={(event) => setDraft((current) => ({ ...current, meetingDay: event.target.value }))} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="assignment-submission-url">Submission URL</Label>
              <Input id="assignment-submission-url" value={draft.submissionUrl} onChange={(event) => setDraft((current) => ({ ...current, submissionUrl: event.target.value }))} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="assignment-feedback">Feedback</Label>
              <Textarea id="assignment-feedback" value={draft.feedback} onChange={(event) => setDraft((current) => ({ ...current, feedback: event.target.value }))} />
            </div>
          </div>

          <div className="mt-4 rounded border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-300">
            <p className="text-zinc-100">Linked recurring session</p>
            <p className="mt-1 text-zinc-500">{selectedMeeting ? `${displayMeetingDay(selectedMeeting.dayOfWeek)} • ${selectedMeeting.title}` : 'No session linked yet'}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={saveAssignment} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200" onClick={cancelChanges} disabled={saving}>
              Cancel
            </Button>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200" onClick={deleteAssignment} disabled={saving || !selectedId}>
              Delete
            </Button>
          </div>
        </Panel>

        <Panel title="Session linkage" description="The selected meeting-day linkage controls where the assignment appears in the weekly review cadence.">
          <div className="space-y-2 text-sm text-zinc-300">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="rounded border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-zinc-100">{displayMeetingDay(meeting.dayOfWeek)}</p>
                  <StatusPill label={meeting.active ? 'Active' : 'Inactive'} />
                </div>
                <p className="mt-1 text-zinc-500">{meeting.title}</p>
                <p className="mt-1 text-zinc-500">{meeting.scheduledTime ?? 'No schedule set'}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
