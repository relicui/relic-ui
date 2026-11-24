"use client"

import { useState } from "react"

import {
  PlaygroundShell,
  RangeControl,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { SeekerSearch, type SeekerItem } from "@/registry/relic/ui/seeker-search"

const FRUIT = [
  "Apple", "Apricot", "Banana", "Blackberry", "Blueberry", "Cherry", "Coconut",
  "Grape", "Lemon", "Mango", "Orange", "Peach", "Pear", "Raspberry", "Strawberry",
]
const items: SeekerItem[] = FRUIT.map((f) => ({ value: f.toLowerCase(), label: f }))
const placeholders = ["Search fruit…", "Try “berry”…", "Try “ap”…"]

const DEFAULTS = { maxResults: 6 }

export function SeekerSearchPlayground() {
  const [o, setO] = useState(DEFAULTS)

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <div className="w-full max-w-sm pb-48">
          <SeekerSearch items={items} placeholders={placeholders} shortcut="" {...o} />
        </div>
      }
      controls={
        <RangeControl label="maxResults" value={o.maxResults} min={1} max={10} onChange={(v) => setO({ ...o, maxResults: v })} />
      }
      code={toJsx(
        "SeekerSearch",
        {
          items: raw("items"),
          placeholders: raw(JSON.stringify(placeholders)),
          ...o,
          onSelect: raw("(item) => console.log(item)"),
        },
        DEFAULTS
      )}
    />
  )
}
