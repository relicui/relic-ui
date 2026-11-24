import { ScrollDepth } from "@/registry/relic/ui/scroll-depth"

/** A long pretend article for the heat to sit on. */
export function MockArticle() {
  const lines = (widths: string[]) => (
    <span className="flex flex-col gap-1.5">
      {widths.map((w, i) => (
        <span key={i} className="h-1.5 rounded bg-muted-foreground/25" style={{ width: w }} />
      ))}
    </span>
  )
  return (
    <div className="flex flex-col gap-5 bg-background p-5 select-none">
      <span className="h-4 w-3/4 rounded bg-foreground/80" />
      {lines(["100%", "94%", "88%"])}
      <span className="h-24 rounded-lg bg-muted" />
      {lines(["100%", "97%", "91%", "60%"])}
      <span className="h-3 w-1/2 rounded bg-foreground/60" />
      {lines(["100%", "93%", "96%", "72%"])}
      <span className="mx-auto h-7 w-32 rounded-md bg-primary" />
      {lines(["100%", "90%", "84%"])}
      <span className="h-20 rounded-lg bg-muted" />
      {lines(["100%", "95%", "40%"])}
      <span className="h-3 w-2/5 rounded bg-foreground/60" />
      {lines(["100%", "88%", "92%", "55%"])}
    </div>
  )
}

export const articleReach = [1, 0.97, 0.9, 0.81, 0.7, 0.6, 0.52, 0.45, 0.38, 0.32, 0.27, 0.23, 0.2, 0.17, 0.15]

export default function ScrollDepthDemo() {
  return (
    <div className="w-full max-w-md">
      <ScrollDepth reach={articleReach} fold={0.26} markers={[0.5, 0.25]}>
        <MockArticle />
      </ScrollDepth>
    </div>
  )
}
