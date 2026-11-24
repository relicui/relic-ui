"use client"

/**
 * Relic UI · Orbit Menu
 * https://relic-ui.vercel.app/docs/orbit-menu
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useId, useState } from "react"
import {
  animate,
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

export type OrbitItem = {
  /** Accessible name, also shown as a tooltip. */
  label: string
  icon: React.ReactNode
  onSelect?: () => void
}

export interface OrbitMenuProps {
  items: OrbitItem[]
  /** Distance of the items from the center, in pixels. */
  radius?: number
  /** Seconds for one full orbit. */
  period?: number
  /** Open (controlled). */
  open?: boolean
  /** Open at first (uncontrolled). */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Accessible name of the center button. */
  label?: string
  className?: string
}

/**
 * A menu whose items orbit a center button like moons. They fly out when it
 * opens, drift slowly around it, stay upright as they go, and hold still
 * while you aim for one.
 */
export function OrbitMenu({
  items,
  radius = 84,
  period = 20,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  label = "Menu",
  className,
}: OrbitMenuProps) {
  const id = useId()
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = useState(defaultOpen)
  const open = openProp ?? internal
  const [hovered, setHovered] = useState(false)

  const orbit = useMotionValue(0)
  const upright = useTransform(orbit, (r) => -r)

  // Keep orbiting while open, and pause while the pointer is inside.
  useEffect(() => {
    if (!open || hovered || reduceMotion) return
    const controls = animate(orbit, orbit.get() + 360, {
      duration: period,
      ease: "linear",
      repeat: Infinity,
    })
    return () => controls.stop()
  }, [open, hovered, reduceMotion, period, orbit])

  function setOpen(next: boolean) {
    if (openProp === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  const box = radius * 2 + 64

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="orbit-menu"
        data-state={open ? "open" : "closed"}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
        }}
        className={cn("relative shrink-0", className)}
        style={{ width: box, height: box }}
      >
        {/* The orbit path. */}
        <motion.span
          aria-hidden
          className="absolute rounded-full border border-dashed border-muted-foreground/30"
          style={{ inset: 32 }}
          animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.4 }}
          transition={{ duration: 0.4 }}
        />

        <motion.div className="absolute inset-0" style={{ rotate: orbit }}>
          {items.map((item, i) => {
            const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2
            return (
              <motion.div
                key={item.label}
                id={`${id}-item-${i}`}
                className="absolute top-1/2 left-1/2"
                initial={false}
                animate={{
                  x: open ? Math.cos(angle) * radius : 0,
                  y: open ? Math.sin(angle) * radius : 0,
                  scale: open ? 1 : 0.3,
                  opacity: open ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: open ? i * 0.04 : 0 }}
              >
                <motion.button
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  tabIndex={open ? 0 : -1}
                  onClick={() => {
                    item.onSelect?.()
                    setOpen(false)
                  }}
                  style={{ rotate: upright }}
                  whileHover={{ scale: 1.15 }}
                  className="-mt-5.5 -ml-5.5 flex size-11 items-center justify-center rounded-full border bg-background text-foreground shadow-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4.5"
                >
                  {item.icon}
                </motion.button>
              </motion.div>
            )
          })}
        </motion.div>

        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform outline-none active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            className={cn("size-5 transition-transform duration-300", open && "rotate-45")}
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
      </div>
    </MotionConfig>
  )
}
