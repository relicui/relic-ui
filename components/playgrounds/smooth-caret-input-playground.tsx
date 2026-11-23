"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  Toggle,
  ToggleList,
  toJsx,
} from "@/components/docs/playground-controls"
import { SmoothCaretInput } from "@/registry/relic/ui/smooth-caret-input"

// Written out in full so Tailwind can find the class names.
const CARET_COLORS = {
  primary: { line: undefined, block: undefined },
  blue: { line: "bg-blue-500", block: "bg-blue-500/30" },
  rose: { line: "bg-rose-500", block: "bg-rose-500/30" },
  emerald: { line: "bg-emerald-500", block: "bg-emerald-500/30" },
  amber: { line: "bg-amber-500", block: "bg-amber-500/30" },
} as const

const DEFAULTS = {
  variant: "default" as "default" | "underline" | "ghost",
  size: "default" as "sm" | "default" | "lg",
  caret: "line" as "line" | "block" | "underline",
  caretSpeed: "smooth" as "snappy" | "smooth" | "lazy",
  letterEffect: "rise" as "rise" | "fade" | "blur" | "scale" | "drop" | "none",
  blink: true,
  smear: true,
  animateDelete: true,
  pasteWave: true,
}

export function SmoothCaretInputPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [color, setColor] = useState<keyof typeof CARET_COLORS>("primary")
  const set = <K extends keyof typeof DEFAULTS>(k: K, v: (typeof DEFAULTS)[K]) =>
    setO((prev) => ({ ...prev, [k]: v }))

  const caretClassName =
    CARET_COLORS[color][o.caret === "block" ? "block" : "line"]

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setColor("primary")
      }}
      preview={
        <div className="w-full max-w-sm">
          <SmoothCaretInput
            aria-label="Playground input"
            placeholder="Type something…"
            autoComplete="off"
            caretClassName={caretClassName}
            {...o}
          />
        </div>
      }
      controls={
        <>
          <OptionGroup label="variant" options={["default", "underline", "ghost"] as const} value={o.variant} onChange={(v) => set("variant", v)} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => set("size", v)} />
          <OptionGroup label="caret" options={["line", "block", "underline"] as const} value={o.caret} onChange={(v) => set("caret", v)} />
          <OptionGroup label="caret color" options={Object.keys(CARET_COLORS) as (keyof typeof CARET_COLORS)[]} value={color} onChange={setColor} />
          <OptionGroup label="caretSpeed" options={["snappy", "smooth", "lazy"] as const} value={o.caretSpeed} onChange={(v) => set("caretSpeed", v)} />
          <OptionGroup label="letterEffect" options={["rise", "fade", "blur", "scale", "drop", "none"] as const} value={o.letterEffect} onChange={(v) => set("letterEffect", v)} />
          <ToggleList>
            <Toggle label="blink" checked={o.blink} onChange={(v) => set("blink", v)} />
            <Toggle label="smear" checked={o.smear} onChange={(v) => set("smear", v)} />
            <Toggle label="animateDelete" checked={o.animateDelete} onChange={(v) => set("animateDelete", v)} />
            <Toggle label="pasteWave" checked={o.pasteWave} onChange={(v) => set("pasteWave", v)} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "SmoothCaretInput",
        { ...o, caretClassName, placeholder: "Type something…" },
        DEFAULTS
      )}
    />
  )
}
