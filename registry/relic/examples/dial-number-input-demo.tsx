import { DialNumberInput } from "@/registry/relic/ui/dial-number-input"

export default function DialNumberInputDemo() {
  return (
    <DialNumberInput
      label="Guests"
      defaultValue={4}
      min={1}
      max={20}
    />
  )
}
