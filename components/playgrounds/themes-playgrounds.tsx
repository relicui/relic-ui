"use client"

/**
 * Playgrounds for the AI, Ancient and Physics components. They share one file
 * because each one only needs a few controls.
 */

import { useState } from "react"
import { Bell, Home, Mail, Search, Settings, User } from "lucide-react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { AgentSteps, type AgentStep } from "@/registry/relic/ui/agent-steps"
import { AstrolabePicker } from "@/registry/relic/ui/astrolabe-picker"
import { ChiselInput } from "@/registry/relic/ui/chisel-input"
import { ContextGauge } from "@/registry/relic/ui/context-gauge"
import { DeliberateText } from "@/registry/relic/ui/deliberate-text"
import { HourglassLoader } from "@/registry/relic/ui/hourglass-loader"
import { JellyCard } from "@/registry/relic/ui/jelly-card"
import { LiquidProgress } from "@/registry/relic/ui/liquid-progress"
import { NewtonsCradleLoader } from "@/registry/relic/ui/newtons-cradle-loader"
import { OrbitMenu } from "@/registry/relic/ui/orbit-menu"
import { PullChainToggle } from "@/registry/relic/ui/pull-chain-toggle"
import { RuneDecodeText } from "@/registry/relic/ui/rune-decode-text"
import { ScrollUnroll } from "@/registry/relic/ui/scroll-unroll"
import { SpringSlider } from "@/registry/relic/ui/spring-slider"
import { SuggestionDiff } from "@/registry/relic/ui/suggestion-diff"
import { ThoughtFold } from "@/registry/relic/ui/thought-fold"
import { WaxSealButton } from "@/registry/relic/ui/wax-seal-button"

const SIZES = ["sm", "default", "lg"] as const
type Size = (typeof SIZES)[number]

/* ---------------------------------- AI ---------------------------------- */

export function SuggestionDiffPlayground() {
  const D = { speed: 1, showActions: true }
  const [o, setO] = useState(D)
  const [round, setRound] = useState(0)
  return (
    <PlaygroundShell
      onReset={() => {
        setO(D)
        setRound((r) => r + 1)
      }}
      preview={
        <div className="w-full max-w-sm">
          <SuggestionDiff
            key={`${round}-${o.speed}`}
            original="The meeting are moved to friday because many peoples was busy."
            suggestion="The meeting was moved to Friday because many people were busy."
            {...o}
          />
          <button type="button" onClick={() => setRound((r) => r + 1)} className="text-xs text-muted-foreground hover:text-foreground">
            Replay
          </button>
        </div>
      }
      controls={
        <>
          <RangeControl label="speed" value={o.speed} min={0.3} max={3} step={0.1} unit="×" onChange={(v) => setO({ ...o, speed: v })} />
          <ToggleList>
            <Toggle label="showActions" checked={o.showActions} onChange={(v) => setO({ ...o, showActions: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("SuggestionDiff", { original: raw("before"), suggestion: raw("after"), ...o, onAccept: raw("apply") }, D)}
    />
  )
}

export function ThoughtFoldPlayground() {
  const D = { thinking: true, defaultOpen: true }
  const [o, setO] = useState(D)
  const steps = ["Understanding the question.", "Looking at three options.", "Choosing the simplest one."]
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="w-full max-w-sm">
          <ThoughtFold key={String(o.defaultOpen)} steps={steps} {...o} />
        </div>
      }
      controls={
        <ToggleList>
          <Toggle label="thinking" checked={o.thinking} onChange={(v) => setO({ ...o, thinking: v })} />
          <Toggle label="defaultOpen" checked={o.defaultOpen} onChange={(v) => setO({ ...o, defaultOpen: v })} />
        </ToggleList>
      }
      code={toJsx("ThoughtFold", { steps: raw("steps"), ...o }, { thinking: false, defaultOpen: false })}
    />
  )
}

export function DeliberateTextPlayground() {
  const D = { speed: 70, flickers: 4, markChoices: true, loop: true }
  const [o, setO] = useState(D)
  const text = "This answer is {probably|likely|almost certainly} {fine|good|correct}."
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="w-full max-w-sm">
          <DeliberateText key={`${o.speed}-${o.flickers}`} text={text} {...o} />
        </div>
      }
      controls={
        <>
          <RangeControl label="speed" value={o.speed} min={20} max={200} step={10} unit="ms" onChange={(v) => setO({ ...o, speed: v })} />
          <RangeControl label="flickers" value={o.flickers} min={1} max={10} onChange={(v) => setO({ ...o, flickers: v })} />
          <ToggleList>
            <Toggle label="markChoices" checked={o.markChoices} onChange={(v) => setO({ ...o, markChoices: v })} />
            <Toggle label="loop" checked={o.loop} onChange={(v) => setO({ ...o, loop: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("DeliberateText", { text, ...o }, { speed: 70, flickers: 4, markChoices: true, loop: false })}
    />
  )
}

export function ContextGaugePlayground() {
  const D = { used: 120, max: 200, warnAt: 0.8, segments: 32 }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="w-full max-w-sm">
          <ContextGauge used={o.used * 1000} max={o.max * 1000} warnAt={o.warnAt} segments={o.segments} />
        </div>
      }
      controls={
        <>
          <RangeControl label="used" value={o.used} min={0} max={o.max} unit="k" onChange={(v) => setO({ ...o, used: v })} />
          <RangeControl label="warnAt" value={o.warnAt} min={0.5} max={1} step={0.05} onChange={(v) => setO({ ...o, warnAt: v })} />
          <RangeControl label="segments" value={o.segments} min={10} max={50} onChange={(v) => setO({ ...o, segments: v })} />
        </>
      }
      code={toJsx("ContextGauge", { used: o.used * 1000, max: o.max * 1000, warnAt: o.warnAt, segments: o.segments }, { warnAt: 0.8, segments: 32 })}
    />
  )
}

