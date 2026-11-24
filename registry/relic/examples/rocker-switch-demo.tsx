import { RockerSwitch } from "@/registry/relic/ui/rocker-switch"

export default function RockerSwitchDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <RockerSwitch aria-label="Power" defaultChecked />
      <RockerSwitch aria-label="Wi-Fi" onLabel="ON" offLabel="OFF" size="lg" />
    </div>
  )
}
