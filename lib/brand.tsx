/**
 * Brand values for generated images (avatar, Open Graph, Apple icon).
 * Image generation can't read CSS variables, so the colors are fixed here.
 */
export const brand = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  muted: "#a1a1a1",
  gold: "#f5b83d",
}

/** The Relic UI mark as plain SVG, for use inside ImageResponse. */
export function MarkSvg({
  size,
  color = brand.foreground,
  caret = brand.gold,
}: {
  size: number
  color?: string
  caret?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 6V26" stroke={caret} />
      <path d="M13 6H17A6.5 6.5 0 0 1 17 19H13" stroke={color} />
      <path d="M17.5 19L23.5 26" stroke={color} />
    </svg>
  )
}
