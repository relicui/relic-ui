import { SpringSlider } from "@/registry/relic/ui/spring-slider"

export default function SpringSliderDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <SpringSlider label="Volume" defaultValue={40} />
      <SpringSlider label="Wobbly" defaultValue={70} stiffness={180} damping={7} />
    </div>
  )
}
