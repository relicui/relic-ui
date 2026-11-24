"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  toJsx,
} from "@/components/docs/playground-controls"
import { RockerSwitch } from "@/registry/relic/ui/rocker-switch"

const LABELS = {
  "I / O": ["I", "O"],
  "ON / OFF": ["ON", "OFF"],
  "✓ / ✕": ["✓", "✕"],
} as const

const DEFAULTS = { size: "default" as "sm" | "default" | "lg", tilt: 16 }

export function RockerSwitchPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [labels, setLabels] = useState<keyof typeof LABELS>("I / O")
  const [onLabel, offLabel] = LABELS[labels]

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setLabels("I / O")
      }}
      preview={
        <RockerSwitch
          aria-label="Playground rocker"
          {...o}
          onLabel={onLabel}
          offLabel={offLabel}
        />
      }
      controls={
        <>
          <OptionGroup label="labels" options={Object.keys(LABELS) as (keyof typeof LABELS)[]} value={labels} onChange={setLabels} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <RangeControl label="tilt" value={o.tilt} min={0} max={30} unit="°" onChange={(v) => setO({ ...o, tilt: v })} />
        </>
      }
      code={toJsx(
        "RockerSwitch",
        { ...o, onLabel, offLabel },
        { ...DEFAULTS, onLabel: "I", offLabel: "O" }
      )}
    />
  )
}
