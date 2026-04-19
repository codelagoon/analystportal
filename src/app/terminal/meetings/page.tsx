"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AppShell, DataTable, MiniStat, Panel, StatusPill } from '@/components/terminal/ui-kit'
import { recurringMeetings, sidebarNav, assignments } from '@/lib/mock-terminal-data'

export default function MeetingsPage() {
  const nextMeeting = recurringMeetings.find((meeting) => meeting.day === 'Wednesday') ?? recurringMeetings[0]
  const [joined, setJoined] = useState(false)

  return (
    <AppShell
      nav={sidebarNav}
      title="Meetings / Calendar"
      subtitle="Recurring weekly review sessions. Use this page to see the next meeting, join the correct Zoom link, and understand how assignments map to each session."
      rightRail={
        <Panel title="How meetings work" description="A weekly workflow, not a one-off event">
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">Monday, Wednesday, and Friday are recurring analyst review sessions.</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">Assignments are tied to one of these sessions, so you do not schedule a separate meeting.</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">Use the join button on the next active session. The Friday link is inactive in this demo.</div>
          </div>
        </Panel>
      }
    >
      <Panel title="Start with the next meeting" description="Join the upcoming session, then return here for the weekly schedule.">
        <div className="grid gap-3 md:grid-cols-3">
          <MiniStat label="Next up" value={`${nextMeeting.day} • ${nextMeeting.scheduled}`} />
          <MiniStat label="Linked assignments" value={`${nextMeeting.linkedAssignments}`} />
          <MiniStat label="Join link" value={nextMeeting.joinUrlState} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill label="Recurring weekly session" />
          <StatusPill label="Assignment-linked" />
          <Link href="/assignments">
            <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
              View assignments tied to this cadence
            </Button>
          </Link>
          <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={() => setJoined(true)}>
            {joined ? 'Meeting Joined' : 'Join next meeting'}
          </Button>
        </div>
        {joined && (
          <div className="mt-3 rounded border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
            The next recurring session is now marked as joined. Return here to confirm the cadence or open linked assignments.
          </div>
        )}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        {recurringMeetings.map((meeting) => (
          <Panel
            key={meeting.day}
            title={meeting.day}
            description={meeting.active ? 'Active recurring session' : 'Inactive in this demo'}
          >
            <div className="space-y-2 text-sm text-zinc-300">
              <MiniStat label="Meeting time" value={meeting.scheduled} />
              <MiniStat label="Join URL" value={meeting.joinUrlState} />
              <MiniStat label="Linked assignments" value={`${meeting.linkedAssignments}`} />
              <p className="rounded border border-zinc-800 bg-zinc-900/70 p-3 text-zinc-400">{meeting.notes}</p>
              <div className="flex items-center justify-between gap-2">
                <StatusPill label={meeting.active ? 'Active' : 'Inactive'} />
                <Link href="/assignments">
                  <Button size="xs" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                    See linked work
                  </Button>
                </Link>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="Assignments by session" description="Quick view of how work flows into each recurring meeting.">
        <DataTable
          columns={['Assignment', 'Meeting Day', 'Reviewer', 'Due', 'Status']}
          rows={assignments.map((assignment) => [
            assignment.title,
            assignment.meetingDay,
            assignment.reviewer,
            assignment.due,
            <StatusPill key={assignment.id} label={assignment.status} />,
          ])}
        />
      </Panel>
    </AppShell>
  )
}