export function AgentStepsPlayground() {
  const [current, setCurrent] = useState(1)
  const [failed, setFailed] = useState(false)
  const [timer, setTimer] = useState(true)
  const labels = ["Planning", "Searching the web", "Writing the report", "Sending the email"]
  const steps: AgentStep[] = labels.map((label, i) => ({
    label,
    status: i < current ? "done" : i === current ? (failed ? "error" : "running") : "pending",
  }))
  return (
    <PlaygroundShell
      onReset={() => {
        setCurrent(1)
        setFailed(false)
        setTimer(true)
      }}
      preview={<div className="w-full max-w-xs"><AgentSteps steps={steps} showTimer={timer} /></div>}
      controls={
        <>
          <RangeControl label="current step" value={current} min={0} max={labels.length} onChange={setCurrent} />
          <ToggleList>
            <Toggle label="error on current" checked={failed} onChange={setFailed} />
            <Toggle label="showTimer" checked={timer} onChange={setTimer} />
          </ToggleList>
        </>
      }
      code={toJsx("AgentSteps", { steps: raw("steps"), showTimer: timer }, { showTimer: true })}
    />
  )
}

/* -------------------------------- Ancient ------------------------------- */

export function RuneDecodeTextPlayground() {
  const D = { duration: 1.6, trigger: "hover" as "view" | "mount" | "hover" }
  const [o, setO] = useState(D)
  const [round, setRound] = useState(0)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-serif text-2xl font-semibold">
            <RuneDecodeText key={`${round}-${o.trigger}`} text="The relic remembers" {...o} />
          </p>
          <button type="button" onClick={() => setRound((r) => r + 1)} className="text-xs text-muted-foreground hover:text-foreground">
            Replay
          </button>
        </div>
      }
      controls={
        <>
          <OptionGroup label="trigger" options={["view", "mount", "hover"] as const} value={o.trigger} onChange={(v) => setO({ ...o, trigger: v })} />
          <RangeControl label="duration" value={o.duration} min={0.4} max={4} step={0.1} unit="s" onChange={(v) => setO({ ...o, duration: v })} />
        </>
      }
      code={toJsx("RuneDecodeText", { text: "The relic remembers", ...o }, { duration: 1.6, trigger: "view" })}
    />
  )
}

const WAX = { crimson: "#9b2226", navy: "#1d3557", forest: "#2d6a4f", gold: "#b7791f" } as const

