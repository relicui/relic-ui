import { FollowButton } from "@/registry/relic/ui/follow-button"

export const mutualFriends = [{ name: "Aisha Khan" }, { name: "Ben Ortiz" }, { name: "Chen Wei" }]

export default function FollowButtonDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-background p-4">
      <FollowButton name="Maya Rao" followers={12_480} mutuals={mutualFriends} mutualCount={14} />
    </div>
  )
}
