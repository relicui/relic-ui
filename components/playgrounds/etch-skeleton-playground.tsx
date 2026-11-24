"use client"

import { useState } from "react"

import {
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  toJsx,
} from "@/components/docs/playground-controls"
import { EtchSkeleton } from "@/registry/relic/ui/etch-skeleton"

const DEFAULTS = { lines: 3, speed: 1, avatar: false }

export function EtchSkeletonPlayground() {
  const [o, setO] = useState(DEFAULTS)

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <div className="w-full max-w-sm rounded-xl border p-5">
          {/* Remount when the timing changes so every line restarts together. */}
          <EtchSkeleton key={`${o.lines}-${o.speed}`} {...o} />
        </div>
      }
      controls={
        <>
          <RangeControl label="lines" value={o.lines} min={1} max={6} onChange={(v) => setO({ ...o, lines: v })} />
          <RangeControl label="speed" value={o.speed} min={0.5} max={3} step={0.1} unit="×" onChange={(v) => setO({ ...o, speed: v })} />
          <ToggleList>
            <Toggle label="avatar" checked={o.avatar} onChange={(v) => setO({ ...o, avatar: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("EtchSkeleton", o, DEFAULTS)}
    />
  )
}
