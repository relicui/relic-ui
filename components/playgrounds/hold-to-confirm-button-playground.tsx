"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { HoldToConfirmButton } from "@/registry/relic/ui/hold-to-confirm-button"

const DEFAULTS = {
  variant: "default" as "default" | "destructive",
  size: "default" as "sm" | "default" | "lg",
  fillFrom: "left" as "left" | "right" | "center" | "bottom",
  duration: 1.2,
  resetAfter: 1.2,
}

export function HoldToConfirmButtonPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [showConfirmed, setShowConfirmed] = useState(true)
  const [count, setCount] = useState(0)
  const set = <K extends keyof typeof DEFAULTS>(k: K, v: (typeof DEFAULTS)[K]) =>
    setO((prev) => ({ ...prev, [k]: v }))

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setShowConfirmed(true)
      }}
      preview={
        <div className="flex flex-col items-center gap-4">
          <HoldToConfirmButton
            {...o}
            confirmedChildren={showConfirmed ? "Confirmed" : undefined}
            onConfirm={() => setCount((c) => c + 1)}
          >
            Hold to confirm
          </HoldToConfirmButton>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Confirmed {count} {count === 1 ? "time" : "times"}
          </p>
        </div>
      }
      controls={
        <>
          <OptionGroup label="variant" options={["default", "destructive"] as const} value={o.variant} onChange={(v) => set("variant", v)} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => set("size", v)} />
          <OptionGroup label="fillFrom" options={["left", "right", "center", "bottom"] as const} value={o.fillFrom} onChange={(v) => set("fillFrom", v)} />
          <RangeControl label="duration" value={o.duration} min={0.4} max={3} step={0.1} unit="s" onChange={(v) => set("duration", v)} />
          <RangeControl label="resetAfter" value={o.resetAfter} min={0.4} max={3} step={0.1} unit="s" onChange={(v) => set("resetAfter", v)} />
          <ToggleList>
            <Toggle label="confirmedChildren" checked={showConfirmed} onChange={setShowConfirmed} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "HoldToConfirmButton",
        {
          ...o,
          confirmedChildren: showConfirmed ? "Confirmed" : undefined,
          onConfirm: raw("handleConfirm"),
        },
        DEFAULTS,
        "Hold to confirm"
      )}
    />
  )
}
