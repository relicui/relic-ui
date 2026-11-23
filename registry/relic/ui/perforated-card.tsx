"use client"

/**
 * Relic UI · Perforated Card
 * https://relic-ui.vercel.app/docs/perforated-card
 *
 * Copyright (c) 2026 Shubham Tambe
 * Relic UI License (MIT + attribution + Commons Clause).
 * Keep this notice. Full license: https://relic-ui.vercel.app/license
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

// How the stub leaves once it's torn off.
const EXIT_EFFECTS = {
  fall: {
    y: 260,
    rotate: 14,
    opacity: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 1, 1] },
  },
  fly: {
    x: 320,
    y: 60,
    rotate: 28,
    opacity: 0,
    transition: { duration: 0.55, ease: [0.4, 0, 0.6, 1] },
  },
  fade: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.3, ease: "easeOut" },
  },
} as const

export interface PerforatedCardProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** Main content of the card, above the perforation. */
  children: React.ReactNode
  /** Content on the tear-off stub. */
  stub: React.ReactNode
  /** Content revealed once the stub is torn off. */
  reveal: React.ReactNode
  /** How far (in pixels) the stub must be pulled to tear. */
  threshold?: number
  /** Style of the tear line. */
  perforation?: keyof typeof PERFORATIONS
  /** Show the half-circle cut-outs at each end of the tear line. */
  notches?: boolean
  /** How the stub leaves once it's torn off. */
  exitEffect?: keyof typeof EXIT_EFFECTS
  /** Called when the stub is torn off. */
  onTear?: () => void
  /** Accessible label for the stub. */
  tearLabel?: string
}

/** Half-circle cut-outs on either side of the perforation. */
function Notches({ edge }: { edge: "top" | "bottom" }) {
  const position = edge === "top" ? "-top-2.5" : "-bottom-2.5"
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute -left-2.5 size-5 rounded-full border bg-background",
          position
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute -right-2.5 size-5 rounded-full border bg-background",
          position
        )}
      />
    </>
  )
}

export function PerforatedCard({
  children,
  stub,
  reveal,
  threshold = 70,
  perforation = "dashed",
  notches = true,
  exitEffect = "fall",
  onTear,
  tearLabel = "Tear off the stub to reveal hidden content",
  className,
  ...props
}: PerforatedCardProps) {
  const [torn, setTorn] = useState(false)
  const revealRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const y = useMotionValue(0)
  // The stub starts tearing from one corner, so it tilts as you pull.
  const rotate = useTransform(y, [0, threshold], [0, 3])

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

  return (
    <div
      data-slot="perforated-card"
      data-state={torn ? "torn" : "intact"}
      className={cn("relative w-full text-sm", className)}
      {...props}
    >
      {/* Main part */}
      <div className="relative overflow-hidden rounded-t-xl border border-b-0 bg-card p-6 text-card-foreground">
        {children}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-4 bottom-0 border-t-2",
            PERFORATIONS[perforation]
          )}
        />
        {notches && <Notches edge="bottom" />}
      </div>

      <div className="relative">
        {/* Hidden content, underneath the stub */}
        <div
          ref={revealRef}
          tabIndex={-1}
          inert={!torn}
          className="relative overflow-hidden rounded-b-xl border border-t-0 bg-muted/40 p-6 outline-none"
        >
          {notches && <Notches edge="top" />}
          {reveal}
        </div>

        <AnimatePresence>
          {!torn && (
            <motion.div
              key="stub"
              role="button"
              tabIndex={0}
              aria-label={tearLabel}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > threshold || info.velocity.y > 600) tear()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  tear()
                }
              }}
              style={{ y, rotate, transformOrigin: "top left" }}
              exit={
                reduceMotion
                  ? { opacity: 0, transition: { duration: 0.15 } }
                  : EXIT_EFFECTS[exitEffect]
              }
              className={cn(
                "absolute inset-0 z-10 cursor-grab touch-none overflow-hidden rounded-b-xl border border-t-0 bg-card p-6 text-card-foreground select-none active:cursor-grabbing",
                "outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            >
              {notches && <Notches edge="top" />}
              {stub}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
