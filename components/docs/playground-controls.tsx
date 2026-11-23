"use client"

import { CodeBlock } from "@/components/docs/code-block"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                   Layout                                   */
/* -------------------------------------------------------------------------- */

/** Live preview on the left, controls on the right, generated code below. */
export function PlaygroundShell({
  preview,
  controls,
  code,
  onReset,
}: {
  preview: React.ReactNode
  controls: React.ReactNode
  code: string
  onReset: () => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="grid md:grid-cols-[1fr_15rem]">
        <div className="flex min-h-72 items-center justify-center border-b bg-muted/20 p-8 md:border-r md:border-b-0">
          {preview}
        </div>
        <div className="flex flex-col gap-4 p-4">
          {controls}
          <button
            type="button"
            onClick={onReset}
            className="self-start text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Reset to defaults
          </button>
        </div>
      </div>
      <div className="border-t p-4">
        <CodeBlock code={code} />
      </div>
    </div>
  )
}

/** Groups on/off switches under a divider. */
export function ToggleList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2.5 border-t pt-4">{children}</div>
}

/* -------------------------------------------------------------------------- */
/*                                  Controls                                  */
/* -------------------------------------------------------------------------- */

/** A row of mutually exclusive options, like a segmented control. */
export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={option === value}
            onClick={() => onChange(option)}
            className={cn(
              "h-7 rounded-md border px-2.5 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              option === value
                ? "border-foreground bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

/** A slider for numeric props. */
export function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="flex items-center justify-between">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-mono">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-foreground"
      />
    </label>
  )
}

/** An on/off switch with a label. */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
      <span className="font-mono">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          checked ? "bg-foreground" : "bg-muted-foreground/30"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow-sm transition-transform",
            checked && "translate-x-4"
          )}
        />
      </button>
    </label>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Code generation                              */
/* -------------------------------------------------------------------------- */

/** Wrap a value to print it as raw JSX, e.g. raw("items") → items={items}. */
export type Raw = { raw: string }
export const raw = (code: string): Raw => ({ raw: code })

/**
 * Builds a JSX snippet. Props equal to their default (or undefined) are left
 * out, so the code only shows what the user actually changed.
 */
export function toJsx(
  name: string,
  props: Record<string, unknown>,
  defaults: Record<string, unknown> = {},
  children?: string
) {
  const attrs: string[] = []
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === defaults[key]) continue
    if (typeof value === "string") attrs.push(`${key}="${value}"`)
    else if (typeof value === "object" && value !== null && "raw" in value)
      attrs.push(`${key}={${(value as Raw).raw}}`)
    else attrs.push(`${key}={${JSON.stringify(value)}}`)
  }

  const indented = attrs.map((a) => `  ${a}`).join("\n")
  if (children === undefined) {
    return attrs.length ? `<${name}\n${indented}\n/>` : `<${name} />`
  }
  const open = attrs.length ? `<${name}\n${indented}\n>` : `<${name}>`
  return `${open}\n  ${children}\n</${name}>`
}
