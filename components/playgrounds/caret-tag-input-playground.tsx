"use client"

import { useState } from "react"

import {
  PlaygroundShell,
  RangeControl,
  toJsx,
} from "@/components/docs/playground-controls"
import { CaretTagInput } from "@/registry/relic/ui/caret-tag-input"

const START = ["design", "motion"]

export function CaretTagInputPlayground() {
  const [max, setMax] = useState(6)
  const [tags, setTags] = useState<string[]>(START)

  return (
    <PlaygroundShell
      onReset={() => {
        setMax(6)
        setTags(START)
      }}
      preview={
        <div className="w-full max-w-sm">
          <CaretTagInput label="Topics" value={tags} onValueChange={setTags} max={max} />
          <p className="mt-2 text-xs text-muted-foreground">
            {tags.length} / {max} tags · try adding a duplicate
          </p>
        </div>
      }
      controls={
        <RangeControl label="max" value={max} min={1} max={12} onChange={setMax} />
      }
      code={toJsx("CaretTagInput", { label: "Topics", max }, {})}
    />
  )
}
