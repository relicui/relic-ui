import { TemperatureDial } from "@/registry/relic/ui/temperature-dial"

export default function TemperatureDialDemo() {
  return (
    <div className="w-full max-w-sm">
      <TemperatureDial defaultValue={0.7} />
    </div>
  )
}
