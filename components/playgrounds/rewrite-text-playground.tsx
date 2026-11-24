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

const DEFAULTS = {
  hold: 2.4,
  typeSpeed: 70,
  deleteMode: "select" as "select" | "backspace",
  letterEffect: "blur" as "blur" | "rise" | "fade" | "none",
  loop: true,
  showCaret: true,
}

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
          {/* Remount on changes so the cycle starts over with the new settings. */}
          <RewriteText key={`${set}-${o.loop}-${o.deleteMode}`} words={words} {...o} />
        </p>
      }
      controls={
        <>
          <OptionGroup label="words" options={Object.keys(SETS) as (keyof typeof SETS)[]} value={set} onChange={setSet} />
          <OptionGroup label="deleteMode" options={["select", "backspace"] as const} value={o.deleteMode} onChange={(v) => setO({ ...o, deleteMode: v })} />
          <OptionGroup label="letterEffect" options={["blur", "rise", "fade", "none"] as const} value={o.letterEffect} onChange={(v) => setO({ ...o, letterEffect: v })} />
          <RangeControl label="hold" value={o.hold} min={0.6} max={5} step={0.2} unit="s" onChange={(v) => setO({ ...o, hold: v })} />
          <RangeControl label="typeSpeed" value={o.typeSpeed} min={30} max={160} step={5} unit="ms" onChange={(v) => setO({ ...o, typeSpeed: v })} />
          <ToggleList>
            <Toggle label="loop" checked={o.loop} onChange={(v) => setO({ ...o, loop: v })} />
            <Toggle label="showCaret" checked={o.showCaret} onChange={(v) => setO({ ...o, showCaret: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("RewriteText", { words: raw(JSON.stringify(words)), ...o }, DEFAULTS)}
    />
  )
}
