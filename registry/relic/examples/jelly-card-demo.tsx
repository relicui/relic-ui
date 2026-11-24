import { JellyCard } from "@/registry/relic/ui/jelly-card"

export default function JellyCardDemo() {
  return (
    <JellyCard className="w-64 cursor-grab active:cursor-grabbing">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">Press &amp; drag</p>
      <p className="mt-2 text-lg font-semibold">I&apos;m made of jelly</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Squish me, pull me around, then let go and watch me wobble.
      </p>
    </JellyCard>
  )
}
