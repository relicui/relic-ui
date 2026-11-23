import { cn } from "@/lib/utils"

/**
 * The Relic UI mark: an "R" whose stem is a separate text caret.
 * The caret is always drawn in relic gold, and can blink.
 *
 * Geometry (32×32 grid, 3.2 stroke, round caps):
 *   caret  M8.5 6 V26
 *   bowl   M13 6 H17 A6.5 6.5 0 0 1 17 19 H13
 *   leg    M17.5 19 L23.5 26
 */
export function RelicMark({
  className,
  caretClassName,
  blink = false,
  title = "Relic UI",
}: {
  className?: string
  /** Extra classes for the caret stem, e.g. "group-hover:animate-caret-blink". */
  caretClassName?: string
  /** Blink the caret stem like a text cursor. */
  blink?: boolean
  /** Accessible name. Pass an empty string when the mark is decorative. */
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={cn("size-6 shrink-0", className)}
    >
      <path
        d="M8.5 6V26"
        className={cn(
          "stroke-brand",
          blink && "animate-caret-blink motion-reduce:animate-none",
          caretClassName
        )}
      />
      <path d="M13 6H17A6.5 6.5 0 0 1 17 19H13" stroke="currentColor" />
      <path d="M17.5 19L23.5 26" stroke="currentColor" />
    </svg>
  )
}

/** Mark + wordmark, for the header and anywhere the full name is needed. */
export function RelicLogo({
  className,
  blink = false,
  caretClassName,
  animated = false,
}: {
  className?: string
  blink?: boolean
  caretClassName?: string
  /**
   * Quiet idle life: the caret breathes and a gold glint crosses "Relic"
   * every few seconds. Hovering a parent with the `group` class blinks the
   * caret, plays the glint at once and brightens "UI". Styles live in
   * globals.css (.relic-logo-caret, .relic-wordmark).
   */
  animated?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <RelicMark
        blink={blink}
        caretClassName={cn(animated && "relic-logo-caret", caretClassName)}
        title=""
      />
      <span className="font-semibold tracking-tight">
        <span className={cn(animated && "relic-wordmark")}>Relic</span>
        <span
          className={cn(
            "text-muted-foreground transition-colors duration-300",
            animated && "group-hover:text-foreground group-focus-visible:text-foreground"
          )}
        >
          {" "}
          UI
        </span>
      </span>
    </span>
  )
}
