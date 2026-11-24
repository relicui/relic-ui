"use client"

import { useState } from "react"

import { SuggestionDiff } from "@/registry/relic/ui/suggestion-diff"

export default function SuggestionDiffDemo() {
  // Changing the key replays the suggestion.
  const [round, setRound] = useState(0)

  return (
    <div className="w-full max-w-md">
      <SuggestionDiff
        key={round}
        original="Our components is fast and they works in every browsers."
        suggestion="Our components are fast and they work in every browser."
      />
      <button
        type="button"
        onClick={() => setRound((r) => r + 1)}
        className="mt-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Replay
      </button>
    </div>
  )
}
