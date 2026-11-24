import { HotspotMap } from "@/registry/relic/ui/hotspot-map"

/** A small pretend landing page for the heat to sit on. */
export function MockPage() {
  return (
    <div className="flex aspect-[16/10] w-full flex-col gap-3 bg-background p-4 select-none">
      <div className="flex items-center justify-between">
        <span className="h-3 w-14 rounded bg-foreground/80" />
        <span className="flex gap-2">
          <span className="h-2 w-8 rounded bg-muted-foreground/30" />
          <span className="h-2 w-8 rounded bg-muted-foreground/30" />
          <span className="h-2 w-8 rounded bg-muted-foreground/30" />
        </span>
      </div>
      <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <span className="h-4 w-3/5 rounded bg-foreground/80" />
        <span className="h-2 w-2/5 rounded bg-muted-foreground/30" />
        <span className="mt-2 flex gap-2">
          <span className="h-6 w-20 rounded-md bg-primary" />
          <span className="h-6 w-20 rounded-md border" />
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <span className="h-10 rounded-md bg-muted" />
        <span className="h-10 rounded-md bg-muted" />
        <span className="h-10 rounded-md bg-muted" />
      </div>
    </div>
  )
}

/** Pretend recorded clicks, the same on server and client. */
function seeded(n: number) {
  let s = 7
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  const spots = [
    { x: 0.43, y: 0.62, w: 9 }, // the main button
    { x: 0.6, y: 0.62, w: 3 },
    { x: 0.1, y: 0.07, w: 3 }, // the logo
    { x: 0.72, y: 0.07, w: 2 },
    { x: 0.5, y: 0.88, w: 2 },
    { x: 0.5, y: 0.42, w: 2 }, // the headline, which isn't a link
  ]
  const total = spots.reduce((t, spot) => t + spot.w, 0)
  const out = []
  for (let i = 0; i < n; i++) {
    let pick = rand() * total
    let spot = spots[0]
    for (const candidate of spots) {
      pick -= candidate.w
      if (pick <= 0) {
        spot = candidate
        break
      }
    }
    out.push({ x: spot.x + (rand() - 0.5) * 0.12, y: spot.y + (rand() - 0.5) * 0.08, t: i })
  }
  return out
}

export const clicks = seeded(160)

export default function HotspotMapDemo() {
  return (
    <div className="w-full max-w-lg">
      <HotspotMap points={clicks} replay>
        <MockPage />
      </HotspotMap>
    </div>
  )
}
