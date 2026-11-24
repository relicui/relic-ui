"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  toJsx,
} from "@/components/docs/playground-controls"
import { ShimmerButton } from "@/registry/relic/ui/shimmer-button"

// Written out in full so Tailwind can find the class names.
const SHIMMER_COLORS = {
  theme: undefined,
  amber: "via-amber-300/50",
  sky: "via-sky-300/50",
  rose: "via-rose-300/50",
  emerald: "via-emerald-300/50",
} as const

const DEFAULTS = {
  variant: "default" as "default" | "secondary" | "outline",
  size: "default" as "sm" | "default" | "lg",
  shape: "rounded" as "rounded" | "pill" | "square",
  direction: "right" as "right" | "left",
  duration: 1.6,
  delay: 1.2,
  shimmerWidth: 50,
  angle: 12,
}

export function ShimmerButtonPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [color, setColor] = useState<keyof typeof SHIMMER_COLORS>("theme")
  const shimmerClassName = SHIMMER_COLORS[color]

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setColor("theme")
      }}
      preview={
        <ShimmerButton {...o} shimmerClassName={shimmerClassName}>
          Get started
        </ShimmerButton>
      }
      controls={
        <>
          <OptionGroup label="variant" options={["default", "secondary", "outline"] as const} value={o.variant} onChange={(v) => setO({ ...o, variant: v })} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <OptionGroup label="shape" options={["rounded", "pill", "square"] as const} value={o.shape} onChange={(v) => setO({ ...o, shape: v })} />
          <OptionGroup label="direction" options={["right", "left"] as const} value={o.direction} onChange={(v) => setO({ ...o, direction: v })} />
          <OptionGroup label="shimmer color" options={Object.keys(SHIMMER_COLORS) as (keyof typeof SHIMMER_COLORS)[]} value={color} onChange={setColor} />
          <RangeControl label="duration" value={o.duration} min={0.6} max={4} step={0.1} unit="s" onChange={(v) => setO({ ...o, duration: v })} />
          <RangeControl label="delay" value={o.delay} min={0} max={4} step={0.1} unit="s" onChange={(v) => setO({ ...o, delay: v })} />
          <RangeControl label="shimmerWidth" value={o.shimmerWidth} min={10} max={100} step={5} unit="%" onChange={(v) => setO({ ...o, shimmerWidth: v })} />
          <RangeControl label="angle" value={o.angle} min={0} max={40} unit="°" onChange={(v) => setO({ ...o, angle: v })} />
        </>
      }
      code={toJsx("ShimmerButton", { ...o, shimmerClassName }, DEFAULTS, "Get started")}
    />
  )
}
