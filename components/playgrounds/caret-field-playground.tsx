"use client"

import { useState } from "react"

import {
  PlaygroundShell,
  RangeControl,
  toJsx,
} from "@/components/docs/playground-controls"
import { CaretField } from "@/registry/relic/ui/caret-field"

const DEFAULTS = { gap: 28, length: 7, radius: 180, maxBlinks: 5 }

export function CaretFieldPlayground() {
  const [o, setO] = useState(DEFAULTS)

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <div className="relative h-56 w-full overflow-hidden rounded-xl border bg-background">
          <CaretField className="absolute inset-0" {...o} />
        </div>
      }
      controls={
        <>
          <RangeControl label="gap" value={o.gap} min={14} max={56} unit="px" onChange={(v) => setO({ ...o, gap: v })} />
          <RangeControl label="length" value={o.length} min={3} max={16} unit="px" onChange={(v) => setO({ ...o, length: v })} />
          <RangeControl label="radius" value={o.radius} min={60} max={360} step={10} unit="px" onChange={(v) => setO({ ...o, radius: v })} />
          <RangeControl label="maxBlinks" value={o.maxBlinks} min={0} max={20} onChange={(v) => setO({ ...o, maxBlinks: v })} />
        </>
      }
      code={toJsx("CaretField", { className: "absolute inset-0", ...o }, DEFAULTS)}
    />
  )
}
