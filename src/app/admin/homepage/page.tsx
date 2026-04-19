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
  EmptyState,
  Panel,
  SkeletonPanel,
  StatusPill,
} from '@/components/terminal/ui-kit'
import { adminNav } from '@/lib/navigation'

type HomepageSettingsRecord = {
  id: string
  bannerTitle: string
  bannerBody: string
  bannerStartAt: string | null
  bannerEndAt: string | null
}

type HomepageFeatureRecord = {
  id: string
  title: string
  author: string
  status: string
  position: number
  active: boolean
}

type HomepageDraft = {
  bannerTitle: string
  bannerBody: string
  bannerStartAt: string
  bannerEndAt: string
}

type FeatureDraft = {
  id: string
  title: string
  author: string
  status: string
  position: number
  active: boolean
}

const blankSettings: HomepageDraft = {
  bannerTitle: '',
  bannerBody: '',
  bannerStartAt: '',
  bannerEndAt: '',
}

function sortFeatures(features: FeatureDraft[]) {
  return [...features].sort((left, right) => left.position - right.position)
}

export default function AdminHomepagePage() {
  const { isLoaded, isSignedIn } = useUser()
  const [settings, setSettings] = useState<HomepageDraft>(blankSettings)
  const [features, setFeatures] = useState<FeatureDraft[]>([])
  const [baseline, setBaseline] = useState<{ settings: HomepageDraft; features: FeatureDraft[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [bannerPreviewed, setBannerPreviewed] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadHomepage() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/homepage', { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load homepage controls')
        }

        const payload = (await response.json()) as {
          settings: HomepageSettingsRecord | null
          features: HomepageFeatureRecord[]
        }

        const nextSettings = payload.settings
          ? {
              bannerTitle: payload.settings.bannerTitle,
              bannerBody: payload.settings.bannerBody,
              bannerStartAt: payload.settings.bannerStartAt ?? '',
              bannerEndAt: payload.settings.bannerEndAt ?? '',
            }
          : blankSettings

        const nextFeatures = sortFeatures(
          payload.features.map((feature) => ({
            id: feature.id,
            title: feature.title,
            author: feature.author,
            status: feature.status,
            position: feature.position,
            active: feature.active,
          }))
        )

        setSettings(nextSettings)
        setFeatures(nextFeatures)
        setBaseline({ settings: nextSettings, features: nextFeatures })
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load homepage controls')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadHomepage()

    return () => controller.abort()
  }, [isLoaded, isSignedIn])

  const hasChanges = useMemo(() => {
    if (!baseline) return false
    return JSON.stringify(baseline.settings) !== JSON.stringify(settings) || JSON.stringify(sortFeatures(baseline.features)) !== JSON.stringify(sortFeatures(features))
  }, [baseline, features, settings])

  if (!isLoaded) {
    return (
      <AppShell section="admin" nav={adminNav} title="Homepage Controls" subtitle="Featured research, featured analysts, market modules, and announcement banner editor">
        <SkeletonPanel />
        <SkeletonPanel />
      </AppShell>
    )
  }

  if (!isSignedIn) {
    return (
      <AppShell section="admin" nav={adminNav} title="Homepage Controls" subtitle="Featured research, featured analysts, market modules, and announcement banner editor">
        <Panel title="Permission restricted" description="Sign in to manage homepage content.">
          <div className="space-y-3 text-sm text-zinc-300">
            <p>The homepage content surface is read-only until you authenticate.</p>
            <SignInButton mode="modal">
              <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Sign In</Button>
            </SignInButton>
          </div>
        </Panel>
      </AppShell>
    )
  }

  async function loadHomepage() {
    const response = await fetch('/api/admin/homepage', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to load homepage controls')
    }

    const payload = (await response.json()) as {
      settings: HomepageSettingsRecord | null
      features: HomepageFeatureRecord[]
    }

    const nextSettings = payload.settings
      ? {
          bannerTitle: payload.settings.bannerTitle,
          bannerBody: payload.settings.bannerBody,
          bannerStartAt: payload.settings.bannerStartAt ?? '',
          bannerEndAt: payload.settings.bannerEndAt ?? '',
        }
      : blankSettings

    const nextFeatures = sortFeatures(
      payload.features.map((feature) => ({
        id: feature.id,
        title: feature.title,
        author: feature.author,
        status: feature.status,
        position: feature.position,
        active: feature.active,
      }))
    )

    setSettings(nextSettings)
    setFeatures(nextFeatures)
    setBaseline({ settings: nextSettings, features: nextFeatures })
    return { settings: nextSettings, features: nextFeatures }
  }

  function addFeatureRow() {
    setFeatures((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: '',
        author: '',
        status: 'Queued',
        position: current.length,
        active: true,
      },
    ])
    setSuccess(null)
    setError(null)
  }

  function removeFeatureRow(id: string) {
    setFeatures((current) => sortFeatures(current.filter((feature) => feature.id !== id)).map((feature, index) => ({ ...feature, position: index })))
    setSuccess(null)
    setError(null)
  }

  function cancelChanges() {
    if (baseline) {
      setSettings(baseline.settings)
      setFeatures(baseline.features)
    }
  }

  async function saveHomepage() {
    if (!settings.bannerTitle.trim()) {
      setError('Banner title is required')
      return
    }
    if (!settings.bannerBody.trim()) {
      setError('Banner body is required')
      return
    }

    const invalidFeature = features.find((feature) => !feature.title.trim() || !feature.author.trim() || !feature.status.trim())
    if (invalidFeature) {
      setError('Every featured research row needs a title, author, and status')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          features: sortFeatures(features),
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Failed to save homepage controls')
      }

      await loadHomepage()
      setSuccess('Homepage content saved')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save homepage controls')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell section="admin" nav={adminNav} title="Homepage Controls" subtitle="Featured research, featured analysts, market modules, and announcement banner editor">
      {error && <AlertBanner kind="error" title="Unable to save homepage controls" detail={error} />}
      {success && <AlertBanner kind="success" title="Homepage updated" detail={success} />}

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Featured Research Controls" description="Pin and order homepage modules" actions={<Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={addFeatureRow}>Add Research Row</Button>}>
          {loading ? (
            <SkeletonPanel />
          ) : features.length === 0 ? (
            <EmptyState
              title="No featured research yet"
              detail="Add the first featured note to populate the homepage and give the public landing page a real content source."
              action={<Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={addFeatureRow}>Add Row</Button>}
            />
          ) : (
            <div className="space-y-3">
              {sortFeatures(features).map((feature, index) => (
                <div key={feature.id} className="rounded border border-zinc-800 bg-zinc-900/70 p-3">
                  <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_0.8fr_0.6fr]">
                    <div className="space-y-1.5">
                      <Label htmlFor={`feature-title-${feature.id}`}>Title</Label>
                      <Input id={`feature-title-${feature.id}`} value={feature.title} onChange={(event) => setFeatures((current) => current.map((row) => (row.id === feature.id ? { ...row, title: event.target.value } : row)))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`feature-author-${feature.id}`}>Author</Label>
                      <Input id={`feature-author-${feature.id}`} value={feature.author} onChange={(event) => setFeatures((current) => current.map((row) => (row.id === feature.id ? { ...row, author: event.target.value } : row)))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`feature-status-${feature.id}`}>Status</Label>
                      <Input id={`feature-status-${feature.id}`} value={feature.status} onChange={(event) => setFeatures((current) => current.map((row) => (row.id === feature.id ? { ...row, status: event.target.value } : row)))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`feature-position-${feature.id}`}>Position</Label>
                      <Input
                        id={`feature-position-${feature.id}`}
                        value={String(feature.position)}
                        onChange={(event) => setFeatures((current) => current.map((row) => (row.id === feature.id ? { ...row, position: Number.isFinite(Number(event.target.value)) ? Number(event.target.value) : index } : row)))}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant={feature.active ? 'default' : 'outline'}
                      className={feature.active ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'border-zinc-700 bg-zinc-900 text-zinc-200'}
                      onClick={() => setFeatures((current) => current.map((row) => (row.id === feature.id ? { ...row, active: !row.active } : row)))}
                    >
                      {feature.active ? 'Active' : 'Inactive'}
                    </Button>
                    <StatusPill label={feature.status} />
                    <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200" onClick={() => removeFeatureRow(feature.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Announcement Banner Editor" description="Global homepage messaging">
          {loading ? (
            <SkeletonPanel />
          ) : (
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="space-y-1.5">
                <Label htmlFor="banner-title">Banner title</Label>
                <Input id="banner-title" value={settings.bannerTitle} onChange={(event) => setSettings((current) => ({ ...current, bannerTitle: event.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="banner-body">Banner body</Label>
                <Textarea id="banner-body" value={settings.bannerBody} onChange={(event) => setSettings((current) => ({ ...current, bannerBody: event.target.value }))} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="banner-start">Start</Label>
                  <Input id="banner-start" value={settings.bannerStartAt} onChange={(event) => setSettings((current) => ({ ...current, bannerStartAt: event.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="banner-end">End</Label>
                  <Input id="banner-end" value={settings.bannerEndAt} onChange={(event) => setSettings((current) => ({ ...current, bannerEndAt: event.target.value }))} />
                </div>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-900/70 p-3">
                <p className="font-medium text-zinc-100">Banner preview</p>
                <p className="mt-1 text-zinc-500">{settings.bannerTitle || 'Homepage banner title'}</p>
                <p className="mt-1 text-zinc-500">{settings.bannerBody || 'Banner body will appear here after save.'}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusPill label={bannerPreviewed ? 'Preview Open' : 'Preview Ready'} />
                  <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200" onClick={() => setBannerPreviewed((current) => !current)}>
                    {bannerPreviewed ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={saveHomepage} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200" onClick={cancelChanges} disabled={saving || !hasChanges}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  )
}
