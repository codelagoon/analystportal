'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AppShell, AlertBanner, DataTable, EmptyState, Panel, SkeletonPanel, StatusPill } from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'

type UserRecord = {
  id: string
  name: string
  email: string
  role: string
  cohort: string
  status: string
}

type DraftUser = {
  name: string
  email: string
  role: string
  cohort: string
  status: string
}

const emptyDraft: DraftUser = {
  name: '',
  email: '',
  role: '',
  cohort: '',
  status: 'Active',
}

function validateUserDraft(draft: DraftUser) {
  if (!draft.name.trim()) return 'Name is required'
  if (!draft.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return 'Email is required and must be valid'
  if (!draft.role.trim()) return 'Role is required'
  if (!draft.cohort.trim()) return 'Cohort is required'
  if (!draft.status.trim()) return 'Status is required'
  return null
}

export default function AdminUsersPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftUser>(emptyDraft)
  const [mode, setMode] = useState<'new' | 'edit' | 'idle'>('idle')

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedId) ?? null,
    [selectedId, users]
  )

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadUsers() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/users', { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load users')
        }
        const payload = (await response.json()) as UserRecord[]
        setUsers(payload)
        if (payload.length > 0) {
          setSelectedId((current) => current ?? payload[0].id)
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load users')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadUsers()

    return () => controller.abort()
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (selectedUser && mode === 'edit') {
      setDraft({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        cohort: selectedUser.cohort,
        status: selectedUser.status,
      })
    }
  }, [mode, selectedUser])

  if (!isLoaded) {
    return (
      <AppShell section="admin" nav={adminNav} title="Users" subtitle="Roles, cohort controls, status toggles, and user detail drawer states">
        <SkeletonPanel />
        <SkeletonPanel />
      </AppShell>
    )
  }

  if (!isSignedIn) {
    return (
      <AppShell section="admin" nav={adminNav} title="Users" subtitle="Roles, cohort controls, status toggles, and user detail drawer states">
        <Panel title="Permission restricted" description="Sign in to manage analyst users.">
          <div className="space-y-3 text-sm text-zinc-300">
            <p>This admin surface is read-only until you authenticate.</p>
            <SignInButton mode="modal">
              <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Sign In</Button>
            </SignInButton>
          </div>
        </Panel>
      </AppShell>
    )
  }

  async function loadUsers() {
    const response = await fetch('/api/admin/users', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to load users')
    }

    const payload = (await response.json()) as UserRecord[]
    setUsers(payload)
    setSelectedId((current) => current ?? payload[0]?.id ?? null)
    return payload
  }

  function selectUser(user: UserRecord) {
    setMode('edit')
    setSelectedId(user.id)
    setDraft({
      name: user.name,
      email: user.email,
      role: user.role,
      cohort: user.cohort,
      status: user.status,
    })
    setSuccess(null)
    setError(null)
  }

  function startNewUser() {
    setMode('new')
    setSelectedId(null)
    setDraft(emptyDraft)
    setSuccess(null)
    setError(null)
  }

  function cancelChanges() {
    if (selectedUser) {
      setMode('edit')
      setDraft({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        cohort: selectedUser.cohort,
        status: selectedUser.status,
      })
      return
    }

    setMode('idle')
    setDraft(emptyDraft)
  }

  async function saveUser() {
    const validationMessage = validateUserDraft(draft)
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(mode === 'new' ? '/api/admin/users' : `/api/admin/users/${selectedId}`, {
        method: mode === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to save user')
      }

      const savedUser = (await response.json()) as UserRecord
      const refreshedUsers = await loadUsers()
      const persisted = refreshedUsers.find((user) => user.id === savedUser.id) ?? savedUser
      setSelectedId(persisted.id)
      setMode('edit')
      setDraft({
        name: persisted.name,
        email: persisted.email,
        role: persisted.role,
        cohort: persisted.cohort,
        status: persisted.status,
      })
      setSuccess('User saved')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  async function deleteUserById(id: string) {
    if (!id) {
      return
    }

    setSaving(true)
    setDeletingId(id)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to delete user')
      }

      const refreshedUsers = await loadUsers()
      const nextUser = refreshedUsers[0] ?? null
      setSelectedId(nextUser?.id ?? null)
      setMode(nextUser ? 'edit' : 'idle')
      if (nextUser) {
        setDraft({
          name: nextUser.name,
          email: nextUser.email,
          role: nextUser.role,
          cohort: nextUser.cohort,
          status: nextUser.status,
        })
      } else {
        setDraft(emptyDraft)
      }
      setSuccess('User deleted')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete user')
    } finally {
      setSaving(false)
      setDeletingId(null)
    }
  }

  async function deleteUser() {
    if (!selectedId) {
      return
    }

    const userToDelete = users.find((user) => user.id === selectedId)
    const confirmed = window.confirm(
      `Delete ${userToDelete?.name ?? 'this user'}? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    await deleteUserById(selectedId)
  }

  const tableRows = useMemo(
    () =>
      users.map((user) => [
        user.name,
        user.email,
        <StatusPill key={`${user.id}-role`} label={user.role} />,
        user.cohort,
        <StatusPill key={`${user.id}-status`} label={user.status} />,
        <div key={`${user.id}-actions`} className="flex gap-1">
          <Button
            size="xs"
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-200"
            onClick={() => selectUser(user)}
            disabled={saving}
          >
            Edit
          </Button>
          <Button
            size="xs"
            variant="outline"
            className="border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
            disabled={saving}
            onClick={async () => {
              const confirmed = window.confirm(`Delete ${user.name}? This action cannot be undone.`)
              if (!confirmed) {
                return
              }

              await deleteUserById(user.id)
            }}
          >
            {deletingId === user.id ? 'Deleting...' : 'Delete'}
          </Button>
        </div>,
      ]),
    [users, saving, deletingId]
  )

  return (
    <AppShell section="admin" nav={adminNav} title="Users" subtitle="Roles, cohort controls, status toggles, and user detail drawer states">
      {error && <AlertBanner kind="error" title="Unable to save users" detail={error} />}
      {success && <AlertBanner kind="success" title="Users updated" detail={success} />}

      <Panel
        title="User Table"
        description="Role badges and cohort assignment controls"
        actions={
          <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={startNewUser}>
            Invite User
          </Button>
        }
      >
        {loading ? (
          <SkeletonPanel />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users yet"
            detail="Create the first analyst account to unlock the editing and review workflow."
            action={
              <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={startNewUser}>
                Create User
              </Button>
            }
          />
        ) : (
          <DataTable columns={['Name', 'Email', 'Role', 'Cohort', 'Status', 'Actions']} rows={tableRows} />
        )}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title={mode === 'new' ? 'Create User' : 'Edit User'} description="Save or cancel to apply the selected user record.">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Name</Label>
              <Input id="user-name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-role">Role</Label>
              <Input id="user-role" value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-cohort">Cohort</Label>
              <Input id="user-cohort" value={draft.cohort} onChange={(event) => setDraft((current) => ({ ...current, cohort: event.target.value }))} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="user-status">Status</Label>
              <Input id="user-status" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={saveUser} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200" onClick={cancelChanges} disabled={saving}>
              Cancel
            </Button>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200" onClick={deleteUser} disabled={saving || !selectedId}>
              Delete
            </Button>
          </div>
        </Panel>

        <Panel title="Active user drawer" description="The selected user record is what the rest of the admin controls edit.">
          {selectedUser ? (
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">
                <p className="text-zinc-100">{selectedUser.name}</p>
                <p className="mt-1 text-zinc-500">{selectedUser.email}</p>
                <p className="mt-1 text-zinc-500">{selectedUser.role} • {selectedUser.cohort}</p>
              </div>
              <StatusPill label={selectedUser.status} />
            </div>
          ) : (
            <EmptyState
              title="No user selected"
              detail="Pick a row or create a new user to open the editor drawer."
            />
          )}
        </Panel>
      </div>
    </AppShell>
  )
}
