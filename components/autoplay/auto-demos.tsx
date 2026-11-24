"use client"

/**
 * Self-playing versions of the component demos, used on the landing page and
 * in the gallery. Each one performs on its own while its AutoplayFrame says
 * so, and is a normal, fully usable component the moment the visitor takes
 * over.
 */

import { useRef, useState } from "react"
import { Check, Moon, Sun, Trash2 } from "lucide-react"
import { motion } from "motion/react"

import { useAutoplayInterval } from "@/components/autoplay/autoplay-frame"
import { CaretField } from "@/registry/relic/ui/caret-field"
import { CaretTagInput } from "@/registry/relic/ui/caret-tag-input"
import { DialNumberInput } from "@/registry/relic/ui/dial-number-input"
import { ElasticDivider } from "@/registry/relic/ui/elastic-divider"
import { FoldAccordion } from "@/registry/relic/ui/fold-accordion"
import { HoldToConfirmButton } from "@/registry/relic/ui/hold-to-confirm-button"
import { InkCheckbox } from "@/registry/relic/ui/ink-checkbox"
import { PerforatedCard } from "@/registry/relic/ui/perforated-card"
import { RockerSwitch } from "@/registry/relic/ui/rocker-switch"
import { SmoothCaretInput } from "@/registry/relic/ui/smooth-caret-input"
import { StretchSwitch } from "@/registry/relic/ui/stretch-switch"
import { StretchTabs } from "@/registry/relic/ui/stretch-tabs"

/* -------------------------------------------------------------------------- */
/*                         Simulated input (ghost user)                        */
/* -------------------------------------------------------------------------- */

// These events are "untrusted", so AutoplayFrame knows they aren't the visitor.
function pointer(type: string, el: Element, x = 0, y = 0, related?: Element) {
  el.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      pointerId: 99,
      pointerType: "mouse",
      clientX: x,
      clientY: y,
      relatedTarget: related ?? null,
    })
  )
}

function press(el: Element, key: string) {
  el.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Toggles                                  */
/* -------------------------------------------------------------------------- */

export function AutoStretchSwitch() {
  const [mail, setMail] = useState(true)
  const [dark, setDark] = useState(false)
  const tick = useRef(0)

  useAutoplayInterval(2000, () => {
    tick.current += 1
    if (tick.current % 2) setMail((v) => !v)
    else setDark((v) => !v)
  })

  return (
    <div className="flex flex-col items-start gap-4 text-sm">
      <label className="flex items-center gap-3">
        <StretchSwitch checked={mail} onCheckedChange={setMail} />
        Email notifications
      </label>
      <label className="flex items-center gap-3">
        <StretchSwitch
          size="lg"
          checked={dark}
          onCheckedChange={setDark}
          checkedIcon={<Moon />}
          uncheckedIcon={<Sun />}
        />
        Dark mode
      </label>
    </div>
  )
}

export function AutoRockerSwitch() {
  const [power, setPower] = useState(true)
  const [wifi, setWifi] = useState(false)
  const tick = useRef(0)

  useAutoplayInterval(2200, () => {
    tick.current += 1
    if (tick.current % 2) setPower((v) => !v)
    else setWifi((v) => !v)
  })

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <RockerSwitch
        aria-label="Power"
        checked={power}
        onCheckedChange={setPower}
      />
      <RockerSwitch
        aria-label="Wi-Fi"
        onLabel="ON"
        offLabel="OFF"
        size="lg"
        variant="contrast"
        checked={wifi}
        onCheckedChange={setWifi}
      />
    </div>
  )
}

const TASKS = ["Ship the new components", "Write the docs", "Tell the world"]
// Check them one by one, admire the list, then clear it and start again.
const CHECK_STEPS = [
  [false, false, false],
  [true, false, false],
  [true, true, false],
  [true, true, true],
  [true, true, true],
]

