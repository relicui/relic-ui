"use client"

/**
 * Relic UI · Stretch Switch
 * https://relic-ui.vercel.app/docs/stretch-switch
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useLayoutEffect, useRef, useState } from "react"
import { useAnimate, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

// Track width, thumb size and travel distance (px) for each size.
const SIZES = {
  sm: { track: "h-5 w-9", thumb: 16, travel: 16 },
  default: { track: "h-6 w-11", thumb: 20, travel: 20 },
  lg: { track: "h-8 w-14", thumb: 28, travel: 24 },
} as const

export interface StretchSwitchProps
  extends Omit<React.ComponentProps<"button">, "onChange" | "value"> {
  /** On or off (controlled). */
  checked?: boolean
  /** On or off at first (uncontrolled). */
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Size of the switch. */
  size?: keyof typeof SIZES
  /** How far the thumb stretches while it travels, as a share of its width. */
  stretch?: number
  /** Icon or text shown inside the thumb when on. */
  checkedIcon?: React.ReactNode
  /** Icon or text shown inside the thumb when off. */
  uncheckedIcon?: React.ReactNode
  /** Seconds for the thumb to travel. */
  duration?: number
  /** Round pill, or a softer rounded square. */
  shape?: "pill" | "square"
  /** Extra classes for the thumb, e.g. a color. */
  thumbClassName?: string
  /** Name for form submission. Sends "on" when checked. */
  name?: string
}

export function StretchSwitch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  size = "default",
  stretch = 0.45,
  checkedIcon,
  uncheckedIcon,
  duration = 0.38,
  shape = "pill",
  thumbClassName,
  name,
  disabled,
  className,
  onClick,
  ...props
}: StretchSwitchProps) {
  const [internal, setInternal] = useState(defaultChecked)
  const checked = checkedProp ?? internal
  const reduceMotion = useReducedMotion()
  const [scope, animate] = useAnimate<HTMLSpanElement>()
  const previous = useRef(checked)
  const { track, thumb, travel } = SIZES[size]

  // When the state changes, the leading edge travels first while the
  // trailing edge waits, so the thumb stretches like a drop of liquid.
  useLayoutEffect(() => {
    if (previous.current === checked || !scope.current) return
    previous.current = checked
    const wide = thumb * (1 + stretch)

    if (reduceMotion) {
      animate(scope.current, { x: checked ? travel : 0, width: thumb }, { duration: 0 })
      return
    }
    animate(
      scope.current,
      checked
        ? { x: [0, 0, travel], width: [thumb, wide, thumb] }
        : { x: [travel, travel - (wide - thumb), 0], width: [thumb, wide, thumb] },
      { duration, times: [0, 0.45, 1], ease: [0.65, 0, 0.35, 1] }
    )
  }, [checked, animate, scope, reduceMotion, thumb, travel, stretch, duration])

  function toggle() {
    const next = !checked
    if (checkedProp === undefined) setInternal(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      data-slot="stretch-switch"
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) toggle()
      }}
      className={cn(
        "relative inline-flex shrink-0 items-center p-0.5 transition-colors duration-300",
        shape === "pill" ? "rounded-full" : "rounded-md",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input dark:bg-input/80",
        track,
        className
      )}
      {...props}
    >
      <span
        ref={scope}
        aria-hidden
        className={cn(
          "flex items-center justify-center bg-background text-[10px] text-foreground shadow-sm [&_svg]:size-3",
          shape === "pill" ? "rounded-full" : "rounded-[4px]",
          thumbClassName
        )}
        style={{
          width: thumb,
          height: thumb,
          transform: `translateX(${checked ? travel : 0}px)`,
        }}
      >
        {checked ? checkedIcon : uncheckedIcon}
      </span>
      {name && <input type="hidden" name={name} value={checked ? "on" : ""} />}
    </button>
  )
}
