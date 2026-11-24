import { WaxSealButton } from "@/registry/relic/ui/wax-seal-button"

export default function WaxSealButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <WaxSealButton sealedChildren="Signed">Sign the agreement</WaxSealButton>
      <WaxSealButton emblem="R" waxColor="#1d3557" sealedChildren="Sealed">
        Seal the letter
      </WaxSealButton>
    </div>
  )
}
