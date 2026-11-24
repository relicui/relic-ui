import { ProfileDeck, type SocialProfile } from "@/registry/relic/ui/profile-deck"

export const myProfiles: SocialProfile[] = [
  { platform: "youtube", handle: "mayacodes", followers: 48_200, bio: "Weekly videos on building things for the web.", stats: [{ label: "Videos", value: 128 }, { label: "Views", value: 2_400_000 }] },
  { platform: "x", handle: "mayacodes", followers: 12_480, bio: "Shipping small tools. Notes on design and code.", stats: [{ label: "Posts", value: 3_210 }, { label: "Following", value: 412 }] },
  { platform: "instagram", handle: "maya.makes", followers: 31_900, bio: "Desk setups, sketches and behind the scenes.", stats: [{ label: "Posts", value: 286 }, { label: "Following", value: 190 }] },
  { platform: "github", handle: "mayacodes", followers: 3_870, bio: "Open source UI and tiny libraries.", stats: [{ label: "Repos", value: 64 }, { label: "Stars", value: 18_300 }] },
  { platform: "linkedin", handle: "maya-r", followers: 8_150, bio: "Design engineer.", stats: [{ label: "Connections", value: "500+" }] },
]

export default function ProfileDeckDemo() {
  return <ProfileDeck name="Maya Rao" profiles={myProfiles} />
}
