"use client"

import { useState } from "react"

import {
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  toJsx,
} from "@/components/docs/playground-controls"
import { PerforationProgress } from "@/registry/relic/ui/perforation-progress"

const DEFAULTS = { value: 40, segments: 24, showValue: true, indeterminate: false }

export function PerforationProgressPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const value = o.indeterminate ? undefined : o.value

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <div className="w-full max-w-sm">
          <PerforationProgress label="Uploading" value={value} segments={o.segments} showValue={o.showValue} />
        </div>
      }
      controls={
        <>
          <RangeControl label="value" value={o.value} min={0} max={100} unit="%" onChange={(v) => setO({ ...o, value: v })} />
          <RangeControl label="segments" value={o.segments} min={8} max={48} onChange={(v) => setO({ ...o, segments: v })} />
          <ToggleList>
            <Toggle label="showValue" checked={o.showValue} onChange={(v) => setO({ ...o, showValue: v })} />
            <Toggle label="indeterminate" checked={o.indeterminate} onChange={(v) => setO({ ...o, indeterminate: v })} />
          </ToggleList>
          <p className="text-xs text-muted-foreground">
            Drag value to 100% to see the tear wave.
          </p>
        </>
      }
      code={toJsx(
        "PerforationProgress",
        { label: "Uploading", value, segments: o.segments, showValue: o.showValue },
        { segments: 24, showValue: false }
      )}
    />
  )
}
