import { Moon, Sun } from "lucide-react"

import { StretchSwitch } from "@/registry/relic/ui/stretch-switch"

export default function StretchSwitchDemo() {
  return (
    <div className="flex flex-col items-start gap-4 text-sm">
      <label className="flex items-center gap-3">
        <StretchSwitch defaultChecked />
        Email notifications
      </label>
      <label className="flex items-center gap-3">
        <StretchSwitch
          size="lg"
          checkedIcon={<Moon />}
          uncheckedIcon={<Sun />}
        />
        Dark mode
      </label>
    </div>
  )
}