export function WaxSealButtonPlayground() {
  const D = { color: "crimson" as keyof typeof WAX, emblem: "✶", resetAfter: 2.4 }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <WaxSealButton waxColor={WAX[o.color]} emblem={o.emblem} resetAfter={o.resetAfter} sealedChildren="Sealed">
          Seal it
        </WaxSealButton>
      }
      controls={
        <>
          <OptionGroup label="wax" options={Object.keys(WAX) as (keyof typeof WAX)[]} value={o.color} onChange={(v) => setO({ ...o, color: v })} />
          <OptionGroup label="emblem" options={["✶", "R", "♛", "⚜"] as const} value={o.emblem as "✶"} onChange={(v) => setO({ ...o, emblem: v })} />
          <RangeControl label="resetAfter" value={o.resetAfter} min={0} max={6} step={0.2} unit="s" onChange={(v) => setO({ ...o, resetAfter: v })} />
        </>
      }
      code={toJsx("WaxSealButton", { waxColor: WAX[o.color], emblem: o.emblem, resetAfter: o.resetAfter, onSeal: raw("submit") }, { waxColor: WAX.crimson, emblem: "✶", resetAfter: 2.4 }, "Seal it")}
    />
  )
}

export function ScrollUnrollPlayground() {
  const [open, setOpen] = useState(true)
  return (
    <PlaygroundShell
      onReset={() => setOpen(true)}
      preview={
        <div className="w-full max-w-xs">
          <ScrollUnroll title="Unroll" open={open} onOpenChange={setOpen}>
            Whoever finds this scroll may use the components freely, by the MIT License.
          </ScrollUnroll>
        </div>
      }
      controls={
        <ToggleList>
          <Toggle label="open" checked={open} onChange={setOpen} />
        </ToggleList>
      }
      code={toJsx("ScrollUnroll", { title: "Unroll", open: raw("open"), onOpenChange: raw("setOpen") }, {}, "…")}
    />
  )
}

export function HourglassLoaderPlayground() {
  const D = { duration: 3, size: "default" as Size }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={<HourglassLoader key={o.duration} {...o} />}
      controls={
        <>
          <OptionGroup label="size" options={SIZES} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <RangeControl label="duration" value={o.duration} min={1} max={8} step={0.5} unit="s" onChange={(v) => setO({ ...o, duration: v })} />
        </>
      }
      code={toJsx("HourglassLoader", o, D)}
    />
  )
}

export function AstrolabePickerPlayground() {
  const SETS = {
    seasons: ["Spring", "Summer", "Autumn", "Winter"],
    planets: ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Moon"],
    hours: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"],
  }
  const [set, setSet] = useState<keyof typeof SETS>("planets")
  const [size, setSize] = useState(240)
  return (
    <PlaygroundShell
      onReset={() => {
        setSet("planets")
        setSize(240)
      }}
      preview={<AstrolabePicker key={set} options={SETS[set]} size={size} />}
      controls={
        <>
          <OptionGroup label="options" options={Object.keys(SETS) as (keyof typeof SETS)[]} value={set} onChange={setSet} />
          <RangeControl label="size" value={size} min={180} max={320} step={10} unit="px" onChange={setSize} />
        </>
      }
      code={toJsx("AstrolabePicker", { options: raw(JSON.stringify(SETS[set])), size }, { size: 240 })}
    />
  )
}

export function ChiselInputPlayground() {
  const [dust, setDust] = useState(7)
  return (
    <PlaygroundShell
      onReset={() => setDust(7)}
      preview={<div className="w-full max-w-sm"><ChiselInput aria-label="Carve" placeholder="Type to carve…" dust={dust} autoComplete="off" /></div>}
      controls={<RangeControl label="dust" value={dust} min={0} max={20} onChange={setDust} />}
      code={toJsx("ChiselInput", { placeholder: "Type to carve…", dust }, { dust: 7 })}
    />
  )
}

/* -------------------------------- Physics ------------------------------- */

export function SpringSliderPlayground() {
  const D = { stiffness: 260, damping: 14, step: 1 }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={<div className="w-full max-w-sm"><SpringSlider label="Try me" defaultValue={50} {...o} /></div>}
      controls={
        <>
          <RangeControl label="stiffness" value={o.stiffness} min={60} max={800} step={10} onChange={(v) => setO({ ...o, stiffness: v })} />
          <RangeControl label="damping" value={o.damping} min={3} max={40} onChange={(v) => setO({ ...o, damping: v })} />
          <RangeControl label="step" value={o.step} min={1} max={25} onChange={(v) => setO({ ...o, step: v })} />
        </>
      }
      code={toJsx("SpringSlider", { label: "Volume", ...o }, D)}
    />
  )
}

