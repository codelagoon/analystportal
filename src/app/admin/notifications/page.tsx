'use client'

import { useEffect, useState } from 'react'
import { AppShell, AlertBanner, DataTable, EmptyState, Panel, SkeletonPanel, StatusPill } from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type NotificationRecord = {
  id: string
  kind: 'ASSIGNMENT' | 'MEETING' | 'SECTOR'
  title: string
  preview: string
  href: string
  active: boolean
  createdAt: string
}

type NotificationDraft = {
  kind: 'ASSIGNMENT' | 'MEETING' | 'SECTOR'
  title: string
  preview: string
  href: string
  active: boolean
}

const blankDraft: NotificationDraft = {
  kind: 'ASSIGNMENT',
  title: '',
  preview: '',
  href: '/assignments',
  active: true,
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [draft, setDraft] = useState<NotificationDraft>(blankDraft)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function loadNotifications() {
    const response = await fetch('/api/admin/notifications', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to load notifications')
    }

    const payload = (await response.json()) as NotificationRecord[]
    setNotifications(payload)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/notifications', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load notifications')
        }

        const payload = (await response.json()) as NotificationRecord[]
        if (!cancelled) {
          setNotifications(payload)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load notifications')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    const intervalId = window.setInterval(() => {
      void loadNotifications().catch(() => {
        // Ignore transient polling errors.
      })
    }, 10000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  async function createNotification() {
    if (!draft.title.trim() || !draft.preview.trim() || !draft.href.trim()) {
      setError('Kind, title, preview, and link are required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to create notification')
      }

      await loadNotifications()
      setDraft(blankDraft)
      setSuccess('Notification created')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create notification')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(id: string, active: boolean) {
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to update notification')
      }

      await loadNotifications()
      setSuccess(active ? 'Notification activated' : 'Notification paused')
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Failed to update notification')
    }
  }

  async function deleteNotification(id: string) {
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to delete notification')
      }

      await loadNotifications()
      setSuccess('Notification deleted')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete notification')
    }
  }

  return (
    <AppShell section="admin" nav={adminNav} title="Notifications" subtitle="System notification templates and dispatch controls">
      {error && <AlertBanner kind="error" title="Notification action failed" detail={error} />}
      {success && <AlertBanner kind="success" title="Notifications updated" detail={success} />}

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Create Notification" description="Push a new alert to analyst dashboards">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="notification-kind">Kind (ASSIGNMENT, MEETING, SECTOR)</Label>
              <Input
                id="notification-kind"
                value={draft.kind}
                onChange={(event) => setDraft((current) => ({ ...current, kind: event.target.value.toUpperCase() as NotificationDraft['kind'] }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notification-link">Link</Label>
              <Input
                id="notification-link"
                value={draft.href}
                onChange={(event) => setDraft((current) => ({ ...current, href: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="notification-title">Title</Label>
              <Input
                id="notification-title"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="notification-preview">Preview</Label>
              <Input
                id="notification-preview"
                value={draft.preview}
                onChange={(event) => setDraft((current) => ({ ...current, preview: event.target.value }))}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={createNotification} disabled={saving}>
              {saving ? 'Publishing...' : 'Publish Notification'}
            </Button>
            <Button
              variant="outline"
              className="border-zinc-700 bg-zinc-900 text-zinc-200"
              onClick={() => setDraft(blankDraft)}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </Panel>

        <Panel title="Active Notifications" description="Manage currently published alerts">
          {loading ? (
            <SkeletonPanel />
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              detail="Create a notification to broadcast assignment, meeting, or sector updates to users."
            />
          ) : (
            <DataTable
              columns={['Kind', 'Title', 'Preview', 'Link', 'Status', 'Actions']}
              rows={notifications.map((notification) => [
                notification.kind,
                notification.title,
                notification.preview,
                notification.href,
                <StatusPill key={`${notification.id}-status`} label={notification.active ? 'Active' : 'Paused'} />,
                <div key={`${notification.id}-actions`} className="flex gap-1">
                  <Button
                    size="xs"
                    variant="outline"
                    className="border-zinc-700 bg-zinc-900 text-zinc-200"
                    onClick={() => toggleActive(notification.id, !notification.active)}
                  >
                    {notification.active ? 'Pause' : 'Activate'}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    className="border-zinc-700 bg-zinc-900 text-zinc-200"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    Delete
                  </Button>
                </div>,
              ])}
            />
          )}
        </Panel>
      </div>
    </AppShell>
  )
}
