"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const GAP = 28 // distance between carets
const LENGTH = 7 // caret length at rest
const RADIUS = 180 // how far the cursor's pull reaches
const MAX_BLINKS = 5 // gold carets blinking at once
const BLINK_CHANCE = 0.025 // chance per frame that a new blink starts
const BLINK_DURATION = 1800 // ms a gold caret stays
const BLINK_STEP = 350 // ms per on/off step, like a text cursor

type Cell = { x: number; y: number; t: number; a: number }
type Blink = { index: number; start: number }

/** Wraps an angle into (-π/2, π/2]. A line looks the same rotated by π. */
function wrapHalfTurn(angle: number) {
  while (angle > Math.PI / 2) angle -= Math.PI
  while (angle <= -Math.PI / 2) angle += Math.PI
  return angle
}

/**
 * The Relic UI background: a field of tiny carets (the stem of our logo).
 * They turn toward the cursor like iron filings near a magnet, and now and
 * then one blinks in gold, as if someone is about to type.
 */
export function CaretField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let cells: Cell[] = []
    let blinks: Blink[] = []
    let frame = 0
    let visible = true
    const pointer = { x: 0, y: 0, active: false }
    const colors = { line: "gray", brand: "orange" }

    function readColors() {
      const style = getComputedStyle(canvas!)
      colors.line = style.getPropertyValue("--muted-foreground").trim() || "gray"
      colors.brand = style.getPropertyValue("--brand").trim() || "orange"
    }

    function layout() {
      const rect = canvas!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cols = Math.floor(width / GAP) + 1
      const rows = Math.floor(height / GAP) + 1
      const offsetX = (width - (cols - 1) * GAP) / 2
      const offsetY = (height - (rows - 1) * GAP) / 2
      cells = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({ x: offsetX + c * GAP, y: offsetY + r * GAP, t: 0, a: 0 })
        }
      }
      blinks = []
    }

    function line(x: number, y: number, angle: number, length: number) {
      const ux = Math.sin(angle) * (length / 2)
      const uy = Math.cos(angle) * (length / 2)
      ctx!.moveTo(x - ux, y - uy)
      ctx!.lineTo(x + ux, y + uy)
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, width, height)
      ctx!.lineCap = "round"
      ctx!.lineWidth = 1.5
      ctx!.strokeStyle = colors.line

      // Carets at rest share one path, which keeps drawing cheap.
      const resting = new Path2D()
      const active: Cell[] = []

      for (const cell of cells) {
        let targetT = 0
        let targetA = 0
        if (pointer.active && !reduceMotion) {
          const dx = pointer.x - cell.x
          const dy = pointer.y - cell.y
          const distance = Math.hypot(dx, dy)
          if (distance < RADIUS) {
            const k = 1 - distance / RADIUS
            targetT = k * k * (3 - 2 * k) // smoothstep
            targetA = wrapHalfTurn(Math.atan2(dy, dx) - Math.PI / 2)
          }
        }
        cell.t += (targetT - cell.t) * 0.14
        cell.a += wrapHalfTurn(targetA - cell.a) * 0.18

        if (cell.t < 0.01 && Math.abs(cell.a) < 0.01) {
          resting.moveTo(cell.x, cell.y - LENGTH / 2)
          resting.lineTo(cell.x, cell.y + LENGTH / 2)
        } else {
          active.push(cell)
        }
      }

      ctx!.globalAlpha = 0.28
      ctx!.stroke(resting)

      for (const cell of active) {
        ctx!.globalAlpha = 0.28 + cell.t * 0.55
        ctx!.beginPath()
        line(cell.x, cell.y, cell.a, LENGTH * (1 + cell.t))
        ctx!.stroke()
      }

      // Gold blinking carets.
      if (!reduceMotion && cells.length) {
        if (blinks.length < MAX_BLINKS && Math.random() < BLINK_CHANCE) {
          blinks.push({ index: Math.floor(Math.random() * cells.length), start: now })
        }
        blinks = blinks.filter((b) => now - b.start < BLINK_DURATION)
        ctx!.strokeStyle = colors.brand
        ctx!.lineWidth = 2
        for (const blink of blinks) {
          const on = Math.floor((now - blink.start) / BLINK_STEP) % 2 === 0
          if (!on) continue
          const cell = cells[blink.index]
          ctx!.globalAlpha = 0.95
          ctx!.beginPath()
          line(cell.x, cell.y, cell.a, LENGTH * 2)
          ctx!.stroke()
        }
      }
      ctx!.globalAlpha = 1
    }

    function loop(now: number) {
      draw(now)
      if (visible && !document.hidden) frame = requestAnimationFrame(loop)
    }

    function start() {
      cancelAnimationFrame(frame)
      if (reduceMotion) draw(performance.now())
      else frame = requestAnimationFrame(loop)
    }

    function handlePointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.active =
        pointer.x > -RADIUS &&
        pointer.y > -RADIUS &&
        pointer.x < width + RADIUS &&
        pointer.y < height + RADIUS
    }
    function handlePointerLeave() {
      pointer.active = false
    }

    readColors()
    layout()
    start()

    const resizeObserver = new ResizeObserver(() => {
      layout()
      if (reduceMotion) draw(performance.now())
    })
    resizeObserver.observe(canvas)

    // Pause while the hero is scrolled out of view.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else cancelAnimationFrame(frame)
    })
    intersectionObserver.observe(canvas)

    // Redraw with new colors when light/dark mode changes.
    const themeObserver = new MutationObserver(() => {
      readColors()
      if (reduceMotion) draw(performance.now())
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })

    const handleVisibility = () => {
      if (!document.hidden && visible) start()
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", handlePointerLeave)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      themeObserver.disconnect()
      window.removeEventListener("pointermove", handlePointerMove)
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none block size-full", className)}
    />
  )
}
