"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  toJsx,
} from "@/components/docs/playground-controls"
import { PerforationProgress } from "@/registry/relic/ui/perforation-progress"

const DEFAULTS = {
  value: 40,
  segments: 24,
  size: "default" as "sm" | "default" | "lg",
  shape: "pill" as "pill" | "square",
  gap: 3,
  showValue: true,
  celebrate: true,
  indeterminate: false,
}

export function PerforationProgressPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const { indeterminate, ...props } = o
  const value = indeterminate ? undefined : o.value

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <div className="w-full max-w-sm">
          <PerforationProgress label="Uploading" {...props} value={value} />
        </div>
      }
      controls={
        <>
          <RangeControl label="value" value={o.value} min={0} max={100} unit="%" onChange={(v) => setO({ ...o, value: v })} />
          <RangeControl label="segments" value={o.segments} min={8} max={48} onChange={(v) => setO({ ...o, segments: v })} />
          <RangeControl label="gap" value={o.gap} min={0} max={8} unit="px" onChange={(v) => setO({ ...o, gap: v })} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <OptionGroup label="shape" options={["pill", "square"] as const} value={o.shape} onChange={(v) => setO({ ...o, shape: v })} />
          <ToggleList>
            <Toggle label="showValue" checked={o.showValue} onChange={(v) => setO({ ...o, showValue: v })} />
            <Toggle label="celebrate" checked={o.celebrate} onChange={(v) => setO({ ...o, celebrate: v })} />
            <Toggle label="indeterminate" checked={o.indeterminate} onChange={(v) => setO({ ...o, indeterminate: v })} />
          </ToggleList>
          <p className="text-xs text-muted-foreground">
            Drag value to 100% to see the tear wave.
          </p>
        </>
      }
      code={toJsx(
        "PerforationProgress",
        { label: "Uploading", ...props, value },
        { segments: 24, size: "default", shape: "pill", gap: 3, showValue: false, celebrate: true }
      )}
    />
  )
}
