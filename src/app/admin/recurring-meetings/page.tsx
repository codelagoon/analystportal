'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { useEffect, useMemo, useRef, useState } from 'react'
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

type MeetingRecord = {
  id: string
  dayOfWeek: string
  title: string
  zoomMeetingId: string | null
  zoomJoinUrl: string | null
  zoomStartUrl: string | null
  scheduledTime: string | null
  active: boolean
  notes: string | null
  assignments?: Array<{ id: string }>
  _count?: { assignments: number }
}

function getLinkedAssignmentsCount(meeting: MeetingRecord) {
  if (Array.isArray(meeting.assignments)) {
    return meeting.assignments.length
  }

  if (meeting._count && typeof meeting._count.assignments === 'number') {
    return meeting._count.assignments
  }

  return 0
}

type MeetingDraft = {
  dayOfWeek: string
  title: string
  zoomMeetingId: string
  zoomJoinUrl: string
  zoomStartUrl: string
  scheduledTime: string
  active: boolean
  notes: string
}

const blankDraft: MeetingDraft = {
  dayOfWeek: 'Monday',
  title: '',
  zoomMeetingId: '',
  zoomJoinUrl: '',
  zoomStartUrl: '',
  scheduledTime: '',
  active: true,
  notes: '',
}

function displayMeetingDay(value: string | null | undefined) {
  if (!value) return 'Unassigned'
  const normalized = value.toLowerCase()
  if (normalized === 'monday') return 'Monday'
  if (normalized === 'wednesday') return 'Wednesday'
  if (normalized === 'friday') return 'Friday'
  return value
}

function validateMeetingDraft(draft: MeetingDraft) {
  if (!draft.dayOfWeek.trim()) return 'Day of week is required'
  if (!draft.title.trim()) return 'Title is required'
  return null
}

