"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
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

const DEFAULTS = {
  size: "default" as "sm" | "default" | "lg",
  variant: "default" as "default" | "ghost" | "underline",
  maxResults: 6,
  typeSpeed: 55,
  highlightMatches: true,
}

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
        <>
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <OptionGroup label="variant" options={["default", "ghost", "underline"] as const} value={o.variant} onChange={(v) => setO({ ...o, variant: v })} />
          <RangeControl label="maxResults" value={o.maxResults} min={1} max={10} onChange={(v) => setO({ ...o, maxResults: v })} />
          <RangeControl label="typeSpeed" value={o.typeSpeed} min={20} max={150} step={5} unit="ms" onChange={(v) => setO({ ...o, typeSpeed: v })} />
          <ToggleList>
            <Toggle label="highlightMatches" checked={o.highlightMatches} onChange={(v) => setO({ ...o, highlightMatches: v })} />
          </ToggleList>
        </>
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
