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
import { CaretLoader } from "@/registry/relic/ui/caret-loader"

const DEFAULTS = { size: "default" as "sm" | "default" | "lg", dots: 3, speed: 1 }

export function CaretLoaderPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [withText, setWithText] = useState(true)
  const text = withText ? "Loading" : undefined

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setWithText(true)
      }}
      preview={<CaretLoader {...o} text={text} />}
      controls={
        <>
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <RangeControl label="dots" value={o.dots} min={1} max={6} onChange={(v) => setO({ ...o, dots: v })} />
          <RangeControl label="speed" value={o.speed} min={0.5} max={3} step={0.1} unit="×" onChange={(v) => setO({ ...o, speed: v })} />
          <ToggleList>
            <Toggle label="text" checked={withText} onChange={setWithText} />
          </ToggleList>
        </>
      }
      code={toJsx("CaretLoader", { text, ...o }, DEFAULTS)}
    />
  )
}
