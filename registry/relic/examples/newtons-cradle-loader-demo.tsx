import { NewtonsCradleLoader } from "@/registry/relic/ui/newtons-cradle-loader"

export default function NewtonsCradleLoaderDemo() {
  return (
    <div className="flex items-end justify-center gap-10">
      <NewtonsCradleLoader size="sm" />
      <NewtonsCradleLoader />
      <NewtonsCradleLoader size="lg" balls={6} duration={1.8} />
    </div>
  )
}
