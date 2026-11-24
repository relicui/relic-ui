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
    "rounded-lg font-medium whitespace-nowrap select-none",
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
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
}

export function ShimmerButton({
  className,
  variant,
  size,
  duration = 1.6,
  delay = 1.2,
  shimmerClassName,
  children,
  ...props
}: ShimmerButtonProps) {
  const reduceMotion = useReducedMotion()

  return (
    <button
      data-slot="shimmer-button"
      className={cn(shimmerButtonVariants({ variant, size }), className)}
      {...props}
    >
      {!reduceMotion && (
        <motion.span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/2 -skew-x-12",
            "bg-gradient-to-r from-transparent to-transparent",
            shimmerColor[variant ?? "default"],
            shimmerClassName
          )}
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
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
