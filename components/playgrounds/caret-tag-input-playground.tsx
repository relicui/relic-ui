"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  toJsx,
} from "@/components/docs/playground-controls"
import { CaretTagInput } from "@/registry/relic/ui/caret-tag-input"

const START = ["design", "motion"]

const DEFAULTS = {
  max: 6,
  variant: "secondary" as "secondary" | "outline" | "primary",
  size: "default" as "sm" | "default" | "lg",
  allowDuplicates: false,
  flyFromCaret: true,
}

export function CaretTagInputPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [tags, setTags] = useState<string[]>(START)

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setTags(START)
      }}
      preview={
        <div className="w-full max-w-sm">
          <CaretTagInput label="Topics" value={tags} onValueChange={setTags} {...o} />
          <p className="mt-2 text-xs text-muted-foreground">
            {tags.length} / {o.max} tags · try adding a duplicate
          </p>
        </div>
      }
      controls={
        <>
          <OptionGroup label="variant" options={["secondary", "outline", "primary"] as const} value={o.variant} onChange={(v) => setO({ ...o, variant: v })} />
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <RangeControl label="max" value={o.max} min={1} max={12} onChange={(v) => setO({ ...o, max: v })} />
          <ToggleList>
            <Toggle label="flyFromCaret" checked={o.flyFromCaret} onChange={(v) => setO({ ...o, flyFromCaret: v })} />
            <Toggle label="allowDuplicates" checked={o.allowDuplicates} onChange={(v) => setO({ ...o, allowDuplicates: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("CaretTagInput", { label: "Topics", ...o }, { ...DEFAULTS, max: undefined })}
    />
  )
}
