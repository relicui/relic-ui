"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  toJsx,
} from "@/components/docs/playground-controls"
import { InkCheckbox } from "@/registry/relic/ui/ink-checkbox"

const DEFAULTS = {
  size: "default" as "sm" | "default" | "lg",
  shape: "rounded" as "rounded" | "square" | "circle",
  inkFrom: "pointer" as "pointer" | "center" | "corner",
  inkDuration: 0.4,
}

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
        <>
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <OptionGroup label="shape" options={["rounded", "square", "circle"] as const} value={o.shape} onChange={(v) => setO({ ...o, shape: v })} />
          <OptionGroup label="inkFrom" options={["pointer", "center", "corner"] as const} value={o.inkFrom} onChange={(v) => setO({ ...o, inkFrom: v })} />
          <RangeControl label="inkDuration" value={o.inkDuration} min={0.15} max={1.2} step={0.05} unit="s" onChange={(v) => setO({ ...o, inkDuration: v })} />
        </>
      }
      code={toJsx("InkCheckbox", { ...o, label: "Accept the terms" }, DEFAULTS)}
    />
  )
}
