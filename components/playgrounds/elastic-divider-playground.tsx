"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  toJsx,
} from "@/components/docs/playground-controls"
import { ElasticDivider } from "@/registry/relic/ui/elastic-divider"

// Written out in full so Tailwind can find the class names.
const LINE_COLORS = {
  border: undefined,
  foreground: "text-foreground",
  blue: "text-blue-500",
  rose: "text-rose-500",
  emerald: "text-emerald-500",
} as const

const DEFAULTS = {
  bend: 24,
  stiffness: 350,
  damping: 7,
  strokeWidth: 1,
}

export function ElasticDividerPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [color, setColor] = useState<keyof typeof LINE_COLORS>("border")
  const set = <K extends keyof typeof DEFAULTS>(k: K, v: (typeof DEFAULTS)[K]) =>
    setO((prev) => ({ ...prev, [k]: v }))
  const className = LINE_COLORS[color]

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setColor("border")
      }}
      preview={
        <div className="w-full max-w-md">
          <p className="text-center text-sm text-muted-foreground">
            Move your cursor across the line
          </p>
          <ElasticDivider {...o} className={className} />
        </div>
      }
      controls={
        <>
          <OptionGroup label="color" options={Object.keys(LINE_COLORS) as (keyof typeof LINE_COLORS)[]} value={color} onChange={setColor} />
          <RangeControl label="bend" value={o.bend} min={4} max={48} unit="px" onChange={(v) => set("bend", v)} />
          <RangeControl label="stiffness" value={o.stiffness} min={80} max={1000} step={10} onChange={(v) => set("stiffness", v)} />
          <RangeControl label="damping" value={o.damping} min={2} max={40} onChange={(v) => set("damping", v)} />
          <RangeControl label="strokeWidth" value={o.strokeWidth} min={1} max={4} step={0.5} unit="px" onChange={(v) => set("strokeWidth", v)} />
        </>
      }
      code={toJsx("ElasticDivider", { ...o, className }, DEFAULTS)}
    />
  )
}
