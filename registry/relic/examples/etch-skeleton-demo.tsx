import { EtchSkeleton } from "@/registry/relic/ui/etch-skeleton"

export default function EtchSkeletonDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border p-5">
      <EtchSkeleton avatar lines={3} />
    </div>
  )
}
