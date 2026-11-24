"use client"

/**
 * Relic UI · Rocker Switch
 * https://relic-ui.vercel.app/docs/rocker-switch
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const SIZES = {
  sm: { box: "h-7 w-16", text: "text-[10px]" },
  default: { box: "h-9 w-20", text: "text-xs" },
  lg: { box: "h-11 w-24", text: "text-sm" },
} as const

export interface RockerSwitchProps
  extends Omit<React.ComponentProps<"button">, "onChange" | "value"> {
  /** On or off (controlled). */
  checked?: boolean
  /** On or off at first (uncontrolled). */
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Label on the "on" side of the rocker. */
  onLabel?: React.ReactNode
  /** Label on the "off" side of the rocker. */
  offLabel?: React.ReactNode
  /** How far the rocker tilts, in degrees. */
  tilt?: number
  size?: keyof typeof SIZES
  /** Name for form submission. Sends "on" when checked. */
  name?: string
}

/**
 * A physical light-switch rocker. The pressed half sinks into its housing
 * and falls into shadow, while the other half rises toward the light.
 */
export function RockerSwitch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  onLabel = "I",
  offLabel = "O",
  tilt = 16,
  size = "default",
  name,
  disabled,
  className,
  onClick,
  ...props
}: RockerSwitchProps) {
  const [internal, setInternal] = useState(defaultChecked)
  const checked = checkedProp ?? internal
  const reduceMotion = useReducedMotion()
  const { box, text } = SIZES[size]

  function toggle() {
    const next = !checked
    if (checkedProp === undefined) setInternal(next)
    onCheckedChange?.(next)
  }

  // "On" presses the left half, so the left edge tips away from the viewer.
  const rotateY = reduceMotion ? 0 : checked ? -tilt : tilt

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      data-slot="rocker-switch"
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) toggle()
      }}
      className={cn(
        "group relative inline-flex shrink-0 rounded-lg border bg-muted p-1 shadow-inner",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        box,
        className
      )}
      style={{ perspective: 220 }}
      {...props}
    >
      <motion.span
        aria-hidden
        className="relative flex size-full overflow-hidden rounded-md border bg-background shadow-sm"
        initial={false}
        animate={{ rotateY }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 520, damping: 24 }}
      >
        <Half pressed={checked} className={text}>
          {onLabel}
        </Half>
        <span className="w-px shrink-0 bg-border" />
        <Half pressed={!checked} className={text}>
          {offLabel}
        </Half>
      </motion.span>
      {name && <input type="hidden" name={name} value={checked ? "on" : ""} />}
    </button>
  )
}

function Half({
  pressed,
  className,
  children,
}: {
  pressed: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "relative flex flex-1 items-center justify-center font-mono font-semibold transition-colors duration-200",
        pressed ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      {children}
      {/* Shadow on the pressed half, a soft highlight on the raised one. */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-200",
          "bg-gradient-to-b from-foreground/12 to-foreground/4",
          pressed ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent transition-opacity duration-200 dark:from-white/10",
          pressed ? "opacity-0" : "opacity-100"
        )}
      />
    </span>
  )
}
