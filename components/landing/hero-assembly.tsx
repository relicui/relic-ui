"use client"

/**
 * Hero "Assembly": a swarm of carets flies in and traces the exact outline of
 * a real component, a gold spark draws around it, the live component
 * materializes and performs, then dissolves back into carets that scatter
 * and re-form as the next component. Its install command types itself below.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { ShimmerButton } from "@/registry/relic/ui/shimmer-button"
import { SmoothCaretInput } from "@/registry/relic/ui/smooth-caret-input"
import { StretchSwitch } from "@/registry/relic/ui/stretch-switch"
import { StretchTabs } from "@/registry/relic/ui/stretch-tabs"

/* -------------------------------------------------------------------------- */
/*                                   Scenes                                   */
/* -------------------------------------------------------------------------- */

type SceneProps = { live: boolean }

function InputScene({ live }: SceneProps) {
  const [value, setValue] = useState("")
  useEffect(() => {
    if (!live) return
    const text = "Hello, Relic UI"
    let i = 0
    const id = setInterval(() => {
      i += 1
      setValue(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 130)
    return () => clearInterval(id)
  }, [live])
  return (
    <SmoothCaretInput
      aria-label="Demo input"
      placeholder="Type something…"
      alwaysShowCaret={live}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-72"
    />
  )
}

function SwitchScene({ live }: SceneProps) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setOn((v) => !v), 1400)
    return () => clearInterval(id)
  }, [live])
  return <StretchSwitch aria-label="Demo switch" size="lg" checked={on} onCheckedChange={setOn} />
}

const TABS = [
  { value: "design", label: "Design" },
  { value: "build", label: "Build" },
  { value: "ship", label: "Ship" },
]

function TabsScene({ live }: SceneProps) {
  const [tab, setTab] = useState("design")
  useEffect(() => {
    if (!live) return
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % TABS.length
      setTab(TABS[i].value)
    }, 1300)
    return () => clearInterval(id)
  }, [live])
  return <StretchTabs aria-label="Demo tabs" items={TABS} value={tab} onValueChange={setTab} />
}

function ButtonScene() {
  return (
    <ShimmerButton size="lg" duration={1.2} delay={0.4}>
      Get started <ArrowRight />
    </ShimmerButton>
  )
}

const SCENES = [
  { name: "smooth-caret-input", Scene: InputScene },
  { name: "stretch-switch", Scene: SwitchScene },
  { name: "stretch-tabs", Scene: TabsScene },
  { name: "shimmer-button", Scene: ButtonScene },
]

/* -------------------------------------------------------------------------- */
/*                                  Geometry                                  */
/* -------------------------------------------------------------------------- */

type Point = { x: number; y: number; a: number }

const SPACING = 8 // pixels between carets along an outline
const POOL = 220 // most carets ever needed

/** Evenly spaced points (with their direction) around a rounded rectangle. */
function roundedRectOutline(x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2)
  const straightW = w - 2 * r
  const straightH = h - 2 * r
  const arc = (Math.PI / 2) * r
  const segments = [
    { kind: "line", len: straightW, x0: x + r, y0: y, dx: 1, dy: 0 },
    { kind: "arc", len: arc, cx: x + w - r, cy: y + r, start: -Math.PI / 2 },
    { kind: "line", len: straightH, x0: x + w, y0: y + r, dx: 0, dy: 1 },
    { kind: "arc", len: arc, cx: x + w - r, cy: y + h - r, start: 0 },
    { kind: "line", len: straightW, x0: x + w - r, y0: y + h, dx: -1, dy: 0 },
    { kind: "arc", len: arc, cx: x + r, cy: y + h - r, start: Math.PI / 2 },
    { kind: "line", len: straightH, x0: x, y0: y + h - r, dx: 0, dy: -1 },
    { kind: "arc", len: arc, cx: x + r, cy: y + r, start: Math.PI },
  ] as const
  const total = segments.reduce((sum, s) => sum + s.len, 0)
  const count = Math.min(Math.max(Math.floor(total / SPACING), 12), POOL)
  const points: Point[] = []

  for (let k = 0; k < count; k++) {
    let d = (k / count) * total
    for (const s of segments) {
      if (d > s.len) {
        d -= s.len
        continue
      }
      if (s.kind === "line") {
        points.push({ x: s.x0 + s.dx * d, y: s.y0 + s.dy * d, a: Math.atan2(s.dy, s.dx) })
      } else {
        const angle = s.start + (s.len ? (d / s.len) * (Math.PI / 2) : 0)
        points.push({
          x: s.cx + Math.cos(angle) * r,
          y: s.cy + Math.sin(angle) * r,
          a: angle + Math.PI / 2,
        })
      }
      break
    }
  }
  return points
}