export function AutoInkCheckbox() {
  const [checked, setChecked] = useState([false, false, false])
  const step = useRef(0)

  useAutoplayInterval(1400, () => {
    step.current = (step.current + 1) % CHECK_STEPS.length
    setChecked(CHECK_STEPS[step.current])
  })

  return (
    <div className="flex flex-col gap-3">
      {TASKS.map((task, i) => (
        <InkCheckbox
          key={task}
          label={task}
          checked={checked[i]}
          onCheckedChange={(value) =>
            setChecked((prev) => prev.map((c, j) => (j === i ? value : c)))
          }
        />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Navigation                                 */
/* -------------------------------------------------------------------------- */

const TAB_ITEMS = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "settings", label: "Settings" },
]
// Hop to neighbors, then jump across, so both small and big stretches show.
const TAB_PATH = [0, 1, 2, 3, 0, 2, 1, 3]

export function AutoStretchTabs() {
  const [tab, setTab] = useState(TAB_ITEMS[0].value)
  const step = useRef(0)

  useAutoplayInterval(1800, () => {
    step.current = (step.current + 1) % TAB_PATH.length
    setTab(TAB_ITEMS[TAB_PATH[step.current]].value)
  })

  return (
    // On the narrowest phones the row can scroll instead of being cut off.
    <div className="max-w-full overflow-x-auto p-1 [scrollbar-width:none]">
      <StretchTabs
        aria-label="Dashboard sections"
        items={TAB_ITEMS}
        value={tab}
        onValueChange={setTab}
      />
    </div>
  )
}

const FAQ = [
  {
    value: "what",
    title: "What is Relic UI?",
    content: "Animated React components you install with the shadcn CLI.",
  },
  {
    value: "free",
    title: "Is it free?",
    content: "Yes. It's open source under the MIT License, for any project.",
  },
  {
    value: "theme",
    title: "Does it follow my theme?",
    content: "Every component uses shadcn/ui tokens, in light and dark mode.",
  },
]

export function AutoFoldAccordion() {
  const [open, setOpen] = useState<string[]>([FAQ[0].value])
  const step = useRef(0)

  useAutoplayInterval(3200, () => {
    step.current = (step.current + 1) % FAQ.length
    setOpen([FAQ[step.current].value])
  })

  return (
    // Always as tall as the open state, so opening and closing never moves
    // anything around it.
    <div className="min-h-[15rem] w-full max-w-md">
      <FoldAccordion items={FAQ} value={open} onValueChange={setOpen} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Inputs                                   */
/* -------------------------------------------------------------------------- */

const PHRASES = [
  "Hello, Relic UI",
  "The caret glides…",
  "Letters ease in and out",
]

export function AutoSmoothCaretInput() {
  const [value, setValue] = useState("")
  const script = useRef({
    phrase: 0,
    pos: 0,
    mode: "type" as "type" | "hold" | "delete",
    wait: 0,
  })

  useAutoplayInterval(70, () => {
    const s = script.current
    const phrase = PHRASES[s.phrase]
    if (s.wait > 0) {
      s.wait -= 1
      return
    }
    if (s.mode === "type") {
      s.pos += 1
      setValue(phrase.slice(0, s.pos))
      // A tiny pause after spaces, like a person between words.
      if (phrase[s.pos - 1] === " ") s.wait = 2
      if (s.pos >= phrase.length) {
        s.mode = "delete"
        s.wait = 28 // let the finished phrase sit for a moment
      }
    } else {
      s.pos -= 1
      setValue(phrase.slice(0, Math.max(s.pos, 0)))
      if (s.pos <= 0) {
        s.pos = 0
        s.mode = "type"
        s.phrase = (s.phrase + 1) % PHRASES.length
        s.wait = 8
      }
    }
  })

  return (
    <div className="w-full max-w-md">
      <SmoothCaretInput
        size="lg"
        aria-label="Try the smooth caret input"
        placeholder="Type, delete, paste — feel the caret"
        autoComplete="off"
        alwaysShowCaret
        caretSpeed="smooth"
        letterDuration={0.3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}

const TAG_STEPS = [
  ["React"],
  ["React", "Motion"],
  ["React", "Motion", "Tailwind"],
  ["React", "Motion", "Tailwind", "shadcn"],
  ["React", "Motion", "Tailwind", "shadcn"],
  ["React", "Tailwind", "shadcn"],
  ["React", "shadcn"],
]

export function AutoCaretTagInput() {
  const [tags, setTags] = useState(TAG_STEPS[0])
  const step = useRef(0)

  useAutoplayInterval(1700, () => {
    step.current = (step.current + 1) % TAG_STEPS.length
    setTags(TAG_STEPS[step.current])
  })

  return (
    // Room for a second row of tags, so adding them never resizes the card.
    <div className="min-h-[5.5rem] w-full max-w-md">
      <CaretTagInput
        label="Skills"
        value={tags}
        onValueChange={setTags}
        flyFromCaret={false}
        placeholder="Type a skill and press Enter"
      />
    </div>
  )
}

export function AutoDialNumberInput() {
  const [value, setValue] = useState(4)
  const direction = useRef(1)

  useAutoplayInterval(950, () => {
    setValue((v) => {
      if (v >= 9) direction.current = -1
      if (v <= 3) direction.current = 1
      return v + direction.current
    })
  })

  return (
    <DialNumberInput
      label="Guests"
      min={1}
      max={20}
      value={value}
      onValueChange={setValue}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                           Buttons, cards, effects                          */
/* -------------------------------------------------------------------------- */

export function AutoHoldToConfirm() {
  const ref = useRef<HTMLButtonElement>(null)

  // Press and keep holding until it fills and confirms, then let go.
  useAutoplayInterval(5200, () => {
    const button = ref.current
    if (!button) return
    pointer("pointerdown", button)
    setTimeout(() => pointer("pointerup", button), 1500)
  })

  return (
    <HoldToConfirmButton
      ref={ref}
      variant="destructive"
      haptics={false}
      confirmedChildren={
        <>
          <Check /> Deleted
        </>
      }
    >
      <Trash2 /> Hold to delete
    </HoldToConfirmButton>
  )
}

export function AutoPerforatedCard() {
  const wrapper = useRef<HTMLDivElement>(null)
  const [round, setRound] = useState(0)
  const torn = useRef(false)

  // Tear the stub, show the reveal for a moment, then put a fresh stub back.
  useAutoplayInterval(3600, () => {
    if (!torn.current) {
      const stub = wrapper.current?.querySelector(
        '[data-slot="perforated-card"] [role="button"]'
      )
      if (stub) press(stub, "Enter")
      torn.current = true
    } else {
      torn.current = false
      setRound((r) => r + 1)
    }
  })

  // Every other round tears sideways, so both styles get shown.
  const horizontal = round % 2 === 1

  return (
    <div ref={wrapper} className="w-full max-w-xs">
      <motion.div
        key={round}
        initial={round === 0 ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <PerforatedCard
          orientation={horizontal ? "horizontal" : "vertical"}
          exitEffect="fall"
          onTear={() => (torn.current = true)}
          stub={
            horizontal ? (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                <span>Pull to tear</span>
                <span aria-hidden className="text-base">→</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Pull to tear</span>
                <span aria-hidden>↓</span>
              </div>
            )
          }
          reveal={
            <p
              className={
                horizontal
                  ? "flex h-full items-center justify-center font-mono text-xs font-semibold tracking-widest"
                  : "font-mono text-base font-semibold tracking-widest"
              }
            >
              RELIC-2026
            </p>
          }
        >
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Gift card
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">20% off</p>
        </PerforatedCard>
      </motion.div>
    </div>
  )
}

export function AutoElasticDivider() {
  const wrapper = useRef<HTMLDivElement>(null)

  // An invisible cursor sweeps across the line, pulling it, then lets go.
  useAutoplayInterval(4200, () => {
    const line = wrapper.current?.querySelector('[data-slot="elastic-divider"]')
    if (!line) return
    const rect = line.getBoundingClientRect()
    const start = performance.now()
    const duration = 1200

    function step(now: number) {
      if (!line) return
      const t = Math.min((now - start) / duration, 1)
      const x = rect.left + rect.width * (0.2 + 0.6 * t)
      const y = rect.top + rect.height / 2 + Math.sin(t * Math.PI) * 14
      pointer("pointermove", line, x, y)
      if (t < 1) requestAnimationFrame(step)
      else pointer("pointerout", line, x, y, document.body)
    }
    requestAnimationFrame(step)
  })

  return (
    <div ref={wrapper} className="w-full">
      <p className="text-center text-sm text-muted-foreground">above</p>
      <ElasticDivider bend={30} damping={6} />
      <p className="text-center text-sm text-muted-foreground">below</p>
    </div>
  )
}

export function AutoCaretField() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border">
      <CaretField className="absolute inset-0" autoCursor />
      <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
        Move your cursor here
      </p>
    </div>
  )
}
