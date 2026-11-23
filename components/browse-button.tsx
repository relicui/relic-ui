"use client"

import { useRouter } from "next/navigation"

import { ShimmerButton } from "@/registry/relic/ui/shimmer-button"

export function BrowseButton() {
  const router = useRouter()
  return (
    <ShimmerButton onClick={() => router.push("/docs")}>
      Browse Components
    </ShimmerButton>
  )
}
