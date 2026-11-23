import { ImageResponse } from "next/og"

import { brand, MarkSvg } from "@/lib/brand"
import { siteConfig } from "@/lib/site"

// The preview image shown when a Relic UI link is shared on X, LinkedIn,
// WhatsApp, Discord, Slack …
export const alt = "Relic UI: interfaces that feel alive"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GAP = 40
const COLS = Math.floor(size.width / GAP)
const ROWS = Math.floor(size.height / GAP)

// A fixed set of "blinking" carets, so the image is the same every time.
const GOLD = new Set([37, 54, 92, 177, 244, 296, 361, 415, 432])

// Keep the pattern out of the area behind the logo and text.
const CLEAR = { left: 280, right: 920, top: 110, bottom: 540 }

export default function OpengraphImage() {
  const carets = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c
      const x = c * GAP + GAP / 2
      const y = r * GAP + GAP / 2
      if (x > CLEAR.left && x < CLEAR.right && y > CLEAR.top && y < CLEAR.bottom) {
        continue
      }
      const gold = GOLD.has(i)
      carets.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: c * GAP + GAP / 2 - 1,
            top: r * GAP + GAP / 2 - (gold ? 9 : 5),
            width: 2,
            height: gold ? 18 : 10,
            borderRadius: 2,
            background: gold ? brand.gold : brand.muted,
            opacity: gold ? 0.9 : 0.16,
          }}
        />
      )
    }
  }

  const host = siteConfig.url.replace(/^https?:\/\//, "")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: brand.background,
          color: brand.foreground,
        }}
      >
        {carets}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <MarkSvg size={120} />
          <div
            style={{
              marginTop: 28,
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -3,
              display: "flex",
            }}
          >
            Relic UI
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 34,
              color: brand.muted,
              display: "flex",
            }}
          >
            Interfaces that feel alive.
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize: 22,
              color: brand.gold,
              display: "flex",
            }}
          >
            {host}
          </div>
        </div>
      </div>
    ),
    size
  )
}
