"use client"

import { useState } from "react"

import {
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  toJsx,
} from "@/components/docs/playground-controls"
import { CaretField } from "@/registry/relic/ui/caret-field"

const DEFAULTS = {
  gap: 28,
  length: 7,
  radius: 180,
  maxBlinks: 5,
  thickness: 1.5,
  restOpacity: 0.28,
  growth: 1,
  interactive: true,
}

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
          <RangeControl label="thickness" value={o.thickness} min={0.5} max={4} step={0.5} unit="px" onChange={(v) => setO({ ...o, thickness: v })} />
          <RangeControl label="radius" value={o.radius} min={60} max={360} step={10} unit="px" onChange={(v) => setO({ ...o, radius: v })} />
          <RangeControl label="growth" value={o.growth} min={0} max={3} step={0.1} unit="×" onChange={(v) => setO({ ...o, growth: v })} />
          <RangeControl label="restOpacity" value={o.restOpacity} min={0.05} max={0.8} step={0.01} onChange={(v) => setO({ ...o, restOpacity: v })} />
          <RangeControl label="maxBlinks" value={o.maxBlinks} min={0} max={20} onChange={(v) => setO({ ...o, maxBlinks: v })} />
          <ToggleList>
            <Toggle label="interactive" checked={o.interactive} onChange={(v) => setO({ ...o, interactive: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("CaretField", { className: "absolute inset-0", ...o }, DEFAULTS)}
    />
  )
}
