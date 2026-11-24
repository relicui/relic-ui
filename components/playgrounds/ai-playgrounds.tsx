"use client"

/** Playgrounds for the second set of AI components. */

import { useState } from "react"
import { Code, Lightbulb, Mail, PenLine, Plane } from "lucide-react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { CitationPeek } from "@/registry/relic/ui/citation-peek"
import { ConfidenceText } from "@/registry/relic/ui/confidence-text"
import { PromptDeck } from "@/registry/relic/ui/prompt-deck"
import { ResponseVersions } from "@/registry/relic/ui/response-versions"
import { TemperatureDial } from "@/registry/relic/ui/temperature-dial"

/* ----------------------------- Confidence Text ---------------------------- */

const SENTENCE = "Mount Everest is roughly 8849 metres tall and was first climbed in 1953 by two climbers."
const SCORES = [0.98, 0.97, 0.95, 0.62, 0.44, 0.9, 0.96, 0.95, 0.93, 0.91, 0.97, 0.88, 0.55, 0.92, 0.71]
const TOKENS = SENTENCE.split(" ").map((text, i) => ({ text, confidence: SCORES[i] ?? 0.9 }))

export function ConfidenceTextPlayground() {
  const D = {
    variant: "heat" as "heat" | "underline" | "fade",
    threshold: 0.6,
    onlyLow: false,
    showTooltip: true,
    showLegend: true,
    animate: true,
  }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="w-full max-w-sm pt-6 text-[15px]">
          <ConfidenceText key={`${o.animate}`} tokens={TOKENS} {...o} />
        </div>
      }
      controls={
        <>
          <OptionGroup label="variant" options={["heat", "underline", "fade"] as const} value={o.variant} onChange={(v) => setO({ ...o, variant: v })} />
          <RangeControl label="threshold" value={o.threshold} min={0.3} max={0.95} step={0.05} onChange={(v) => setO({ ...o, threshold: v })} />
          <ToggleList>
            <Toggle label="onlyLow" checked={o.onlyLow} onChange={(v) => setO({ ...o, onlyLow: v })} />
            <Toggle label="showTooltip" checked={o.showTooltip} onChange={(v) => setO({ ...o, showTooltip: v })} />
            <Toggle label="showLegend" checked={o.showLegend} onChange={(v) => setO({ ...o, showLegend: v })} />
            <Toggle label="animate" checked={o.animate} onChange={(v) => setO({ ...o, animate: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("ConfidenceText", { tokens: raw("tokens"), ...o }, { variant: "heat", threshold: 0.6, onlyLow: false, showTooltip: true, showLegend: false, animate: true })}
    />
  )
}

/* ------------------------------ Citation Peek ----------------------------- */

const CITATIONS = [
  { title: "How plants make food", source: "Botany Basics", url: "https://example.com/plants", snippet: "Leaves turn sunlight, water and air into sugar." },
  { title: "Chlorophyll and color", source: "Science Daily", url: "https://example.com/chlorophyll", snippet: "Chlorophyll reflects green light, which is why leaves look green." },
]

export function CitationPeekPlayground() {
  const D = {
    trigger: "hover" as "hover" | "click",
    marker: "number" as "number" | "dot" | "pill",
    placement: "top" as "top" | "bottom",
    highlightSentence: true,
  }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className={o.placement === "top" ? "w-full max-w-sm pt-32" : "w-full max-w-sm pb-32"}>
          <CitationPeek
            citations={CITATIONS}
            text="Plants make their own food from sunlight [1]. Their leaves look green because of chlorophyll [2]."
            {...o}
          />
        </div>
      }
      controls={
        <>
          <OptionGroup label="trigger" options={["hover", "click"] as const} value={o.trigger} onChange={(v) => setO({ ...o, trigger: v })} />
          <OptionGroup label="marker" options={["number", "dot", "pill"] as const} value={o.marker} onChange={(v) => setO({ ...o, marker: v })} />
          <OptionGroup label="placement" options={["top", "bottom"] as const} value={o.placement} onChange={(v) => setO({ ...o, placement: v })} />
          <ToggleList>
            <Toggle label="highlightSentence" checked={o.highlightSentence} onChange={(v) => setO({ ...o, highlightSentence: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("CitationPeek", { text: raw("answer"), citations: raw("sources"), ...o }, D)}
    />
  )
}

/* ------------------------------- Prompt Deck ------------------------------ */

const PROMPTS = [
  { title: "Plan a trip", prompt: "Plan a weekend in Lisbon.", icon: <Plane /> },
  { title: "Write an email", prompt: "Ask my team for feedback.", icon: <Mail /> },
  { title: "Explain code", prompt: "What does useMemo do?", icon: <Code /> },
  { title: "Brainstorm", prompt: "Names for a bakery.", icon: <Lightbulb /> },
  { title: "Polish writing", prompt: "Make my intro punchier.", icon: <PenLine /> },
]

export function PromptDeckPlayground() {
  const D = {
    layout: "fan" as "fan" | "stack" | "grid",
    autoShuffle: 0,
    maxVisible: 4,
    cardWidth: 200,
    showShuffle: true,
  }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={<div className="w-full max-w-md"><PromptDeck key={o.layout} prompts={PROMPTS} {...o} /></div>}
      controls={
        <>
          <OptionGroup label="layout" options={["fan", "stack", "grid"] as const} value={o.layout} onChange={(v) => setO({ ...o, layout: v })} />
          <RangeControl label="autoShuffle" value={o.autoShuffle} min={0} max={6} step={0.5} unit="s" onChange={(v) => setO({ ...o, autoShuffle: v })} />
          <RangeControl label="maxVisible" value={o.maxVisible} min={2} max={5} onChange={(v) => setO({ ...o, maxVisible: v })} />
          <RangeControl label="cardWidth" value={o.cardWidth} min={160} max={240} step={10} unit="px" onChange={(v) => setO({ ...o, cardWidth: v })} />
          <ToggleList>
            <Toggle label="showShuffle" checked={o.showShuffle} onChange={(v) => setO({ ...o, showShuffle: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("PromptDeck", { prompts: raw("prompts"), ...o, onPick: raw("(p) => setInput(p.prompt)") }, D)}
    />
  )
}

/* ---------------------------- Temperature Dial ---------------------------- */

const LABEL_SETS = {
  default: ["Precise", "Balanced", "Creative"],
  playful: ["Robot", "Human", "Poet"],
  plain: ["Low", "Medium", "High"],
} as const

export function TemperatureDialPlayground() {
  const D = { max: 2, step: 0.1, particles: 30, chamberHeight: 112, showValue: true }
  const [o, setO] = useState(D)
  const [set, setSet] = useState<keyof typeof LABEL_SETS>("default")
  const labels = [...LABEL_SETS[set]] as [string, string, string]
  return (
    <PlaygroundShell
      onReset={() => {
        setO(D)
        setSet("default")
      }}
      preview={<div className="w-full max-w-sm"><TemperatureDial key={`${o.particles}-${o.max}`} labels={labels} {...o} /></div>}
      controls={
        <>
          <OptionGroup label="labels" options={Object.keys(LABEL_SETS) as (keyof typeof LABEL_SETS)[]} value={set} onChange={setSet} />
          <RangeControl label="max" value={o.max} min={1} max={2} step={0.5} onChange={(v) => setO({ ...o, max: v })} />
          <RangeControl label="particles" value={o.particles} min={8} max={80} onChange={(v) => setO({ ...o, particles: v })} />
          <RangeControl label="chamberHeight" value={o.chamberHeight} min={64} max={200} step={8} unit="px" onChange={(v) => setO({ ...o, chamberHeight: v })} />
          <ToggleList>
            <Toggle label="showValue" checked={o.showValue} onChange={(v) => setO({ ...o, showValue: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("TemperatureDial", { ...o, labels: set === "default" ? undefined : raw(JSON.stringify(labels)) }, { max: 2, step: 0.1, particles: 30, chamberHeight: 112, showValue: true })}
    />
  )
}

/* ---------------------------- Response Versions --------------------------- */

const VERSIONS = [
  "Water boils at 100 °C at sea level.",
  "At sea level, water boils at 100 °C. Higher up, where the air pressure is lower, it boils at a lower temperature, which is why pasta takes longer to cook in the mountains.",
  "100 °C, at sea level.",
]

export function ResponseVersionsPlayground() {
  const D = {
    transition: "blur" as "blur" | "slide" | "fade",
    showCounter: true,
    regenerating: false,
  }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="w-full max-w-sm">
          <ResponseVersions versions={VERSIONS} defaultIndex={0} onRegenerate={() => setO({ ...o, regenerating: true })} {...o} />
        </div>
      }
      controls={
        <>
          <OptionGroup label="transition" options={["blur", "slide", "fade"] as const} value={o.transition} onChange={(v) => setO({ ...o, transition: v })} />
          <ToggleList>
            <Toggle label="showCounter" checked={o.showCounter} onChange={(v) => setO({ ...o, showCounter: v })} />
            <Toggle label="regenerating" checked={o.regenerating} onChange={(v) => setO({ ...o, regenerating: v })} />
          </ToggleList>
          <p className="text-xs text-muted-foreground">Step through the versions: the card glides to each height.</p>
        </>
      }
      code={toJsx("ResponseVersions", { versions: raw("answers"), ...o, onRegenerate: raw("regenerate") }, D)}
    />
  )
}
