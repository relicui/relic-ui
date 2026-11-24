"use client"

import { useState } from "react"
import { Moon, Sun } from "lucide-react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { StretchSwitch } from "@/registry/relic/ui/stretch-switch"

const DEFAULTS = { size: "default" as "sm" | "default" | "lg", stretch: 0.45 }

export function StretchSwitchPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const [icons, setIcons] = useState(false)

  return (
    <PlaygroundShell
      onReset={() => {
        setO(DEFAULTS)
        setIcons(false)
      }}
      preview={
        <StretchSwitch
          aria-label="Playground switch"
          {...o}
          checkedIcon={icons ? <Moon /> : undefined}
          uncheckedIcon={icons ? <Sun /> : undefined}
        />
      }
      controls={
        <>
          <OptionGroup label="size" options={["sm", "default", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <RangeControl label="stretch" value={o.stretch} min={0} max={1} step={0.05} onChange={(v) => setO({ ...o, stretch: v })} />
          <ToggleList>
            <Toggle label="icons" checked={icons} onChange={setIcons} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "StretchSwitch",
        {
          ...o,
          checkedIcon: icons ? raw("<Moon />") : undefined,
          uncheckedIcon: icons ? raw("<Sun />") : undefined,
        },
        DEFAULTS
      )}
    />
  )
}
