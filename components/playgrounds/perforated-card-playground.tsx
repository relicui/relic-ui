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
import { PerforatedCard } from "@/registry/relic/ui/perforated-card"

const DEFAULTS = {
  orientation: "vertical" as "vertical" | "horizontal",
  perforation: "dashed" as "dashed" | "dotted",
  exitEffect: "fall" as "fall" | "fly" | "fade",
  threshold: 70,
  tilt: 3,
  notches: true,
  tearOnClick: false,
}

export function PerforatedCardPlayground() {
  const [o, setO] = useState(DEFAULTS)
  // Changing the key remounts the card, which puts the stub back.
  const [round, setRound] = useState(0)

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setRound((r) => r + 1)
      }}
      preview={
        <div className={`flex w-full flex-col items-center gap-4 ${o.orientation === "horizontal" ? "max-w-md" : "max-w-xs"}`}>
          <PerforatedCard
            key={round}
            {...o}
            stub={
              o.orientation === "horizontal" ? (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-muted-foreground">
                  <span className="text-xs">{o.tearOnClick ? "Pull or tap" : "Pull to tear"}</span>
                  <span aria-hidden className="text-lg">→</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{o.tearOnClick ? "Pull or tap to tear" : "Pull down to tear"}</span>
                  <span aria-hidden>↓</span>
                </div>
              )
            }
            reveal={
              <p className={`font-mono font-semibold tracking-widest ${o.orientation === "horizontal" ? "flex h-full items-center justify-center text-sm" : "text-lg"}`}>
                RELIC-7F3K
              </p>
            }
          >
            <p className="text-3xl font-semibold tracking-tight">20% off</p>
            <p className="mt-1 text-muted-foreground">Valid on any order.</p>
          </PerforatedCard>
          <button
            type="button"
            onClick={() => setRound((r) => r + 1)}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Put the stub back
          </button>
        </div>
      }
      controls={
        <>
          <OptionGroup label="orientation" options={["vertical", "horizontal"] as const} value={o.orientation} onChange={(v) => {
            setO({ ...o, orientation: v })
            setRound((r) => r + 1)
          }} />
          <OptionGroup label="perforation" options={["dashed", "dotted"] as const} value={o.perforation} onChange={(v) => setO({ ...o, perforation: v })} />
          <OptionGroup label="exitEffect" options={["fall", "fly", "fade"] as const} value={o.exitEffect} onChange={(v) => setO({ ...o, exitEffect: v })} />
          <RangeControl label="threshold" value={o.threshold} min={30} max={150} unit="px" onChange={(v) => setO({ ...o, threshold: v })} />
          <RangeControl label="tilt" value={o.tilt} min={0} max={15} unit="°" onChange={(v) => setO({ ...o, tilt: v })} />
          <ToggleList>
            <Toggle label="notches" checked={o.notches} onChange={(v) => setO({ ...o, notches: v })} />
            <Toggle label="tearOnClick" checked={o.tearOnClick} onChange={(v) => setO({ ...o, tearOnClick: v })} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "PerforatedCard",
        {
          stub: raw("<span>Pull down to tear</span>"),
          reveal: raw("<p>RELIC-7F3K</p>"),
          ...o,
        },
        DEFAULTS,
        "<p>20% off</p>"
      )}
    />
  )
}
