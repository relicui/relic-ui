import { ElasticDivider } from "@/registry/relic/ui/elastic-divider"

export default function ElasticDividerDemo() {
  return (
    <div className="w-full max-w-md">
      <div>
        <p className="text-sm font-medium">Profile</p>
        <p className="text-sm text-muted-foreground">
          Move your cursor across the line below.
        </p>
      </div>
      <ElasticDivider />
      <div>
        <p className="text-sm font-medium">Notifications</p>
        <p className="text-sm text-muted-foreground">
          It bends toward you and wobbles back when you let go.
        </p>
      </div>
    </div>
  )
}
