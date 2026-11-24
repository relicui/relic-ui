import { ConfidenceText } from "@/registry/relic/ui/confidence-text"

const tokens = [
  { text: "The", confidence: 0.99 },
  { text: "Eiffel", confidence: 0.98 },
  { text: "Tower", confidence: 0.99 },
  { text: "was", confidence: 0.97 },
  { text: "finished", confidence: 0.93 },
  { text: "in", confidence: 0.95 },
  { text: "1889", confidence: 0.82 },
  { text: "and", confidence: 0.96 },
  { text: "is", confidence: 0.97 },
  { text: "about", confidence: 0.7 },
  { text: "330", confidence: 0.41 },
  { text: "metres", confidence: 0.88 },
  { text: "tall,", confidence: 0.9 },
  { text: "repainted", confidence: 0.74 },
  { text: "every", confidence: 0.66 },
  { text: "seven", confidence: 0.38 },
  { text: "years.", confidence: 0.85 },
]

export default function ConfidenceTextDemo() {
  return (
    <div className="w-full max-w-md text-[15px]">
      <ConfidenceText tokens={tokens} showLegend />
    </div>
  )
}
