'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertBanner,
  AppShell,
  MiniStat,
  Panel,
  StatusPill,
  Timeline,
} from '@/components/terminal/ui-kit'
import { sidebarNav } from '@/lib/mock-terminal-data'

export default function AssignmentDetailPage() {
  const [saved, setSaved] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [joined, setJoined] = useState(false)

  return (
    <AppShell
      nav={sidebarNav}
      title="Assignment: Quarterly Model Refresh: NVDA"
      subtitle="Model update due Apr 22 at 9:00 PM. Reviewed by D. Alvarez in the Wednesday recurring session."
      rightRail={
        <>
          <Panel title="Reviewer feedback" description="This is where comments from your reviewer will appear.">
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">
                Add sensitivity framing for margin normalization in bear case.
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-900/70 p-2.5">
                Reconcile valuation bridge assumptions with latest peer set.
              </div>
            </div>
          </Panel>

          <Panel title="Submission history" description="Track each handoff so you know what was sent and when.">
            <Timeline
              entries={[
                { title: 'Initial package uploaded', detail: 'Analyst submission', at: 'Apr 17 9:02 PM' },
                { title: 'Revision requested', detail: 'Reviewer comments', at: 'Apr 18 8:44 AM' },
                { title: 'Revised model resubmitted', detail: 'Pending review', at: 'Apr 18 2:15 PM' },
              ]}
            />
          </Panel>
        </>
      }
    >
      <div className="flex items-center gap-2">
        <Link href="/assignments">
          <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-900 text-zinc-200">
            Back to Assignments
          </Button>
        </Link>
        <StatusPill label="In Review" />
      </div>

      <AlertBanner
        kind="info"
        title="This work is reviewed in the Wednesday session"
        detail="It is part of the recurring weekly meeting cadence, so you do not schedule a separate meeting for it."
      />

      <Panel title="At a glance" description="Read this first before opening the file attachments or reviewer notes.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Deliverable" value="Model refresh + thesis update" />
          <MiniStat label="Due" value="Apr 22, 9:00 PM" />
          <MiniStat label="Reviewer" value="D. Alvarez" />
          <MiniStat label="Meeting" value="Wednesday review session" />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="What this assignment asks for" description="The work itself, in plain language.">
          <div className="space-y-2 text-sm text-zinc-300">
            <p>
              Refresh model assumptions for NVDA with updated demand checks, margin sensitivity,
              and valuation bridge relative to peer revisions.
            </p>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">
              <p>Linked company: NVIDIA</p>
              <p>Linked sector: Semiconductors</p>
              <p>Reviewer: D. Alvarez</p>
              <p>Due date: Apr 22, 9:00 PM</p>
            </div>
          </div>
        </Panel>

        <Panel title="Deliverables checklist" description="Use this as your finish line before you submit.">
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2">Updated assumptions tab</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2">Three-scenario valuation bridge</div>
              <div className="rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2">One-page thesis update note</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2">Risks and catalysts update</div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Submission area" description="Upload the final file, add the document link, and write a short handoff note.">
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">1. Upload the final workbook or model file.</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">2. Paste the document URL.</div>
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">3. Add a handoff note for the reviewer.</div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700 bg-zinc-900 text-zinc-200"
              onClick={() => setSaved(true)}
            >
              Save Draft
            </Button>
            <Button
              size="sm"
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              onClick={() => setSubmitted(true)}
            >
              Submit Work
            </Button>
          </div>
          {(saved || submitted) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {saved && <StatusPill label="Draft Saved" />}
              {submitted && <StatusPill label="Submission queued" />}
            </div>
          )}
        </Panel>

        <Panel title="Meeting session" description="This assignment is discussed in the recurring Wednesday review.">
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">
              <p className="text-zinc-100">Wednesday Session • 8:00 PM ET</p>
              <p className="mt-1 text-zinc-500">Assignments linked: 24</p>
              <p className="mt-1 text-zinc-500">Join URL status: Configured</p>
            </div>
            <Button
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              onClick={() => setJoined(true)}
            >
              {joined ? 'Session Joined' : 'Join Recurring Zoom Session'}
            </Button>
            {joined && <StatusPill label="Joined live session" />}
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
