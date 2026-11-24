"use client"

import { useEffect, useState } from "react"

import { AgentSteps, type AgentStep } from "@/registry/relic/ui/agent-steps"

const LABELS = [
  "Searching the docs",
  "Reading 3 pages",
  "Drafting the answer",
  "Checking the code examples",
]
const DETAILS = ["Found 12 matches", "Picked the most relevant", "", "All examples run"]

export default function AgentStepsDemo() {
  // Which step is running; once past the end, everything is done.
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c > LABELS.length ? 0 : c + 1)), 1600)
    return () => clearInterval(id)
  }, [])

  const steps: AgentStep[] = LABELS.map((label, i) => ({
    label,
    status: i < current ? "done" : i === current ? "running" : "pending",
    detail: i < current && DETAILS[i] ? DETAILS[i] : undefined,
  }))

  return (
    <div className="w-full max-w-xs">
      <AgentSteps steps={steps} />
    </div>
  )
}
