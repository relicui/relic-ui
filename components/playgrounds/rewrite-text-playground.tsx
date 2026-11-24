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
import { RewriteText } from "@/registry/relic/ui/rewrite-text"

const SETS = {
  feelings: ["alive", "tactile", "crafted", "human"],
  roles: ["designers", "developers", "founders"],
  verbs: ["build", "ship", "polish", "delight"],
} as const

const DEFAULTS = { hold: 2.4, typeSpeed: 70, highlight: true }

export function RewriteTextPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [set, setSet] = useState<keyof typeof SETS>("feelings")
  const words = [...SETS[set]]

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setSet("feelings")
      }}
      preview={
        <p className="text-3xl font-semibold tracking-tight">
          Made for{" "}
          <RewriteText key={set} words={words} {...o} />
        </p>
      }
      controls={
        <>
          <OptionGroup label="words" options={Object.keys(SETS) as (keyof typeof SETS)[]} value={set} onChange={setSet} />
          <RangeControl label="hold" value={o.hold} min={0.6} max={5} step={0.2} unit="s" onChange={(v) => setO({ ...o, hold: v })} />
          <RangeControl label="typeSpeed" value={o.typeSpeed} min={30} max={160} step={5} unit="ms" onChange={(v) => setO({ ...o, typeSpeed: v })} />
          <ToggleList>
            <Toggle label="highlight" checked={o.highlight} onChange={(v) => setO({ ...o, highlight: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("RewriteText", { words: raw(JSON.stringify(words)), ...o }, DEFAULTS)}
    />
  )
}
