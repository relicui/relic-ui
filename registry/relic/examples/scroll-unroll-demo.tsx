import { ScrollUnroll } from "@/registry/relic/ui/scroll-unroll"

export default function ScrollUnrollDemo() {
  return (
    <div className="w-full max-w-xs">
      <ScrollUnroll title="Read the decree" defaultOpen>
        <p className="font-semibold">Hear ye, builders of interfaces.</p>
        <p className="mt-2">
          Let every button be honest, every motion be gentle, and every
          component open to all, by keyboard and by touch.
        </p>
      </ScrollUnroll>
    </div>
  )
}
