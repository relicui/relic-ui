import { ArrowRight } from "lucide-react"

import { ShimmerButton } from "@/registry/relic/ui/shimmer-button"

export default function ShimmerButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <ShimmerButton>
        Get started <ArrowRight />
      </ShimmerButton>
      <ShimmerButton variant="outline">Learn more</ShimmerButton>
    </div>
  )
}
