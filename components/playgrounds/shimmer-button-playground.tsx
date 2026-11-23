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
  duration: 1.6,
  delay: 1.2,
}

export function ShimmerButtonPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [color, setColor] = useState<keyof typeof SHIMMER_COLORS>("theme")
  const set = <K extends keyof typeof DEFAULTS>(k: K, v: (typeof DEFAULTS)[K]) =>
    setO((prev) => ({ ...prev, [k]: v }))
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
          <OptionGroup label="variant" options={["default", "secondary", "outline"] as const} value={o.variant} onChange={(v) => set("variant", v)} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => set("size", v)} />
          <OptionGroup label="shimmer color" options={Object.keys(SHIMMER_COLORS) as (keyof typeof SHIMMER_COLORS)[]} value={color} onChange={setColor} />
          <RangeControl label="duration" value={o.duration} min={0.6} max={4} step={0.1} unit="s" onChange={(v) => set("duration", v)} />
          <RangeControl label="delay" value={o.delay} min={0} max={4} step={0.1} unit="s" onChange={(v) => set("delay", v)} />
        </>
      }
      code={toJsx("ShimmerButton", { ...o, shimmerClassName }, DEFAULTS, "Get started")}
    />
  )
}
