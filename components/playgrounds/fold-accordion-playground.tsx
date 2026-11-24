"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { FoldAccordion } from "@/registry/relic/ui/fold-accordion"

const items = [
  {
    value: "one",
    title: "Shipping",
    content: "Orders leave our studio within two working days.",
  },
  {
    value: "two",
    title: "Returns",
    content: "Send anything back within 30 days for a full refund.",
  },
  {
    value: "three",
    title: "Support",
    content: "Reach us any time. We usually reply within a few hours.",
  },
]

const DEFAULTS = {
  variant: "bordered" as "bordered" | "separated" | "plain",
  springiness: "paper" as "subtle" | "paper" | "bouncy",
  icon: "chevron" as "chevron" | "plus" | "none",
  iconPosition: "right" as "left" | "right",
  foldAngle: 92,
  multiple: false,
  showCrease: true,
}

export function FoldAccordionPlayground() {
  const [o, setO] = useState(DEFAULTS)

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <div className="w-full max-w-sm">
          {/* Remount when switching single/multiple so the open state starts clean. */}
          <FoldAccordion key={String(o.multiple)} items={items} {...o} />
        </div>
      }
      controls={
        <>
          <OptionGroup label="variant" options={["bordered", "separated", "plain"] as const} value={o.variant} onChange={(v) => setO({ ...o, variant: v })} />
          <OptionGroup label="springiness" options={["subtle", "paper", "bouncy"] as const} value={o.springiness} onChange={(v) => setO({ ...o, springiness: v })} />
          <OptionGroup label="icon" options={["chevron", "plus", "none"] as const} value={o.icon} onChange={(v) => setO({ ...o, icon: v })} />
          <OptionGroup label="iconPosition" options={["left", "right"] as const} value={o.iconPosition} onChange={(v) => setO({ ...o, iconPosition: v })} />
          <RangeControl label="foldAngle" value={o.foldAngle} min={20} max={180} unit="°" onChange={(v) => setO({ ...o, foldAngle: v })} />
          <ToggleList>
            <Toggle label="multiple" checked={o.multiple} onChange={(v) => setO({ ...o, multiple: v })} />
            <Toggle label="showCrease" checked={o.showCrease} onChange={(v) => setO({ ...o, showCrease: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("FoldAccordion", { items: raw("items"), ...o }, DEFAULTS)}
    />
  )
}
