"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { StretchTabs } from "@/registry/relic/ui/stretch-tabs"

const items = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "settings", label: "Settings" },
]

const DEFAULTS = {
  variant: "pill" as "pill" | "underline",
  size: "default" as "sm" | "default" | "lg",
  stretch: "normal" as "subtle" | "normal" | "elastic",
}

export function StretchTabsPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const set = <K extends keyof typeof DEFAULTS>(k: K, v: (typeof DEFAULTS)[K]) =>
    setO((prev) => ({ ...prev, [k]: v }))

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <StretchTabs aria-label="Playground tabs" items={items} {...o} />
      }
      controls={
        <>
          <OptionGroup label="variant" options={["pill", "underline"] as const} value={o.variant} onChange={(v) => set("variant", v)} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => set("size", v)} />
          <OptionGroup label="stretch" options={["subtle", "normal", "elastic"] as const} value={o.stretch} onChange={(v) => set("stretch", v)} />
        </>
      }
      code={toJsx("StretchTabs", { items: raw("items"), ...o }, DEFAULTS)}
    />
  )
}
