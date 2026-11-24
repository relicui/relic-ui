"use client"

import { useState } from "react"

import { ResponseVersions } from "@/registry/relic/ui/response-versions"

const ANSWERS = [
  "A haiku is a short poem in three lines of five, seven and five syllables, often about nature.",
  "A haiku is a tiny Japanese poem: three lines, about seventeen syllables, catching a single moment.",
  "Think of a haiku as a photograph in words: three short lines that capture one fleeting scene.",
  "Haiku come from Japan. Three lines, roughly 5-7-5 syllables, usually with a seasonal image.",
]

export default function ResponseVersionsDemo() {
  const [count, setCount] = useState(2)
  const [writing, setWriting] = useState(false)

  function regenerate() {
    setWriting(true)
    // Pretend the AI takes a moment to write a new answer.
    setTimeout(() => {
      setCount((c) => Math.min(c + 1, ANSWERS.length))
      setWriting(false)
    }, 1400)
  }

  return (
    <div className="w-full max-w-md">
      <ResponseVersions
        versions={ANSWERS.slice(0, count)}
        regenerating={writing}
        onRegenerate={count < ANSWERS.length ? regenerate : undefined}
      />
    </div>
  )
}
