import { MilestoneRoad, type GrowthPoint } from "@/registry/relic/ui/milestone-road"

/** Pretend growth: a fixed start date so the page renders the same everywhere. */
export const growth: GrowthPoint[] = Array.from({ length: 300 }, (_, d) => ({
  date: new Date(Date.UTC(2026, 0, 1) + d * 86_400_000),
  count: Math.round(400 + d * 30 + Math.pow(d, 2) * 0.45),
}))

export default function MilestoneRoadDemo() {
  const now = growth[growth.length - 1].count
  return (
    <div className="w-full max-w-xl">
      <MilestoneRoad count={now} history={growth} marker="MR" />
    </div>
  )
}
