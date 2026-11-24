import { HourglassLoader } from "@/registry/relic/ui/hourglass-loader"

export default function HourglassLoaderDemo() {
  return (
    <div className="flex items-end justify-center gap-8">
      <HourglassLoader size="sm" duration={2} />
      <HourglassLoader />
      <HourglassLoader size="lg" duration={4} />
    </div>
  )
}
