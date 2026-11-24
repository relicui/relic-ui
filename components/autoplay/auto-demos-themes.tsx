"use client"

/**
 * Self-playing gallery demos for the AI, Ancient and Physics components that
 * normally wait for a click or a drag. Like the others, they only perform
 * inside an AutoplayFrame and hand over the moment the visitor takes control.
 */

import { useRef, useState } from "react"
import { Bell, Home, Mail, Search, Settings, User } from "lucide-react"

import { useAutoplayInterval } from "@/components/autoplay/autoplay-frame"
import { AstrolabePicker } from "@/registry/relic/ui/astrolabe-picker"
import { CitationPeek } from "@/registry/relic/ui/citation-peek"
import { JellyCard } from "@/registry/relic/ui/jelly-card"
import { OrbitMenu } from "@/registry/relic/ui/orbit-menu"
import { PullChainToggle } from "@/registry/relic/ui/pull-chain-toggle"
import { ResponseVersions } from "@/registry/relic/ui/response-versions"
import { ScrollUnroll } from "@/registry/relic/ui/scroll-unroll"
import { SpringSlider } from "@/registry/relic/ui/spring-slider"
import { SuggestionDiff } from "@/registry/relic/ui/suggestion-diff"
import { TemperatureDial } from "@/registry/relic/ui/temperature-dial"
import { ThoughtFold } from "@/registry/relic/ui/thought-fold"
import { WaxSealButton } from "@/registry/relic/ui/wax-seal-button"

function pointer(type: string, el: Element, x: number, y: number) {
  el.dispatchEvent(
    new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, pointerId: 98, pointerType: "mouse", clientX: x, clientY: y })
  )
}

export function AutoSuggestionDiff() {
  const [round, setRound] = useState(0)
  useAutoplayInterval(7000, () => setRound((r) => r + 1))
  return (
    <div className="w-full max-w-md">
      <SuggestionDiff
        key={round}
        original="Our components is fast and they works in every browsers."
        suggestion="Our components are fast and they work in every browser."
      />
    </div>
  )
}

const THOUGHTS = [
  "Reading the question about the weekend trip.",
  "Checking the weather for Saturday and Sunday.",
  "Picking the earlier train.",
]

export function AutoThoughtFold() {
  const [open, setOpen] = useState(false)
  const [round, setRound] = useState(0)
  const step = useRef(0)
  useAutoplayInterval(2200, () => {
    step.current = (step.current + 1) % 4
    if (step.current === 1) setOpen(true)
    if (step.current === 3) setOpen(false)
    if (step.current === 0) setRound((r) => r + 1)
  })
  return (
    <div className="w-full max-w-md">
      <ThoughtFold key={round} steps={THOUGHTS} thinking open={open} onOpenChange={setOpen} />
    </div>
  )
}

export function AutoWaxSeal() {
  const ref = useRef<HTMLDivElement>(null)
  useAutoplayInterval(3800, () => {
    ref.current?.querySelector("button")?.click()
  })
  return (
    <div ref={ref}>
      <WaxSealButton sealedChildren="Signed" resetAfter={2.6}>
        Sign the agreement
      </WaxSealButton>
    </div>
  )
}

export function AutoScrollUnroll() {
  const [open, setOpen] = useState(true)
  useAutoplayInterval(3400, () => setOpen((o) => !o))
  return (
    <div className="min-h-[13rem] w-full max-w-xs">
      <ScrollUnroll title="Read the decree" open={open} onOpenChange={setOpen}>
        <p className="font-semibold">Hear ye, builders of interfaces.</p>
        <p className="mt-2">Let every motion be gentle and every component open to all.</p>
      </ScrollUnroll>
    </div>
  )
}

const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "Dawn", "Dusk"]

export function AutoAstrolabe() {
  const [value, setValue] = useState("Summer")
  const step = useRef(1)
  useAutoplayInterval(1900, () => {
    // Mostly small turns, sometimes a big swing across the dial.
    step.current = (step.current + (Math.random() < 0.3 ? 3 : 1)) % SEASONS.length
    setValue(SEASONS[step.current])
  })
  return <AstrolabePicker label="Choose a season" options={SEASONS} value={value} onValueChange={setValue} size={220} />
}

export function AutoSpringSlider() {
  const [value, setValue] = useState(40)
  useAutoplayInterval(1500, () => setValue(10 + Math.round(Math.random() * 80)))
  return (
    <div className="w-full max-w-sm">
      <SpringSlider label="Volume" value={value} onValueChange={setValue} stiffness={200} damping={10} />
    </div>
  )
}

