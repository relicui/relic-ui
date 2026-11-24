import { CohortTide, type Cohort } from "@/registry/relic/ui/cohort-tide"

const STARTS = ["Jan 6", "Jan 13", "Jan 20", "Jan 27", "Feb 3", "Feb 10", "Feb 17", "Feb 24"]

/**
 * Pretend weekly retention. Calendar week 5 had a bad release, so every cohort
 * dips on the same diagonal. Try highlight="diagonal" to spot it.
 */
export const cohorts: Cohort[] = STARTS.map((label, r) => {
  const size = 900 + ((r * 137) % 500)
  const values: number[] = []
  for (let c = 0; c < STARTS.length - r; c++) {
    const base = c === 0 ? 1 : 0.62 * Math.pow(0.86, c - 1) + 0.04 * Math.sin(r + c)
    const badWeek = r + c === 5 && c > 0 ? 0.72 : 1
    values.push(Math.max(0, Math.min(1, base * badWeek)))
  }
  return { label, size, values }
})

export default function CohortTideDemo() {
  return (
    <div className="w-full max-w-2xl">
      <CohortTide cohorts={cohorts} highlight="diagonal" />
    </div>
  )
}
