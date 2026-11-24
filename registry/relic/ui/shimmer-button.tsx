"use client"

/**
 * Relic UI · Shimmer Button
 * https://relic-ui.vercel.app/docs/shimmer-button
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { cva, type VariantProps } from "class-variance-authority"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const shimmerButtonVariants = cva(
  [
    "group/shimmer relative isolate inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden",
    "font-medium whitespace-nowrap select-none",
    "transition-[transform,box-shadow,background-color] duration-200 active:scale-[0.98]",
    "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        outline:
          "border bg-background text-foreground shadow-xs hover:bg-muted/60",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
      },
      shape: {
        rounded: "rounded-lg",
        pill: "rounded-full",
        square: "rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "rounded",
    },
  }
)

const shimmerColor = {
  default: "via-primary-foreground/25",
  secondary: "via-foreground/10",
  outline: "via-foreground/10",
} as const

export interface ShimmerButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof shimmerButtonVariants> {
  /** Seconds for one sweep across the button. */
  duration?: number
  /** Seconds to wait between sweeps. */
  delay?: number
  /** Classes for the shimmer band, e.g. "via-amber-300/40" to change its color. */
  shimmerClassName?: string
  /** Width of the shimmer band, as a percentage of the button. */
  shimmerWidth?: number
  /** Slant of the band, in degrees. 0 is upright. */
  angle?: number
  /** Which way the light travels. */
  direction?: "right" | "left"
}

export function ShimmerButton({
  className,
  variant,
  size,
  shape,
  duration = 1.6,
  delay = 1.2,
  shimmerClassName,
  shimmerWidth = 50,
  angle = 12,
  direction = "right",
  children,
  ...props
}: ShimmerButtonProps) {
  const reduceMotion = useReducedMotion()

  // The band moves by its own width, so the end point depends on how wide it is.
  const width = Math.min(Math.max(shimmerWidth, 5), 100)
  const start = "-120%"
  const end = `${(100 / width) * 100 + 20}%`

  return (
    <button
      data-slot="shimmer-button"
      className={cn(shimmerButtonVariants({ variant, size, shape }), className)}
      {...props}
    >
      {!reduceMotion && (
        <motion.span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 -z-10",
            "bg-gradient-to-r from-transparent to-transparent",
            shimmerColor[variant ?? "default"],
            shimmerClassName
          )}
          style={{ width: `${width}%`, skewX: -angle }}
          initial={{ x: direction === "right" ? start : end }}
          animate={{ x: direction === "right" ? end : start }}
          transition={{
            duration,
            repeat: Infinity,
            repeatDelay: delay,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      )}
      {children}
    </button>
  )
}

export { shimmerButtonVariants }
