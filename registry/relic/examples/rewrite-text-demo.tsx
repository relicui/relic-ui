import { RewriteText } from "@/registry/relic/ui/rewrite-text"

export default function RewriteTextDemo() {
  return (
    <p className="text-3xl font-semibold tracking-tight">
      Build something{" "}
      <RewriteText words={["beautiful", "playful", "accessible", "yours"]} />
    </p>
  )
}