export function NewtonsCradleLoaderPlayground() {
  const D = { balls: 5, duration: 1.4, angle: 32, size: "default" as Size }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={<NewtonsCradleLoader key={`${o.duration}-${o.angle}`} {...o} />}
      controls={
        <>
          <OptionGroup label="size" options={SIZES} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <RangeControl label="balls" value={o.balls} min={3} max={8} onChange={(v) => setO({ ...o, balls: v })} />
          <RangeControl label="duration" value={o.duration} min={0.6} max={3} step={0.1} unit="s" onChange={(v) => setO({ ...o, duration: v })} />
          <RangeControl label="angle" value={o.angle} min={10} max={60} unit="°" onChange={(v) => setO({ ...o, angle: v })} />
        </>
      }
      code={toJsx("NewtonsCradleLoader", o, D)}
    />
  )
}

export function LiquidProgressPlayground() {
  const D = { value: 60, shape: "circle" as "circle" | "tank", size: 128, showValue: true }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={<LiquidProgress {...o} />}
      controls={
        <>
          <RangeControl label="value" value={o.value} min={0} max={100} unit="%" onChange={(v) => setO({ ...o, value: v })} />
          <OptionGroup label="shape" options={["circle", "tank"] as const} value={o.shape} onChange={(v) => setO({ ...o, shape: v })} />
          <RangeControl label="size" value={o.size} min={80} max={200} step={4} unit="px" onChange={(v) => setO({ ...o, size: v })} />
          <ToggleList>
            <Toggle label="showValue" checked={o.showValue} onChange={(v) => setO({ ...o, showValue: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("LiquidProgress", o, { shape: "circle", size: 128, showValue: true })}
    />
  )
}

export function PullChainTogglePlayground() {
  const D = { links: 12, linkLength: 9, threshold: 26 }
  const [o, setO] = useState(D)
  const [on, setOn] = useState(false)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="flex items-start gap-5">
          <PullChainToggle key={`${o.links}-${o.linkLength}`} label="Light" checked={on} onCheckedChange={setOn} {...o} />
          <span className="pt-6 text-sm text-muted-foreground">{on ? "On" : "Off"}</span>
        </div>
      }
      controls={
        <>
          <RangeControl label="links" value={o.links} min={5} max={20} onChange={(v) => setO({ ...o, links: v })} />
          <RangeControl label="linkLength" value={o.linkLength} min={5} max={14} unit="px" onChange={(v) => setO({ ...o, linkLength: v })} />
          <RangeControl label="threshold" value={o.threshold} min={10} max={60} unit="px" onChange={(v) => setO({ ...o, threshold: v })} />
        </>
      }
      code={toJsx("PullChainToggle", { label: "Light", checked: raw("on"), onCheckedChange: raw("setOn"), ...o }, D)}
    />
  )
}

export function JellyCardPlayground() {
  const [intensity, setIntensity] = useState(1)
  return (
    <PlaygroundShell
      onReset={() => setIntensity(1)}
      preview={
        <JellyCard intensity={intensity} className="w-60 cursor-grab">
          <p className="font-semibold">Squish me</p>
          <p className="mt-1 text-sm text-muted-foreground">Press, drag and let go.</p>
        </JellyCard>
      }
      controls={<RangeControl label="intensity" value={intensity} min={0} max={2} step={0.1} onChange={setIntensity} />}
      code={toJsx("JellyCard", { intensity }, { intensity: 1 }, "…")}
    />
  )
}

export function OrbitMenuPlayground() {
  const D = { radius: 84, period: 20 }
  const [o, setO] = useState(D)
  const items = [
    { label: "Home", icon: <Home /> },
    { label: "Search", icon: <Search /> },
    { label: "Mail", icon: <Mail /> },
    { label: "Alerts", icon: <Bell /> },
    { label: "Profile", icon: <User /> },
    { label: "Settings", icon: <Settings /> },
  ]
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={<OrbitMenu items={items} defaultOpen {...o} />}
      controls={
        <>
          <RangeControl label="radius" value={o.radius} min={60} max={120} unit="px" onChange={(v) => setO({ ...o, radius: v })} />
          <RangeControl label="period" value={o.period} min={6} max={60} unit="s" onChange={(v) => setO({ ...o, period: v })} />
        </>
      }
      code={toJsx("OrbitMenu", { items: raw("items"), ...o }, D)}
    />
  )
}
