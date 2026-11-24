import { Bell, Home, Mail, Search, Settings, User } from "lucide-react"

import { OrbitMenu } from "@/registry/relic/ui/orbit-menu"

const items = [
  { label: "Home", icon: <Home /> },
  { label: "Search", icon: <Search /> },
  { label: "Messages", icon: <Mail /> },
  { label: "Notifications", icon: <Bell /> },
  { label: "Profile", icon: <User /> },
  { label: "Settings", icon: <Settings /> },
]

export default function OrbitMenuDemo() {
  return <OrbitMenu items={items} defaultOpen />
}
