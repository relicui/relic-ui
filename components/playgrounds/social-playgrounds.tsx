"use client"

/** Playgrounds for the Social & Profiles components. */

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { mutualFriends } from "@/registry/relic/examples/follow-button-demo"
import { growth } from "@/registry/relic/examples/milestone-road-demo"
import { myProfiles } from "@/registry/relic/examples/profile-deck-demo"
import { audience } from "@/registry/relic/examples/reach-rings-demo"
import { FollowButton } from "@/registry/relic/ui/follow-button"
import { FollowerTicker } from "@/registry/relic/ui/follower-ticker"
import { MilestoneRoad } from "@/registry/relic/ui/milestone-road"
import { ProfileDeck } from "@/registry/relic/ui/profile-deck"
import { ReachRings } from "@/registry/relic/ui/reach-rings"

const small = "rounded-md border px-2.5 py-1 text-xs transition-colors hover:bg-muted"

/* ------------------------------- Profile Deck ------------------------------ */

export function ProfileDeckPlayground() {
  const D = { layout: "stack" as "stack" | "fan", tint: true, autoShuffle: 0, count: 5 }
  const [o, setO] = useState(D)
  const [index, setIndex] = useState(0)
  const { count, ...props } = o
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="flex flex-col items-center gap-2 py-4">
          <ProfileDeck key={count} name="Maya Rao" profiles={myProfiles.slice(0, count)} {...props} index={index} onIndexChange={setIndex} />
          <p className="text-xs text-muted-foreground">Drag the top card sideways, or use ← →</p>
        </div>
      }
      controls={
        <>
          <OptionGroup label="layout" options={["stack", "fan"] as const} value={o.layout} onChange={(v) => setO({ ...o, layout: v })} />
          <RangeControl label="autoShuffle" value={o.autoShuffle} min={0} max={6} step={1} onChange={(v) => setO({ ...o, autoShuffle: v })} />
          <RangeControl label="Profiles" value={o.count} min={2} max={5} step={1} onChange={(v) => setO({ ...o, count: v })} />
          <ToggleList>
            <Toggle label="tint" checked={o.tint} onChange={(v) => setO({ ...o, tint: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("ProfileDeck", { name: "Maya Rao", profiles: raw("profiles"), ...props }, { layout: "stack", tint: true, autoShuffle: 0 })}
    />
  )
}

/* ----------------------------- Follower Ticker ----------------------------- */

const PLATFORMS = ["x", "instagram", "youtube", "github", "linkedin", "twitch"] as const

export function FollowerTickerPlayground() {
  const D = {
    platform: "x" as (typeof PLATFORMS)[number],
    size: "md" as "sm" | "md" | "lg",
    compact: false,
    showRing: true,
    showNext: true,
    celebrate: true,
  }
  const [o, setO] = useState(D)
  const [count, setCount] = useState(9_940)
  return (
    <PlaygroundShell
      onReset={() => {
        setO(D)
        setCount(9_940)
      }}
      preview={
        <div className="flex flex-col items-center gap-4 pt-6">
          <FollowerTicker {...o} handle="mayacodes" count={count} />
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className={small} onClick={() => setCount((c) => c + 1)}>
              +1
            </button>
            <button type="button" className={small} onClick={() => setCount((c) => c + 25)}>
              +25
            </button>
            <button type="button" className={small} onClick={() => setCount((c) => c + 4_000)}>
              +4K
            </button>
            <button type="button" className={small} onClick={() => setCount((c) => Math.max(0, c - 100))}>
              −100
            </button>
            <button type="button" className={small} onClick={() => setCount(9_940)}>
              Back to 9,940
            </button>
          </div>
        </div>
      }
      controls={
        <>
          <OptionGroup label="platform" options={PLATFORMS} value={o.platform} onChange={(v) => setO({ ...o, platform: v })} />
          <OptionGroup label="size" options={["sm", "md", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <ToggleList>
            <Toggle label="compact" checked={o.compact} onChange={(v) => setO({ ...o, compact: v })} />
            <Toggle label="showRing" checked={o.showRing} onChange={(v) => setO({ ...o, showRing: v })} />
            <Toggle label="showNext" checked={o.showNext} onChange={(v) => setO({ ...o, showNext: v })} />
            <Toggle label="celebrate" checked={o.celebrate} onChange={(v) => setO({ ...o, celebrate: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("FollowerTicker", { ...o, count: raw("followers") }, { ...D, platform: "" })}
    />
  )
}

/* ------------------------------ Follow Button ------------------------------ */

export function FollowButtonPlayground() {
  const D = { size: "md" as "sm" | "md", compact: false, showCount: true, showMutuals: true, confirmUnfollow: true }
  const [o, setO] = useState(D)
  const [following, setFollowing] = useState(false)
  return (
    <PlaygroundShell
      onReset={() => {
        setO(D)
        setFollowing(false)
      }}
      preview={
        <div className="flex w-full max-w-sm flex-col gap-2">
          <div className="rounded-xl border bg-background p-4">
            <FollowButton name="Maya Rao" followers={12_480} mutuals={mutualFriends} mutualCount={14} {...o} following={following} onFollowingChange={setFollowing} />
          </div>
          <p className="text-xs text-muted-foreground">
            following: <span className="font-mono text-foreground">{String(following)}</span>
          </p>
        </div>
      }
      controls={
        <>
          <OptionGroup label="size" options={["sm", "md"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <ToggleList>
            <Toggle label="showCount" checked={o.showCount} onChange={(v) => setO({ ...o, showCount: v })} />
            <Toggle label="showMutuals" checked={o.showMutuals} onChange={(v) => setO({ ...o, showMutuals: v })} />
            <Toggle label="confirmUnfollow" checked={o.confirmUnfollow} onChange={(v) => setO({ ...o, confirmUnfollow: v })} />
            <Toggle label="compact" checked={o.compact} onChange={(v) => setO({ ...o, compact: v })} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "FollowButton",
        { name: "Maya Rao", followers: raw("followers"), mutuals: raw("mutuals"), following: raw("following"), onFollowingChange: raw("setFollowing"), ...o },
        D
      )}
    />
  )
}

/* ------------------------------- Reach Rings ------------------------------- */

export function ReachRingsPlayground() {
  const D = { size: 220, thickness: 14, gap: 5, sweep: 290, sort: true, showLegend: true, animate: true }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={<ReachRings key={`${o.animate}-${o.sort}`} profiles={audience} {...o} />}
      controls={
        <>
          <RangeControl label="size" value={o.size} min={150} max={300} step={10} onChange={(v) => setO({ ...o, size: v })} />
          <RangeControl label="thickness" value={o.thickness} min={6} max={22} step={1} onChange={(v) => setO({ ...o, thickness: v })} />
          <RangeControl label="gap" value={o.gap} min={2} max={12} step={1} onChange={(v) => setO({ ...o, gap: v })} />
          <RangeControl label="sweep" value={o.sweep} min={180} max={350} step={10} onChange={(v) => setO({ ...o, sweep: v })} />
          <ToggleList>
            <Toggle label="sort" checked={o.sort} onChange={(v) => setO({ ...o, sort: v })} />
            <Toggle label="showLegend" checked={o.showLegend} onChange={(v) => setO({ ...o, showLegend: v })} />
            <Toggle label="animate" checked={o.animate} onChange={(v) => setO({ ...o, animate: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("ReachRings", { profiles: raw("audience"), ...o }, D)}
    />
  )
}

/* ------------------------------ Milestone Road ----------------------------- */

export function MilestoneRoadPlayground() {
  const latest = growth[growth.length - 1].count
  const D = { visible: 5, showProjection: true, count: latest, initials: true }
  const [o, setO] = useState(D)
  const { count, initials, ...props } = o
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="w-full max-w-lg">
          <MilestoneRoad key={`${count}-${props.visible}`} count={count} history={growth} {...props} marker={initials ? "MR" : undefined} />
        </div>
      }
      controls={
        <>
          <RangeControl label="count" value={o.count} min={500} max={120_000} step={500} onChange={(v) => setO({ ...o, count: v })} />
          <RangeControl label="visible" value={o.visible} min={3} max={7} step={1} onChange={(v) => setO({ ...o, visible: v })} />
          <ToggleList>
            <Toggle label="showProjection" checked={o.showProjection} onChange={(v) => setO({ ...o, showProjection: v })} />
            <Toggle label="Initials marker" checked={o.initials} onChange={(v) => setO({ ...o, initials: v })} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "MilestoneRoad",
        { count: raw("followers"), history: raw("history"), ...props, marker: initials ? "MR" : undefined },
        { visible: 5, showProjection: true }
      )}
    />
  )
}
