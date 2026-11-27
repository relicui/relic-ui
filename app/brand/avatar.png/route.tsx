import { ImageResponse } from "next/og"

import { brand, MarkSvg } from "@/lib/brand"

// A 512×512 PNG of the logo, to upload as the GitHub (or X, Discord …) avatar.
// Download it from /brand/avatar.png
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.background,
        }}
      >
        <MarkSvg size={340} />
      </div>
    ),
    { width: 512, height: 512 }
  )
}
