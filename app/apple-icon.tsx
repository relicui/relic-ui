import { ImageResponse } from "next/og"

import { brand, MarkSvg } from "@/lib/brand"

// Home-screen icon for iPhone and iPad.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
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
        <MarkSvg size={120} />
      </div>
    ),
    size
  )
}
