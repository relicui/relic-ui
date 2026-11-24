import { WeekPulse } from "@/registry/relic/ui/week-pulse"

/** Busy weekday office hours, a small evening bump, a later and calmer weekend. */
export const weekData = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const weekend = d >= 5
    const peak = weekend ? 14 : 11
    const curve = Math.exp(-((h - peak) ** 2) / (weekend ? 30 : 18))
    const evening = Math.exp(-((h - 20) ** 2) / 6) * 0.45
    const noise = ((d * 31 + h * 17) % 11) / 30
    return Math.round((curve + evening + noise) * (weekend ? 60 : 100))
  })
)

export default function WeekPulseDemo() {
  return (
    <div className="w-full max-w-2xl">
      <WeekPulse data={weekData} />
    </div>
  )
}
