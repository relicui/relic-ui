"use client"

/**
 * Self-playing gallery demos for the Social & Profiles components. Like the
 * others, they only perform inside an AutoplayFrame and hand over when the
 * visitor takes control.
 */

import { useRef, useState } from "react"

import { useAutoplayInterval } from "@/components/autoplay/autoplay-frame"
import { mutualFriends } from "@/registry/relic/examples/follow-button-demo"
import { myProfiles } from "@/registry/relic/examples/profile-deck-demo"
import { audience } from "@/registry/relic/examples/reach-rings-demo"
import { FollowButton } from "@/registry/relic/ui/follow-button"
import { ProfileDeck } from "@/registry/relic/ui/profile-deck"
import { ReachRings } from "@/registry/relic/ui/reach-rings"

export function AutoProfileDeck() {
  const [index, setIndex] = useState(0)
  useAutoplayInterval(2200, () => setIndex((i) => (i + 1) % myProfiles.length))
  return <ProfileDeck name="Maya Rao" profiles={myProfiles} index={index} onIndexChange={setIndex} />
}

export function AutoFollowButton() {
  const ref = useRef<HTMLDivElement>(null)
  useAutoplayInterval(2600, () => {
    ref.current?.querySelector<HTMLButtonElement>("button[aria-pressed]")?.click()
  })
  return (
    <div ref={ref} className="w-full max-w-sm rounded-xl border bg-background p-4">
      <FollowButton name="Maya Rao" followers={12_480} mutuals={mutualFriends} mutualCount={14} />
    </div>
  )
}

export function AutoReachRings() {
  const ref = useRef<HTMLDivElement>(null)
  const last = useRef<Element | null>(null)
  const tick = useRef(0)
  // Visit each platform, then show the total again.
  useAutoplayInterval(1500, () => {
    const rows = ref.current?.querySelectorAll("li button")
    if (!rows?.length) return
    const k = tick.current % (rows.length + 1)
    tick.current += 1
    const target = k < rows.length ? rows[k] : ref.current?.querySelector("[data-slot=reach-rings]")
    if (k === rows.length) {
      target?.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: document.body }))
      last.current = null
      return
    }
    target?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, relatedTarget: last.current }))
    last.current = target ?? null
  })
  return (
    <div ref={ref}>
      <ReachRings profiles={audience} size={200} />
    </div>
  )
}
