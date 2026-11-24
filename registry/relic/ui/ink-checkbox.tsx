"use client"

/**
 * Relic UI · Ink Checkbox
 * https://relic-ui.vercel.app/docs/ink-checkbox
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const SIZES = {
  sm: { box: 16, className: "size-4 rounded" },
  default: { box: 20, className: "size-5 rounded-md" },
  lg: { box: 24, className: "size-6 rounded-md" },
} as const

export interface InkCheckboxProps
  extends Omit<React.ComponentProps<"button">, "onChange" | "value"> {
  /** Checked or not (controlled). */
  checked?: boolean
  /** Checked at first (uncontrolled). */
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Text next to the box. Clicking it toggles the box too. */
  label?: React.ReactNode
  size?: keyof typeof SIZES
  /** Name for form submission. Sends "on" when checked. */
  name?: string
}

/**
 * Ink bleeds out from exactly where you clicked until it fills the box,
 * then the check mark draws itself. Unchecking drains the ink away.
 */
export function InkCheckbox({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  label,
  size = "default",
  name,
  disabled,
  className,
  onClick,
  onPointerDown,
  ...props
}: InkCheckboxProps) {
  const [internal, setInternal] = useState(defaultChecked)
  const checked = checkedProp ?? internal
  const reduceMotion = useReducedMotion()
  const { box, className: boxClass } = SIZES[size]

  // Where the ink starts. Clicks remember the pointer; keyboard uses the center.
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const [origin, setOrigin] = useState({ x: box / 2, y: box / 2 })

  // Big enough to cover the box from any starting point.
  const diameter = box * 3

  function toggle() {
    setOrigin(pointer.current ?? { x: box / 2, y: box / 2 })
    pointer.current = null
    const next = !checked
    if (checkedProp === undefined) setInternal(next)
    onCheckedChange?.(next)
  }

  const control = (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      data-slot="ink-checkbox"
      disabled={disabled}
      onPointerDown={(e) => {
        onPointerDown?.(e)
        const rect = e.currentTarget.getBoundingClientRect()
        pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      }}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) toggle()
      }}
      className={cn(
        "relative isolate inline-flex shrink-0 overflow-hidden border shadow-xs transition-colors duration-300",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-primary" : "border-input bg-background",
        boxClass,
        !label && className
      )}
      {...props}
    >
      <AnimatePresence initial={false}>
        {checked && (
          <motion.span
            key="ink"
            aria-hidden
            className="absolute -z-10 rounded-full bg-primary"
            style={{
              left: origin.x - diameter / 2,
              top: origin.y - diameter / 2,
              width: diameter,
              height: diameter,
            }}
            initial={reduceMotion ? false : { scale: 0, filter: "blur(2px)" }}
            animate={{ scale: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { scale: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        className="size-full p-[18%] text-primary-foreground"
      >
        <motion.path
          d="M3 8.5l3.2 3.2L13 4.8"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.25, delay: checked ? 0.16 : 0, ease: "easeOut" }
          }
        />
      </svg>
      {name && <input type="hidden" name={name} value={checked ? "on" : ""} />}
    </button>
  )

  if (!label) return control

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5 text-sm select-none",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {control}
      <span>{label}</span>
    </label>
  )
}
