import { SkeletonPanel } from '@/components/terminal/ui-kit'

export default function Loading() {
  return (
    <div className="space-y-4 p-4 xl:p-6">
      <SkeletonPanel />
      <SkeletonPanel />
    </div>
  )
}