/* -------------------------------------------------------------------------- */
/*                                   Motion                                   */
/* -------------------------------------------------------------------------- */

type Phase = "gather" | "trace" | "live" | "release" | "scatter"

// Unhurried on purpose: each component gets time to form, live and leave.
const TIMING: Record<Phase, number> = {
  gather: 1900,
  trace: 900,
  live: 4600,
  release: 600,
  scatter: 1400,
}

type Particle = {
  x: number
  y: number
  a: number
  alpha: number
  // Where the current move started and where it goes.
  fx: number
  fy: number
  fa: number
  falpha: number
  tx: number
  ty: number
  ta: number
  delay: number
  used: boolean
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** A caret looks the same turned by π, so take the shortest such turn. */
function lerpAngle(a: number, b: number, t: number) {
  let d = (b - a) % Math.PI
  if (d > Math.PI / 2) d -= Math.PI
  if (d < -Math.PI / 2) d += Math.PI
  return a + d * t
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export function HeroAssembly() {
  const reduceMotion = useReducedMotion()
  const [sceneIndex, setSceneIndex] = useState(0)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<Phase>("gather")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<{ phase: Phase; start: number }>({ phase: "gather", start: 0 })
  const outline = useRef<Point[]>([])
  const paused = useRef(false)

  const scene = SCENES[sceneIndex]
  const command = `npx shadcn add relicui/relic-ui/${scene.name}`
  const [typed, setTyped] = useState(0)

  // Measure the real component and turn its shape into caret positions.
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const el = targetRef.current?.firstElementChild as HTMLElement | null
    if (!canvas || !el) return
    const c = canvas.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
    outline.current = roundedRectOutline(r.left - c.left, r.top - c.top, r.width, r.height, radius)
  }, [sceneIndex, round])

  // The timeline: gather → trace → live → release → scatter → next scene.
  useEffect(() => {
    if (reduceMotion) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)))
    const go = (next: Phase) => {
      phaseRef.current = { phase: next, start: performance.now() }
      setPhase(next)
    }

    ;(async () => {
      await wait(40)
      if (cancelled) return
      go("gather")
      await wait(TIMING.gather)
      if (cancelled) return
      go("trace")
      await wait(TIMING.trace)
      if (cancelled) return
      go("live")
      await wait(TIMING.live)
      // Hovering the stage keeps the current component around to play with.
      while (paused.current && !cancelled) await wait(250)
      if (cancelled) return
      go("release")
      await wait(TIMING.release)
      if (cancelled) return
      go("scatter")
      await wait(TIMING.scatter)
      if (cancelled) return
      setSceneIndex((i) => (i + 1) % SCENES.length)
      setRound((r) => r + 1)
    })()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [sceneIndex, round, reduceMotion])

  // Type the install command while the component assembles.
  useEffect(() => {
    if (reduceMotion) return
    let n = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setTyped(0), 0))
    const step = () => {
      n += 1
      setTyped(n)
      if (n < command.length) timers.push(setTimeout(step, 38 + Math.random() * 40))
    }
    timers.push(setTimeout(step, 500))
    return () => timers.forEach(clearTimeout)
  }, [command, reduceMotion])

  // The caret swarm, drawn on a canvas.
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || reduceMotion) return

    let width = 0
    let height = 0
    let frame = 0
    let lastPhase: Phase | null = null
    const colors = { line: "gray", gold: "orange" }
    const particles: Particle[] = []

    function readColors() {
      const style = getComputedStyle(canvas!)
      colors.line = style.getPropertyValue("--muted-foreground").trim() || "gray"
      colors.gold = style.getPropertyValue("--brand").trim() || style.getPropertyValue("--primary").trim() || "orange"
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function randomPoint() {
      return { x: Math.random() * width, y: Math.random() * height }
    }

    resize()
    readColors()
    for (let i = 0; i < POOL; i++) {
      const p = randomPoint()
      particles.push({
        x: p.x, y: p.y, a: Math.PI / 2, alpha: 0,
        fx: p.x, fy: p.y, fa: Math.PI / 2, falpha: 0,
        tx: p.x, ty: p.y, ta: Math.PI / 2,
        delay: 0, used: false,
      })
    }

    // Each phase starts from wherever every caret is right now.
    function startPhase(next: Phase) {
      const points = outline.current
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.fx = p.x
        p.fy = p.y
        p.fa = p.a
        p.falpha = p.alpha
        if (next === "gather") {
          p.used = i < points.length
          if (p.used) {
            const target = points[i]
            p.tx = target.x
            p.ty = target.y
            p.ta = target.a
            // Start from somewhere in the field, out of sight.
            const start = randomPoint()
            p.fx = p.x = start.x
            p.fy = p.y = start.y
            p.fa = p.a = Math.PI / 2
            p.falpha = p.alpha = 0
            p.delay = Math.random() * 500
          }
        } else if (next === "scatter") {
          const angle = Math.random() * Math.PI * 2
          const distance = 60 + Math.random() * 160
          p.tx = p.x + Math.cos(angle) * distance
          p.ty = p.y + Math.sin(angle) * distance
          p.ta = Math.PI / 2
          p.delay = Math.random() * 220
        }
      }
    }

    function draw(now: number) {
      const { phase: current, start } = phaseRef.current
      if (current !== lastPhase) {
        startPhase(current)
        lastPhase = current
      }
      const t = now - start
      const points = outline.current

      ctx!.clearRect(0, 0, width, height)
      ctx!.lineCap = "round"
      ctx!.lineWidth = 1.5

      // The gold "pen" that runs around the outline while tracing.
      const head =
        current === "trace" ? clamp01(t / TIMING.trace) * points.length : -1

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (!p.used) continue

        if (current === "gather") {
          const k = easeInOut(clamp01((t - p.delay) / (TIMING.gather - 400)))
          p.x = lerp(p.fx, p.tx, k)
          p.y = lerp(p.fy, p.ty, k)
          p.a = lerpAngle(p.fa, p.ta, k)
          p.alpha = clamp01(k * 2)
        } else if (current === "trace" || current === "release") {
          p.x = p.tx
          p.y = p.ty
          p.a = p.ta
          p.alpha = current === "release" ? clamp01(t / 300) : 1
        } else if (current === "live") {
          p.alpha = 1 - clamp01(t / 300)
        } else if (current === "scatter") {
          const k = easeInOut(clamp01((t - p.delay) / (TIMING.scatter - 250)))
          p.x = lerp(p.fx, p.tx, k)
          p.y = lerp(p.fy, p.ty, k)
          p.a = lerpAngle(p.fa, p.ta, k)
          p.alpha = (1 - k) * p.falpha
        }

        if (p.alpha <= 0.01) continue
        const nearHead = head >= 0 && Math.abs(i - head) < 6
        const length = nearHead ? 10 : 6
        ctx!.globalAlpha = p.alpha * (nearHead ? 1 : 0.75)
        ctx!.strokeStyle = nearHead ? colors.gold : colors.line
        ctx!.beginPath()
        ctx!.moveTo(p.x - Math.cos(p.a) * length / 2, p.y - Math.sin(p.a) * length / 2)
        ctx!.lineTo(p.x + Math.cos(p.a) * length / 2, p.y + Math.sin(p.a) * length / 2)
        ctx!.stroke()
      }
      ctx!.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const themeObserver = new MutationObserver(readColors)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      themeObserver.disconnect()
    }
  }, [reduceMotion])

  const live = reduceMotion || phase === "live"
  const { Scene } = scene
  const shownCommand = reduceMotion ? command : command.slice(0, typed)
  const commandDone = reduceMotion || typed >= command.length

  return (
    <div className="flex w-full flex-col items-center">
      <div
        aria-label="Live component preview"
        role="region"
        onPointerEnter={() => (paused.current = true)}
        onPointerLeave={() => (paused.current = false)}
        className="relative flex h-28 w-full max-w-xl items-center justify-center"
      >
        {/* The canvas reaches beyond the stage so carets fly in from afar. */}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute -inset-x-32 -inset-y-20 h-[calc(100%+10rem)] w-[calc(100%+16rem)]"
        />
        <motion.div
          ref={targetRef}
          key={`${sceneIndex}-${round}`}
          inert={!live}
          initial={false}
          animate={{
            opacity: live ? 1 : 0,
            scale: live ? 1 : 0.985,
            filter: live ? "blur(0px)" : "blur(6px)",
          }}
          transition={{ duration: live ? 0.5 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex"
        >
          <Scene live={live} />
        </motion.div>
      </div>

      {/* The install command for whatever is on stage, typed out. */}
      <div className="mt-3 flex h-6 items-center gap-2 font-mono text-xs text-muted-foreground">
        <span aria-hidden className="text-foreground/40">$</span>
        <span>
          {shownCommand}
          <span
            aria-hidden
            className="ml-px inline-block h-3.5 w-[2px] translate-y-[2px] animate-caret-blink rounded-full bg-brand motion-reduce:animate-none"
          />
        </span>
        <Link
          href={`/docs/${scene.name}`}
          className="inline-flex items-center gap-0.5 text-foreground underline-offset-4 transition-opacity hover:underline"
          style={{ opacity: commandDone ? 1 : 0 }}
          tabIndex={commandDone ? 0 : -1}
        >
          docs <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}
