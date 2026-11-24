import { CorrelationMatrix } from "@/registry/relic/ui/correlation-matrix"

export const shopLabels = ["Price", "Rating", "Delivery days", "Discount", "Reviews", "Returns", "Repeat buys"]

// Upper half only; the full matrix is mirrored below.
const UPPER: Record<string, number> = {
  "0-1": 0.12, "0-2": 0.05, "0-3": -0.68, "0-4": -0.08, "0-5": 0.41, "0-6": -0.35,
  "1-2": -0.58, "1-3": 0.1, "1-4": 0.72, "1-5": -0.64, "1-6": 0.69,
  "2-3": 0.02, "2-4": -0.31, "2-5": 0.47, "2-6": -0.52,
  "3-4": 0.22, "3-5": -0.18, "3-6": 0.38,
  "4-5": -0.42, "4-6": 0.55,
  "5-6": -0.61,
}

export const shopMatrix = shopLabels.map((_, i) =>
  shopLabels.map((__, j) => (i === j ? 1 : UPPER[`${Math.min(i, j)}-${Math.max(i, j)}`]))
)

export default function CorrelationMatrixDemo() {
  return (
    <div className="w-full max-w-md">
      <CorrelationMatrix labels={shopLabels} values={shopMatrix} order="clustered" />
    </div>
  )
}
