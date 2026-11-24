"use client"

/**
 * Relic UI · Jelly Card
 * https://relic-ui.vercel.app/docs/jelly-card
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useRef, useState } from "react"
import { motion, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

export interface JellyCardProps extends React.ComponentProps<"div"> {
  /** How soft the jelly is. 0 is solid, 2 is very wobbly. */
  intensity?: number
  /** Extra classes for the card surface (the part that wobbles). */
  cardClassName?: string
}

const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v))

/**
 * A card made of jelly: press it and it squishes from where you pressed, drag
 * it and it leans after your finger, let go and it wobbles back into shape.
 */
export function JellyCard({
  intensity = 1,
  cardClassName,
  className,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  ...props
}: JellyCardProps) {
  const reduceMotion = useReducedMotion()
  const spring = { stiffness: 380, damping: 9 + 6 / Math.max(intensity, 0.2), mass: 0.9 }
  const scaleX = useSpring(1, spring)
  const scaleY = useSpring(1, spring)
  const skewX = useSpring(0, spring)
  const skewY = useSpring(0, spring)
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)
  const [origin, setOrigin] = useState("50% 50%")
  const start = useRef<{ x: number; y: number } | null>(null)

  const k = reduceMotion ? 0 : intensity

  function release() {
    if (!start.current) return
    start.current = null
    scaleX.set(1)
    scaleY.set(1)
    skewX.set(0)
    skewY.set(0)
    x.set(0)
    y.set(0)
  }

  return (
    <div
      data-slot="jelly-card"
      className={cn("touch-none select-none", className)}
      onPointerDown={(e) => {
        onPointerDown?.(e)
        const rect = e.currentTarget.getBoundingClientRect()
        setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`)
        // Capturing can fail (e.g. for a simulated or already-ended pointer);
        // the component still works without it.
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          // not capturable, carry on
        }
        start.current = { x: e.clientX, y: e.clientY }
        // Squish: a little wider, a little shorter, from the press point.
        scaleX.set(1 + 0.05 * k)
        scaleY.set(1 - 0.07 * k)
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e)
        if (!start.current) return
        const dx = e.clientX - start.current.x
        const dy = e.clientY - start.current.y
        x.set(clamp(dx * 0.15 * k, 24))
        y.set(clamp(dy * 0.15 * k, 24))
        skewX.set(clamp(-dx * 0.05 * k, 8))
        skewY.set(clamp(dy * 0.03 * k, 5))
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e)
        release()
      }}
      onPointerCancel={(e) => {
        onPointerCancel?.(e)
        release()
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e)
        release()
      }}
      {...props}
    >
      <motion.div
        style={{ scaleX, scaleY, skewX, skewY, x, y, transformOrigin: origin }}
        className={cn("rounded-2xl border bg-card p-6 text-card-foreground shadow-sm", cardClassName)}
      >
        {children}
      </motion.div>
    </div>
  )
}
