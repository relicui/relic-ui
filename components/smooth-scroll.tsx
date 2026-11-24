"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/**
 * Smooth, eased page scrolling (mouse wheel and trackpad). Touch scrolling
 * stays native, which already feels right on phones. Scrollable areas inside
 * the page (code blocks, the docs sidebar) keep scrolling on their own.
 * Skipped entirely for people who prefer reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      autoRaf: true,
      // Lower is smoother and floatier; 0.1 is calm without feeling laggy.
      lerp: 0.1,
      smoothWheel: true,
      allowNestedScroll: true,
      anchors: true,
      // Let number dials keep using the wheel themselves while focused.
      prevent: (node) =>
        node.getAttribute("role") === "spinbutton" && node === document.activeElement,
    })

    return () => lenis.destroy()
  }, [])

  return null
}
