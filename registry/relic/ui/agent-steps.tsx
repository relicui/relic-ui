"use client"

/**
 * Relic UI · Agent Steps
 * https://relic-ui.vercel.app/docs/agent-steps
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useState } from "react"
import { MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type AgentStep = {
  label: React.ReactNode
  status: "pending" | "running" | "done" | "error"
  /** Smaller text under the label, e.g. what was found. */
  detail?: React.ReactNode
}

export interface AgentStepsProps
  extends Omit<React.ComponentProps<"ol">, "children"> {
  steps: AgentStep[]
  /** Show a live timer on the running step. */
  showTimer?: boolean
}

/** Counts seconds from when it mounts, i.e. from when a step starts running. */
function Elapsed() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const started = Date.now()
    const timer = setInterval(() => setSeconds((Date.now() - started) / 1000), 100)
    return () => clearInterval(timer)
  }, [])
  return <span className="font-mono text-xs text-muted-foreground tabular-nums">{seconds.toFixed(1)}s</span>
}

function Marker({ status }: { status: AgentStep["status"] }) {
  if (status === "running") {
    return (
      <span className="relative flex size-5 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </span>
    )
  }
  if (status === "pending") {
    return <span className="size-5 rounded-full border-2 border-dashed border-muted-foreground/40" />
  }
  const done = status === "done"
  return (
    <motion.span
      initial={{ scale: 0.6 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={cn(
        "flex size-5 items-center justify-center rounded-full",
        done ? "bg-primary text-primary-foreground" : "bg-destructive text-white"
      )}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-3">
        <motion.path
          d={done ? "M3.5 8.5l3 3 6-6.5" : "M5 5l6 6M11 5l-6 6"}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        />
      </svg>
    </motion.span>
  )
}

/**
 * A live checklist of what an AI agent is doing. The running step spins and
 * counts time, finished steps draw their check, and the line between steps
 * fills in as the work moves along.
 */
export function AgentSteps({ steps, showTimer = true, className, ...props }: AgentStepsProps) {
  return (
    <MotionConfig reducedMotion="user">
      <ol data-slot="agent-steps" className={cn("flex w-full flex-col text-sm", className)} {...props}>
        {steps.map((step, i) => {
          const last = i === steps.length - 1
          const complete = step.status === "done" || step.status === "error"
          return (
            <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {!last && (
                <span aria-hidden className="absolute top-6 bottom-0.5 left-2.5 w-px -translate-x-1/2 bg-border">
                  <motion.span
                    className="absolute inset-0 origin-top bg-primary"
                    initial={false}
                    animate={{ scaleY: complete ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              )}
              <span className="relative z-10 flex size-5 shrink-0 self-start">
                <Marker key={step.status} status={step.status} />
              </span>
              <div className="min-w-0 flex-1 pt-px">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "transition-colors",
                      step.status === "pending" ? "text-muted-foreground" : "text-foreground",
                      step.status === "error" && "text-destructive"
                    )}
                  >
                    {step.label}
                    <span className="sr-only"> ({step.status})</span>
                  </span>
                  {showTimer && step.status === "running" && <Elapsed key={i} />}
                </div>
                {step.detail && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-0.5 text-xs text-muted-foreground"
                  >
                    {step.detail}
                  </motion.p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </MotionConfig>
  )
}