export default function RecurringMeetingsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [meetings, setMeetings] = useState<MeetingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<MeetingDraft>(blankDraft)
  const [mode, setMode] = useState<'new' | 'edit' | 'idle'>('idle')
  const hydratedSelectionRef = useRef<string | null>(null)

  const selectedMeeting = useMemo(
    () => meetings.find((meeting) => meeting.id === selectedId) ?? null,
    [meetings, selectedId]
  )

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadMeetings() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/recurring-meetings', { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load recurring meetings')
        }

        const payload = (await response.json()) as MeetingRecord[]
        setMeetings(payload)
        if (payload.length > 0) {
          setSelectedId((current) => current ?? payload[0].id)
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load recurring meetings')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadMeetings()

    return () => controller.abort()
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (selectedMeeting && mode === 'edit') {
      if (hydratedSelectionRef.current === selectedMeeting.id) {
        return
      }

      setDraft({
        dayOfWeek: displayMeetingDay(selectedMeeting.dayOfWeek),
        title: selectedMeeting.title,
        zoomMeetingId: selectedMeeting.zoomMeetingId ?? '',
        zoomJoinUrl: selectedMeeting.zoomJoinUrl ?? '',
        zoomStartUrl: selectedMeeting.zoomStartUrl ?? '',
        scheduledTime: selectedMeeting.scheduledTime ?? '',
        active: selectedMeeting.active,
        notes: selectedMeeting.notes ?? '',
      })
      hydratedSelectionRef.current = selectedMeeting.id
    }
  }, [mode, selectedMeeting])

  const tableRows = useMemo(
    () =>
      meetings.map((meeting) => [
        displayMeetingDay(meeting.dayOfWeek),
        <StatusPill key={`${meeting.id}-active`} label={meeting.active ? 'Active' : 'Inactive'} />,
        meeting.zoomJoinUrl ? <StatusPill key={`${meeting.id}-join`} label="Configured" /> : <StatusPill key={`${meeting.id}-join`} label="Missing" />,
        meeting.scheduledTime ?? '-',
        meeting.notes ?? '-',
        `${getLinkedAssignmentsCount(meeting)}`,
        <Button
          key={`${meeting.id}-edit`}
          size="xs"
          variant="outline"
          className="border-zinc-700 bg-zinc-900 text-zinc-200"
          onClick={() => selectMeeting(meeting)}
        >
          Edit
        </Button>,
      ]),
    [meetings]
  )

  useEffect(() => {
    if (!isLoaded || !isSignedIn || saving) {
      return
    }

    const intervalId = window.setInterval(() => {
      void loadMeetings().catch(() => {
        // Silent retry loop for cross-user sync updates.
      })
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [isLoaded, isSignedIn, saving])

  if (!isLoaded) {
    return (
      <AppShell section="admin" nav={adminNav} title="Recurring Sessions (Admin)" subtitle="This controls the Monday, Wednesday, and Friday schedule analysts join from Meetings / Calendar.">
        <SkeletonPanel />
        <SkeletonPanel />
      </AppShell>
    )
  }

  if (!isSignedIn) {
    return (
      <AppShell section="admin" nav={adminNav} title="Recurring Sessions (Admin)" subtitle="This controls the Monday, Wednesday, and Friday schedule analysts join from Meetings / Calendar.">
        <Panel title="Permission restricted" description="Sign in to manage recurring meetings.">
          <div className="space-y-3 text-sm text-zinc-300">
            <p>Recurring sessions are read-only until you authenticate.</p>
            <SignInButton mode="modal">
              <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Sign In</Button>
            </SignInButton>
          </div>
        </Panel>
      </AppShell>
    )
  }

  async function loadMeetings() {
    const response = await fetch('/api/recurring-meetings', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to load recurring meetings')
    }

    const payload = (await response.json()) as MeetingRecord[]
    setMeetings(payload)
    setSelectedId((current) => current ?? payload[0]?.id ?? null)
    return payload
  }

  function selectMeeting(meeting: MeetingRecord) {
    hydratedSelectionRef.current = meeting.id
    setMode('edit')
    setSelectedId(meeting.id)
    setDraft({
      dayOfWeek: displayMeetingDay(meeting.dayOfWeek),
      title: meeting.title,
      zoomMeetingId: meeting.zoomMeetingId ?? '',
      zoomJoinUrl: meeting.zoomJoinUrl ?? '',
      zoomStartUrl: meeting.zoomStartUrl ?? '',
      scheduledTime: meeting.scheduledTime ?? '',
      active: meeting.active,
      notes: meeting.notes ?? '',
    })
    setSuccess(null)
    setError(null)
  }

  function startNewMeeting() {
    hydratedSelectionRef.current = null
    setMode('new')
    setSelectedId(null)
    setDraft(blankDraft)
    setSuccess(null)
    setError(null)
  }

  function cancelChanges() {
    if (selectedMeeting) {
      selectMeeting(selectedMeeting)
      return
    }

    hydratedSelectionRef.current = null
    setMode('idle')
    setDraft(blankDraft)
  }

  async function saveMeeting() {
    const validationMessage = validateMeetingDraft(draft)
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(mode === 'new' ? '/api/recurring-meetings' : `/api/recurring-meetings/${selectedId}`, {
        method: mode === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to save meeting')
      }

      const savedMeeting = (await response.json()) as MeetingRecord
      const refreshedMeetings = await loadMeetings()
      const persisted = refreshedMeetings.find((meeting) => meeting.id === savedMeeting.id) ?? savedMeeting
      setSelectedId(persisted.id)
      setMode('edit')
      setDraft({
        dayOfWeek: displayMeetingDay(persisted.dayOfWeek),
        title: persisted.title,
        zoomMeetingId: persisted.zoomMeetingId ?? '',
        zoomJoinUrl: persisted.zoomJoinUrl ?? '',
        zoomStartUrl: persisted.zoomStartUrl ?? '',
        scheduledTime: persisted.scheduledTime ?? '',
        active: persisted.active,
        notes: persisted.notes ?? '',
      })
      setSuccess('Recurring meeting saved')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save recurring meeting')
    } finally {
      setSaving(false)
    }
  }

  async function deleteMeeting() {
    if (!selectedId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/recurring-meetings/${selectedId}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to delete recurring meeting')
      }

      const deletePayload = (await response.json()) as { success: boolean; unlinkedAssignments?: number }

      const refreshedMeetings = await loadMeetings()
      const nextMeeting = refreshedMeetings[0] ?? null
      setSelectedId(nextMeeting?.id ?? null)
      setMode(nextMeeting ? 'edit' : 'idle')
      if (nextMeeting) {
        selectMeeting(nextMeeting)
      } else {
        setDraft(blankDraft)
      }
      const unlinkedCount = deletePayload.unlinkedAssignments ?? 0
      setSuccess(
        unlinkedCount > 0
          ? `Recurring meeting deleted and ${unlinkedCount} linked assignments were unassigned`
          : 'Recurring meeting deleted'
      )
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete recurring meeting')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell section="admin" nav={adminNav} title="Recurring Sessions (Admin)" subtitle="This controls the Monday, Wednesday, and Friday schedule analysts join from Meetings / Calendar.">
      {error && <AlertBanner kind="error" title="Unable to save recurring meetings" detail={error} />}
      {success && <AlertBanner kind="success" title="Recurring meetings updated" detail={success} />}

      <AlertBanner
        kind="warning"
        title="Friday session inactive"
        detail="If the Friday meeting is left without a join URL, analysts will see the inactive state in the terminal Meetings page."
      />

      <Panel
        title="Weekly session controls"
        description="Set the active state, join URL, start URL, schedule, and notes for each recurring review."
        actions={
          <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={startNewMeeting}>
            Add Session
          </Button>
        }
      >
        {loading ? (
          <SkeletonPanel />
        ) : meetings.length === 0 ? (
          <EmptyState
            title="No recurring meetings yet"
            detail="Create the first weekly review session so assignments can attach to it."
            action={
              <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={startNewMeeting}>
                Create Session
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={['Day', 'Active / Inactive', 'Join URL State', 'Scheduled Time', 'Notes', 'Linked Assignments', 'Actions']}
            rows={tableRows}
          />
        )}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        {mode !== 'idle' ? (
          <Panel title={mode === 'new' ? 'Create Session' : 'Edit Session'} description="Save or cancel to apply the selected recurring meeting record.">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="meeting-day">Day of Week</Label>
              <Input id="meeting-day" value={draft.dayOfWeek} onChange={(event) => setDraft((current) => ({ ...current, dayOfWeek: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-title">Title</Label>
              <Input id="meeting-title" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-id">Zoom Meeting ID</Label>
              <Input id="meeting-id" value={draft.zoomMeetingId} onChange={(event) => setDraft((current) => ({ ...current, zoomMeetingId: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-time">Scheduled Time</Label>
              <Input id="meeting-time" value={draft.scheduledTime} onChange={(event) => setDraft((current) => ({ ...current, scheduledTime: event.target.value }))} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="meeting-join-url">Join URL</Label>
              <Input id="meeting-join-url" value={draft.zoomJoinUrl} onChange={(event) => setDraft((current) => ({ ...current, zoomJoinUrl: event.target.value }))} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="meeting-notes">Notes</Label>
              <Textarea id="meeting-notes" value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant={draft.active ? 'default' : 'outline'} className={draft.active ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'border-zinc-700 bg-zinc-900 text-zinc-200'} onClick={() => setDraft((current) => ({ ...current, active: !current.active }))}>
              {draft.active ? 'Active' : 'Inactive'}
            </Button>
            <StatusPill label={draft.active ? 'Active meeting' : 'Inactive meeting'} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={saveMeeting} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200" onClick={cancelChanges} disabled={saving}>
              Cancel
            </Button>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200" onClick={deleteMeeting} disabled={saving || !selectedId}>
              Delete
            </Button>
          </div>
          </Panel>
        ) : (
          <Panel title="Select a session to edit" description="Click Edit on a row, or Add Session to create a new recurring meeting.">
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">Use Edit to modify an existing recurring meeting.</div>
              <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">Use Add Session to create a new recurring meeting.</div>
            </div>
          </Panel>
        )}

        <Panel title="Session linkage" description="Assignments inherit their cadence from these recurring sessions.">
          <div className="space-y-2 text-sm text-zinc-300">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="rounded border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-zinc-100">{displayMeetingDay(meeting.dayOfWeek)}</p>
                  <StatusPill label={meeting.active ? 'Active' : 'Inactive'} />
                </div>
                <p className="mt-1 text-zinc-500">{meeting.title}</p>
                <p className="mt-1 text-zinc-500">{getLinkedAssignmentsCount(meeting)} linked assignments</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
