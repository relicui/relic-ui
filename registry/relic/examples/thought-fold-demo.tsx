import { ThoughtFold } from "@/registry/relic/ui/thought-fold"

const steps = [
  "Reading the question about the weekend trip.",
  "Checking the weather for Saturday and Sunday.",
  "Comparing two train times against the hotel check-in.",
  "Picking the earlier train, it leaves more time to explore.",
]

export default function ThoughtFoldDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ThoughtFold steps={steps} thinking defaultOpen />
      <ThoughtFold steps={steps} seconds={12} />
    </div>
  )
}
