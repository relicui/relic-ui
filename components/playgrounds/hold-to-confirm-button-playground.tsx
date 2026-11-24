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
  shape: "rounded" as "rounded" | "pill" | "square",
  fillFrom: "left" as "left" | "right" | "center" | "bottom",
  duration: 1.2,
  resetAfter: 1.2,
  haptics: true,
}

export function HoldToConfirmButtonPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [showConfirmed, setShowConfirmed] = useState(true)
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState("Waiting")

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
            onHoldStart={() => setStatus("Holding…")}
            onHoldCancel={() => setStatus("Let go too early")}
            onConfirm={() => {
              setCount((c) => c + 1)
              setStatus("Confirmed")
            }}
          >
            Hold to confirm
          </HoldToConfirmButton>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {status} · confirmed {count} {count === 1 ? "time" : "times"}
          </p>
        </div>
      }
      controls={
        <>
          <OptionGroup label="variant" options={["default", "destructive"] as const} value={o.variant} onChange={(v) => setO({ ...o, variant: v })} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <OptionGroup label="shape" options={["rounded", "pill", "square"] as const} value={o.shape} onChange={(v) => setO({ ...o, shape: v })} />
          <OptionGroup label="fillFrom" options={["left", "right", "center", "bottom"] as const} value={o.fillFrom} onChange={(v) => setO({ ...o, fillFrom: v })} />
          <RangeControl label="duration" value={o.duration} min={0.4} max={3} step={0.1} unit="s" onChange={(v) => setO({ ...o, duration: v })} />
          <RangeControl label="resetAfter" value={o.resetAfter} min={0.4} max={3} step={0.1} unit="s" onChange={(v) => setO({ ...o, resetAfter: v })} />
          <ToggleList>
            <Toggle label="confirmedChildren" checked={showConfirmed} onChange={setShowConfirmed} />
            <Toggle label="haptics" checked={o.haptics} onChange={(v) => setO({ ...o, haptics: v })} />
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
