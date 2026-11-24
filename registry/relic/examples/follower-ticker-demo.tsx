"use client"

import { useEffect, useState } from "react"

import { FollowerTicker } from "@/registry/relic/ui/follower-ticker"

export default function FollowerTickerDemo() {
  const [x, setX] = useState(9_962)
  const [yt, setYt] = useState(48_214)
  const [ig, setIg] = useState(31_870)

  // Pretend live counts. X is about to cross 10K.
  useEffect(() => {
    const timer = setInterval(() => {
      setX((n) => n + Math.floor(Math.random() * 9))
      setYt((n) => n + Math.floor(Math.random() * 5))
      setIg((n) => n + Math.floor(Math.random() * 4))
    }, 1500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-start gap-3">
      <FollowerTicker platform="x" handle="mayacodes" count={x} />
      <FollowerTicker platform="youtube" handle="mayacodes" count={yt} />
      <FollowerTicker platform="instagram" handle="maya.makes" count={ig} compact />
    </div>
  )
}
