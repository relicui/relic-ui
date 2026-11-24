"use client"

/**
 * Relic UI · Perforated Card
 * https://relic-ui.vercel.app/docs/perforated-card
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

const PERFORATIONS = {
  dashed: "border-dashed",
  dotted: "border-dotted",
} as const

// How the stub leaves once it's torn off, for each direction.
const EXIT_EFFECTS = {
  vertical: {
    fall: { y: 260, rotate: 14, opacity: 0, transition: { duration: 0.6, ease: [0.4, 0, 1, 1] } },
    fly: { x: 320, y: 60, rotate: 28, opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.6, 1] } },
    fade: { opacity: 0, scale: 0.96, transition: { duration: 0.3, ease: "easeOut" } },
  },
  horizontal: {
    fall: { x: 40, y: 280, rotate: 24, opacity: 0, transition: { duration: 0.65, ease: [0.4, 0, 1, 1] } },
    fly: { x: 360, y: -30, rotate: 20, opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.6, 1] } },
    fade: { opacity: 0, scale: 0.96, transition: { duration: 0.3, ease: "easeOut" } },
  },
} as const

export interface PerforatedCardProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** Main content of the card, before the perforation. */
  children: React.ReactNode
  /** Content on the tear-off stub. */
  stub: React.ReactNode
  /** Content revealed once the stub is torn off. */
  reveal: React.ReactNode
  /**
   * Stub below, pulled down to tear (vertical), or stub on the right like a
   * cinema ticket, pulled sideways (horizontal).
   */
  orientation?: "vertical" | "horizontal"
  /** Width of the stub in horizontal cards, e.g. "35%" or 120. */
  stubSize?: number | string
  /** How far (in pixels) the stub must be pulled to tear. */
  threshold?: number
  /** Style of the tear line. */
  perforation?: keyof typeof PERFORATIONS
  /** Show the half-circle cut-outs at each end of the tear line. */
  notches?: boolean
  /** How the stub leaves once it's torn off. */
  exitEffect?: "fall" | "fly" | "fade"
  /** How far (in degrees) the stub tilts as you pull it. */
  tilt?: number
  /** A simple click or tap also tears the stub, not just dragging. */
  tearOnClick?: boolean
  /** Called when the stub is torn off. */
  onTear?: () => void
  /** Accessible label for the stub. */
  tearLabel?: string
}

/** Half-circle cut-outs at both ends of the perforation, on one side of it. */
function Notches({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  const spots =
    side === "top" || side === "bottom"
      ? [`${side === "top" ? "-top-2.5" : "-bottom-2.5"} -left-2.5`, `${side === "top" ? "-top-2.5" : "-bottom-2.5"} -right-2.5`]
      : [`${side === "left" ? "-left-2.5" : "-right-2.5"} -top-2.5`, `${side === "left" ? "-left-2.5" : "-right-2.5"} -bottom-2.5`]
  return (
    <>
      {spots.map((spot) => (
        <span key={spot} aria-hidden className={cn("absolute size-5 rounded-full border bg-background", spot)} />
      ))}
    </>
  )
}

export function PerforatedCard({
  children,
  stub,
  reveal,
  orientation = "vertical",
  stubSize = "36%",
  threshold = 70,
  perforation = "dashed",
  notches = true,
  exitEffect = "fall",
  tilt = 3,
  tearOnClick = false,
  onTear,
  tearLabel = "Tear off the stub to reveal hidden content",
  className,
  ...props
}: PerforatedCardProps) {
  const [torn, setTorn] = useState(false)
  const revealRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const horizontal = orientation === "horizontal"

  const pull = useMotionValue(0)
  // The tear starts at one corner, so the stub tilts as you pull.
  const rotate = useTransform(pull, [0, threshold], [0, tilt])

  // Move keyboard focus to what was revealed.
  useEffect(() => {
    if (torn) revealRef.current?.focus()
  }, [torn])

  function tear() {
    if (torn) return
    setTorn(true)
    navigator.vibrate?.(10)
    onTear?.()
  }

  const stubElement = (
    <AnimatePresence>
      {!torn && (
        <motion.div
          key="stub"
          role="button"
          tabIndex={0}
          aria-label={tearLabel}
          drag={horizontal ? "x" : "y"}
          dragConstraints={horizontal ? { left: 0, right: 0 } : { top: 0, bottom: 0 }}
          dragElastic={horizontal ? { left: 0.04, right: 0.6 } : { top: 0.04, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            const offset = horizontal ? info.offset.x : info.offset.y
            const velocity = horizontal ? info.velocity.x : info.velocity.y
            if (offset > threshold || velocity > 600) tear()
          }}
          onClick={() => {
            if (tearOnClick) tear()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              tear()
            }
          }}
          style={
            horizontal
              ? { x: pull, rotate, transformOrigin: "bottom left" }
              : { y: pull, rotate, transformOrigin: "top left" }
          }
          exit={reduceMotion ? { opacity: 0, transition: { duration: 0.15 } } : EXIT_EFFECTS[orientation][exitEffect]}
          className={cn(
            "absolute inset-0 z-10 cursor-grab overflow-hidden border bg-card p-6 text-card-foreground select-none active:cursor-grabbing",
            horizontal ? "touch-pan-y rounded-r-xl border-l-0 p-5" : "touch-none rounded-b-xl border-t-0",
            "outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
        >
          {notches && <Notches side={horizontal ? "left" : "top"} />}
          {stub}
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (horizontal) {
    return (
      <div
        data-slot="perforated-card"
        data-state={torn ? "torn" : "intact"}
        data-orientation="horizontal"
        className={cn("relative flex w-full text-sm", className)}
        {...props}
      >
        {/* Main part */}
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-l-xl border border-r-0 bg-card p-6 text-card-foreground">
          {children}
          <span aria-hidden className={cn("absolute inset-y-4 right-0 border-r-2", PERFORATIONS[perforation])} />
          {notches && <Notches side="right" />}
        </div>

        <div className="relative shrink-0" style={{ width: stubSize }}>
          {/* Hidden content, underneath the stub */}
          <div
            ref={revealRef}
            tabIndex={-1}
            inert={!torn}
            className="relative h-full overflow-hidden rounded-r-xl border border-l-0 bg-muted/40 p-5 outline-none"
          >
            {notches && <Notches side="left" />}
            {reveal}
          </div>
          {stubElement}
        </div>
      </div>
    )
  }

  return (
    <div
      data-slot="perforated-card"
      data-state={torn ? "torn" : "intact"}
      data-orientation="vertical"
      className={cn("relative w-full text-sm", className)}
      {...props}
    >
      {/* Main part */}
      <div className="relative overflow-hidden rounded-t-xl border border-b-0 bg-card p-6 text-card-foreground">
        {children}
        <span aria-hidden className={cn("absolute inset-x-4 bottom-0 border-t-2", PERFORATIONS[perforation])} />
        {notches && <Notches side="bottom" />}
      </div>

      <div className="relative">
        {/* Hidden content, underneath the stub */}
        <div
          ref={revealRef}
          tabIndex={-1}
          inert={!torn}
          className="relative overflow-hidden rounded-b-xl border border-t-0 bg-muted/40 p-6 outline-none"
        >
          {notches && <Notches side="top" />}
          {reveal}
        </div>
        {stubElement}
      </div>
    </div>
  )
}
