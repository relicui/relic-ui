"use client"

import { ScrollUnroll } from "@/registry/relic/ui/scroll-unroll"

/** The full LICENSE text, written on Relic UI's own Scroll Unroll component. */
export function LicenseScroll({ text }: { text: string }) {
  return (
    <ScrollUnroll title="Unroll the license">
      <pre className="font-serif text-[13px] leading-relaxed whitespace-pre-wrap">{text}</pre>
    </ScrollUnroll>
  )
}
