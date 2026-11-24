import { AstrolabePicker } from "@/registry/relic/ui/astrolabe-picker"

const seasons = ["Spring", "Summer", "Autumn", "Winter", "Dawn", "Dusk"]

export default function AstrolabePickerDemo() {
  return <AstrolabePicker label="Choose a season" options={seasons} defaultValue="Summer" />
}
