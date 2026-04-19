'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertBanner,
  AppShell,
  DataTable,
  EmptyState,
  Panel,
  StatusPill,
  TableToolbar,
} from '@/components/terminal/ui-kit'
import { assignments, sidebarNav } from '@/lib/mock-terminal-data'

export default function AssignmentsPage() {
  const [view, setView] = useState<'table' | 'cards'>('table')

  const tableRows = useMemo(
    () =>
      assignments.map((assignment) => [
        assignment.title,
        assignment.type,
        assignment.company === '-' ? assignment.sector : `${assignment.company} / ${assignment.sector}`,
        assignment.reviewer,
        assignment.due,
        <StatusPill key={`${assignment.id}-status`} label={assignment.status} />,
        assignment.meetingDay,
        assignment.zoomAvailable ? <StatusPill key={`${assignment.id}-zoom`} label="Zoom Ready" /> : <StatusPill key={`${assignment.id}-zoom`} label="Zoom Missing" />,
        <Link key={`${assignment.id}-detail`} href={`/assignments/${assignment.id}`} className="text-emerald-300 hover:text-emerald-200">
          Open
        </Link>,
      ]),
    []
  )

  return (
    <AppShell
      nav={sidebarNav}
      title="Assignments / Work Queue"
      subtitle="This is the list of work you need to complete, who reviews it, and which recurring meeting it belongs to."
      rightRail={
        <>
          <Panel title="If this page is empty" description="What to do next">
            <EmptyState
              title="No assignments yet"
              detail="Assignments will appear here after your reviewer publishes them. Start by checking the Meetings / Calendar page to understand the weekly cadence."
            />
          </Panel>
          <Panel title="Archived assignment" description="Read-only reference item">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-400">
              Legacy valuation note (Q4) is archived and read-only.
              <div className="mt-2">
                <StatusPill label="Archived" />
              </div>
            </div>
          </Panel>
        </>
      }
    >
      <Panel title="How to use this page" description="Open the work due soonest, read the reviewer notes, then submit before the linked meeting.">
        <div className="space-y-2 text-sm text-zinc-300">
          <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">1. Open the assignment you need to finish first.</div>
          <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">2. Check who reviews it and which recurring session it maps to.</div>
          <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">3. Submit work, then watch for feedback in the assignment detail page.</div>
        </div>
      </Panel>

      <AlertBanner
        kind="warning"
        title="Friday meeting link is inactive"
        detail="The Friday recurring session has no valid join link in this demo. Any linked assignments will show Zoom Missing until it is fixed."
      />

      <TableToolbar />

      <Panel
        title="Work queue"
        description="Switch between a dense table or a card view when you want to scan work more slowly."
        actions={
          <div className="flex gap-1">
            <Button
              size="xs"
              variant={view === 'table' ? 'default' : 'outline'}
              onClick={() => setView('table')}
              className={view === 'table' ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'border-zinc-700 bg-zinc-900 text-zinc-200'}
            >
              Table View
            </Button>
            <Button
              size="xs"
              variant={view === 'cards' ? 'default' : 'outline'}
              onClick={() => setView('cards')}
              className={view === 'cards' ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'border-zinc-700 bg-zinc-900 text-zinc-200'}
            >
              Card View
            </Button>
          </div>
        }
      >
        {view === 'table' ? (
          <DataTable
            columns={[
              'Title',
              'Type',
              'Company / Sector',
              'Reviewer',
              'Due Date',
              'Status',
              'Weekly Meeting Day',
              'Zoom Availability',
              'Details',
            ]}
            rows={tableRows}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-100">{assignment.title}</p>
                  <StatusPill label={assignment.status} />
                </div>
                <div className="mt-2 space-y-1 text-xs text-zinc-500">
                  <p>Type: {assignment.type}</p>
                  <p>Linked: {assignment.company === '-' ? assignment.sector : `${assignment.company} / ${assignment.sector}`}</p>
                  <p>Reviewer: {assignment.reviewer}</p>
                  <p>Due: {assignment.due}</p>
                  <p>Weekly session: {assignment.meetingDay}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {assignment.zoomAvailable ? <StatusPill label="Zoom Ready" /> : <StatusPill label="Zoom Missing" />}
                  <Link href={`/assignments/${assignment.id}`}>
                    <Button size="xs" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  )
}
