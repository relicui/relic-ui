"use client"

/**
 * Relic UI · Pull Chain Toggle
 * https://relic-ui.vercel.app/docs/pull-chain-toggle
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type P = { x: number; y: number; px: number; py: number }

const WIDTH = 72

export interface PullChainToggleProps {
  /** On or off (controlled). */
  checked?: boolean
  /** On or off at first (uncontrolled). */
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Number of links in the chain. */
  links?: number
  /** Length of each link, in pixels. */
  linkLength?: number
  /** How far (in pixels) the handle must be pulled to switch. */
  threshold?: number
  /** Accessible name. */
  label?: string
  className?: string
}

/**
 * A hanging pull chain with real rope physics. Drag the handle down and let
 * go to switch; it swings and bounces back. Click or press Enter for a tug.
 */
export function PullChainToggle({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  links = 12,
  linkLength = 9,
  threshold = 26,
  label = "Toggle",
  className,
}: PullChainToggleProps) {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = useState(defaultChecked)
  const checked = checkedProp ?? internal
  const height = links * linkLength + 56
  const restY = 6 + links * linkLength

  const svgRef = useRef<SVGSVGElement>(null)
  const chainRef = useRef<SVGPolylineElement>(null)
  const handleRef = useRef<SVGGElement>(null)
  const points = useRef<P[]>([])
  const grab = useRef<{ x: number; y: number } | null>(null)
  const dragged = useRef(false)
  const toggleRef = useRef<() => void>(() => {})

  function toggle() {
    const next = !checked
    if (checkedProp === undefined) setInternal(next)
    onCheckedChange?.(next)
  }
  useEffect(() => {
    toggleRef.current = toggle
  })

  /** Give the handle a downward yank. */
  function tug() {
    const end = points.current[points.current.length - 1]
    if (end && !reduceMotion) end.py = end.y - 12
  }

  // The rope simulation (Verlet integration), drawn straight into the SVG.
  useEffect(() => {
    points.current = Array.from({ length: links + 1 }, (_, i) => {
      const y = 6 + i * linkLength
      return { x: WIDTH / 2, y, px: WIDTH / 2, py: y }
    })
    let frame = 0

    function step() {
      const pts = points.current
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i]
        const vx = (p.x - p.px) * 0.985
        const vy = (p.y - p.py) * 0.985
        p.px = p.x
        p.py = p.y
        p.x += vx
        p.y += vy + 0.35
      }
      const end = pts[pts.length - 1]
      if (grab.current) {
        end.x = grab.current.x
        end.y = grab.current.y
      }
      for (let k = 0; k < 12; k++) {
        pts[0].x = WIDTH / 2
        pts[0].y = 6
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i]
          const b = pts[i + 1]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.hypot(dx, dy) || 1
          // Links can stretch a little when pulled, but not compress.
          if (dist < linkLength) continue
          const diff = (dist - linkLength) / dist
          const aFixed = i === 0
          const bFixed = i + 1 === pts.length - 1 && grab.current
          const share = aFixed ? 1 : bFixed ? 0 : 0.5
          if (!aFixed) {
            a.x += dx * diff * (1 - share)
            a.y += dy * diff * (1 - share)
          }
          if (!bFixed) {
            b.x -= dx * diff * share
            b.y -= dy * diff * share
          }
        }
      }
      chainRef.current?.setAttribute("points", pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "))
      handleRef.current?.setAttribute("transform", `translate(${end.x.toFixed(1)} ${end.y.toFixed(1)})`)
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [links, linkLength])

  function local(e: React.PointerEvent) {
    const rect = svgRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      data-slot="pull-chain-toggle"
      data-state={checked ? "on" : "off"}
      onClick={() => {
        // A drag already switched it; a plain click or Enter gives a tug.
        if (dragged.current) {
          dragged.current = false
          return
        }
        tug()
        toggleRef.current()
      }}
      className={cn(
        "relative inline-flex touch-none rounded-lg outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      style={{ width: WIDTH, height }}
    >
      <svg
        ref={svgRef}
        aria-hidden
        width={WIDTH}
        height={height}
        className="overflow-visible"
        onPointerDown={(e) => {
          const p = local(e)
          const end = points.current[points.current.length - 1]
          if (!end || Math.hypot(p.x - end.x, p.y - end.y) > 26) return
          // Capturing can fail (e.g. for a simulated or already-ended pointer);
          // the component still works without it.
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {
            // not capturable, carry on
          }
          grab.current = p
        }}
        onPointerMove={(e) => {
          if (!grab.current) return
          const p = local(e)
          // The handle can be pulled down and swung, but not lifted above its rest.
          grab.current = { x: Math.min(Math.max(p.x, 6), WIDTH - 6), y: Math.max(p.y, restY - 4) }
        }}
        onPointerUp={() => {
          if (!grab.current) return
          const pulled = grab.current.y - restY
          grab.current = null
          if (pulled > threshold) {
            dragged.current = true
            toggleRef.current()
          } else if (pulled > 4) {
            dragged.current = true
          }
        }}
      >
        <rect x={WIDTH / 2 - 10} y="0" width="20" height="5" rx="2" className="fill-muted-foreground/60" />
        <polyline
          ref={chainRef}
          fill="none"
          strokeWidth="2.5"
          strokeDasharray="3 2"
          strokeLinecap="round"
          className="stroke-muted-foreground"
        />
        <g ref={handleRef} transform={`translate(${WIDTH / 2} ${restY})`} className="cursor-grab active:cursor-grabbing">
          <rect
            x="-7" y="0" width="14" height="24" rx="7"
            className={cn("transition-colors duration-300", checked ? "fill-primary" : "fill-foreground/80")}
          />
          <circle cx="0" cy="17" r="2.5" className={checked ? "fill-primary-foreground" : "fill-background"} />
        </g>
      </svg>
    </button>
  )
}
