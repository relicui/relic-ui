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
import { RockerSwitch } from "@/registry/relic/ui/rocker-switch"

const LABELS = {
  "I / O": ["I", "O"],
  "ON / OFF": ["ON", "OFF"],
  "✓ / ✕": ["✓", "✕"],
} as const

const DEFAULTS = {
  size: "default" as "sm" | "default" | "lg",
  variant: "default" as "default" | "contrast",
  tilt: 16,
  showDivider: true,
}

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
        <RockerSwitch aria-label="Playground rocker" {...o} onLabel={onLabel} offLabel={offLabel} />
      }
      controls={
        <>
          <OptionGroup label="labels" options={Object.keys(LABELS) as (keyof typeof LABELS)[]} value={labels} onChange={setLabels} />
          <OptionGroup label="variant" options={["default", "contrast"] as const} value={o.variant} onChange={(v) => setO({ ...o, variant: v })} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <RangeControl label="tilt" value={o.tilt} min={0} max={30} unit="°" onChange={(v) => setO({ ...o, tilt: v })} />
          <ToggleList>
            <Toggle label="showDivider" checked={o.showDivider} onChange={(v) => setO({ ...o, showDivider: v })} />
          </ToggleList>
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
