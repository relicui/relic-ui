"use client"

import { useEffect, useState } from "react"

import { VisitorCount } from "@/registry/relic/ui/visitor-count"

const START = [212, 230, 226, 251, 263, 248, 271, 289, 284, 302, 318, 311]

export default function VisitorCountDemo() {
  const [history, setHistory] = useState(START)

  // Pretend realtime updates. In your app these come from a socket or polling.
  useEffect(() => {
    const timer = setInterval(() => {
      setHistory((h) => {
        const last = h[h.length - 1]
        const next = Math.max(40, last + Math.round((Math.random() - 0.4) * 14))
        return [...h.slice(-23), next]
      })
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full max-w-xs">
      <VisitorCount value={history[history.length - 1]} history={history} />
    </div>
  )
}
