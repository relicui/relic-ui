"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { DialNumberInput } from "@/registry/relic/ui/dial-number-input"

const PRESETS = {
  guests: { label: "Guests", min: 1, max: 20, step: 1, defaultValue: 4 },
  volume: { label: "Volume", min: 0, max: 100, step: 5, defaultValue: 40 },
  price: { label: "Price", min: 0, max: 50, step: 0.5, defaultValue: 9.5 },
} as const

const FORMATS = {
  guests: undefined,
  volume: (v: number) => `${v}%`,
  price: (v: number) => `$${v.toFixed(2)}`,
}

const FORMAT_CODE = {
  guests: undefined,
  volume: raw("(v) => `${v}%`"),
  price: raw("(v) => `$${v.toFixed(2)}`"),
}

export function DialNumberInputPlayground() {
  const [preset, setPreset] = useState<keyof typeof PRESETS>("guests")
  const p = PRESETS[preset]

  return (
    <PlaygroundShell
      onReset={() => setPreset("guests")}
      preview={
        <DialNumberInput key={preset} {...p} formatValue={FORMATS[preset]} />
      }
      controls={
        <>
          <OptionGroup label="preset" options={Object.keys(PRESETS) as (keyof typeof PRESETS)[]} value={preset} onChange={setPreset} />
          <p className="text-xs text-muted-foreground">
            Drag the dial up or down, scroll while it&apos;s focused, or use the arrow keys.
          </p>
        </>
      }
      code={toJsx(
        "DialNumberInput",
        { ...p, formatValue: FORMAT_CODE[preset] },
        { step: 1 }
      )}
    />
  )
}