export function AutoPullChain() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useAutoplayInterval(2600, () => {
    ref.current?.querySelector("button")?.click()
  })
  return (
    <div ref={ref} className="flex items-start gap-6">
      <PullChainToggle label="Lamp" checked={on} onCheckedChange={setOn} />
      <p className="pt-6 text-sm font-medium">The lamp is {on ? "on" : "off"}</p>
    </div>
  )
}

export function AutoJellyCard() {
  const ref = useRef<HTMLDivElement>(null)
  // Press near a corner, drag a little, let go: the card squishes and wobbles.
  useAutoplayInterval(3000, () => {
    const card = ref.current?.querySelector('[data-slot="jelly-card"]')
    if (!card) return
    const r = card.getBoundingClientRect()
    const x = r.left + r.width * (0.25 + Math.random() * 0.5)
    const y = r.top + r.height * 0.4
    pointer("pointerdown", card, x, y)
    setTimeout(() => pointer("pointermove", card, x + 40, y + 16), 180)
    setTimeout(() => pointer("pointerup", card, x + 40, y + 16), 520)
  })
  return (
    <div ref={ref}>
      <JellyCard className="w-64">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Press &amp; drag</p>
        <p className="mt-2 text-lg font-semibold">I&apos;m made of jelly</p>
        <p className="mt-1 text-sm text-muted-foreground">Squish me, then let go.</p>
      </JellyCard>
    </div>
  )
}

const ORBIT_ITEMS = [
  { label: "Home", icon: <Home /> },
  { label: "Search", icon: <Search /> },
  { label: "Messages", icon: <Mail /> },
  { label: "Notifications", icon: <Bell /> },
  { label: "Profile", icon: <User /> },
  { label: "Settings", icon: <Settings /> },
]

export function AutoOrbitMenu() {
  const [open, setOpen] = useState(true)
  const tick = useRef(0)
  useAutoplayInterval(2400, () => {
    tick.current += 1
    // Stay open for a while, close briefly, open again.
    if (tick.current % 3 === 0) setOpen(false)
    else setOpen(true)
  })
  return <OrbitMenu items={ORBIT_ITEMS} open={open} onOpenChange={setOpen} radius={76} period={14} />
}

/* -------------------------------- AI, part 2 ------------------------------- */

export function AutoTemperatureDial() {
  const [value, setValue] = useState(0.3)
  const step = useRef(0)
  // Calm, then balanced, then wild, then back: the swarm reacts each time.
  useAutoplayInterval(2400, () => {
    const path = [0.3, 1, 1.8, 1]
    step.current = (step.current + 1) % path.length
    setValue(path[step.current])
  })
  return (
    <div className="w-full max-w-sm">
      <TemperatureDial value={value} onValueChange={setValue} />
    </div>
  )
}

const PEEK_SOURCES = [
  { title: "Using the Web Animations API", source: "MDN", snippet: "Animations can be controlled from JavaScript." },
  { title: "prefers-reduced-motion", source: "MDN", snippet: "Detects a request for less motion." },
]

export function AutoCitationPeek() {
  const [active, setActive] = useState<number | null>(null)
  const step = useRef(0)
  useAutoplayInterval(1800, () => {
    const path = [1, null, 2, null]
    step.current = (step.current + 1) % path.length
    setActive(path[step.current])
  })
  return (
    <div className="w-full max-w-md pt-28">
      <CitationPeek
        citations={PEEK_SOURCES}
        active={active}
        onActiveChange={setActive}
        text="Browsers can animate straight from JavaScript [1]. Sites can also respect a request for less motion [2]."
      />
    </div>
  )
}

const VERSION_TEXTS = [
  "A haiku is a short poem in three lines of five, seven and five syllables.",
  "Think of a haiku as a photograph in words: three short lines that capture one fleeting scene, often from nature.",
  "Haiku come from Japan: three lines, about seventeen syllables.",
]

export function AutoResponseVersions() {
  const [index, setIndex] = useState(0)
  useAutoplayInterval(2300, () => setIndex((i) => (i + 1) % VERSION_TEXTS.length))
  return (
    <div className="w-full max-w-md">
      <ResponseVersions versions={VERSION_TEXTS} index={index} onIndexChange={setIndex} transition="slide" />
    </div>
  )
}
