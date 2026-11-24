"use client"

import { useState } from "react"
import { Code, Lightbulb, Mail, PenLine, Plane } from "lucide-react"

import { PromptDeck } from "@/registry/relic/ui/prompt-deck"

const prompts = [
  { title: "Plan a trip", prompt: "Plan a 3-day trip to Kyoto on a small budget.", icon: <Plane /> },
  { title: "Write an email", prompt: "Write a friendly follow-up after a job interview.", icon: <Mail /> },
  { title: "Explain code", prompt: "Explain what this React hook does, line by line.", icon: <Code /> },
  { title: "Brainstorm", prompt: "Give me 10 names for a cozy coffee shop.", icon: <Lightbulb /> },
  { title: "Polish writing", prompt: "Make this paragraph clearer and shorter.", icon: <PenLine /> },
]

export default function PromptDeckDemo() {
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <PromptDeck prompts={prompts} onPick={(p) => setPicked(p.prompt)} autoShuffle={3} />
      <p className="h-5 text-center text-xs text-muted-foreground">
        {picked ? `“${picked}”` : "Hover a card, then click to use it."}
      </p>
    </div>
  )
}
