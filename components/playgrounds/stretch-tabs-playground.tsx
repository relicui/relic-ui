"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  Toggle,
  ToggleList,
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
  fullWidth: false,
}

export function StretchTabsPlayground() {
  const [o, setO] = useState(DEFAULTS)

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <div className="w-full max-w-md">
          <div className="flex justify-center">
            <StretchTabs aria-label="Playground tabs" items={items} {...o} />
          </div>
        </div>
      }
      controls={
        <>
          <OptionGroup label="variant" options={["pill", "underline"] as const} value={o.variant} onChange={(v) => setO({ ...o, variant: v })} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <OptionGroup label="stretch" options={["subtle", "normal", "elastic"] as const} value={o.stretch} onChange={(v) => setO({ ...o, stretch: v })} />
          <ToggleList>
            <Toggle label="fullWidth" checked={o.fullWidth} onChange={(v) => setO({ ...o, fullWidth: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("StretchTabs", { items: raw("items"), ...o }, DEFAULTS)}
    />
  )
}
