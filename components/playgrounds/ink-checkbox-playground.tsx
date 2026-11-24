"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  toJsx,
} from "@/components/docs/playground-controls"
import { InkCheckbox } from "@/registry/relic/ui/ink-checkbox"

const DEFAULTS = { size: "default" as "sm" | "default" | "lg" }

export function InkCheckboxPlayground() {
  const [o, setO] = useState(DEFAULTS)

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <div className="flex flex-col gap-3">
          <InkCheckbox {...o} label="Click near a corner of the box" />
          <InkCheckbox {...o} label="Then try the opposite corner" />
        </div>
      }
      controls={
        <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
      }
      code={toJsx("InkCheckbox", { ...o, label: "Accept the terms" }, DEFAULTS)}
    />
  )
}
