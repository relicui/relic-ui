import { ReachRings, type Reach } from "@/registry/relic/ui/reach-rings"

export const audience: Reach[] = [
  { platform: "youtube", handle: "mayacodes", followers: 48_200 },
  { platform: "instagram", handle: "maya.makes", followers: 31_900 },
  { platform: "x", handle: "mayacodes", followers: 12_480 },
  { platform: "linkedin", handle: "maya-r", followers: 8_150 },
  { platform: "github", handle: "mayacodes", followers: 3_870 },
]

export default function ReachRingsDemo() {
  return <ReachRings profiles={audience} />
}
