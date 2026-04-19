import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AppShell, Panel } from '@/components/terminal/ui-kit'
import { sidebarNav } from '@/lib/navigation'

export default function NotFound() {
  return (
    <AppShell nav={sidebarNav} title="Company not found" subtitle="The requested ticker does not exist in the current research universe.">
      <Panel title="Unsupported company" description="Check the ticker and try again.">
        <div className="space-y-3 text-sm text-zinc-300">
          <p>This page only exists for known company profiles.</p>
          <Link href="/terminal">
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Return to dashboard</Button>
          </Link>
        </div>
      </Panel>
    </AppShell>
  )
}