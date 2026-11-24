import { FoldTree, type TreeNode } from "@/registry/relic/ui/fold-tree"

export const projectFiles: TreeNode[] = [
  {
    id: "app",
    label: "app",
    children: [
      { id: "layout", label: "layout.tsx" },
      { id: "page", label: "page.tsx" },
      {
        id: "docs",
        label: "docs",
        children: [
          { id: "docs-page", label: "page.tsx" },
          { id: "docs-slug", label: "[slug]", children: [{ id: "slug-page", label: "page.tsx" }] },
        ],
      },
    ],
  },
  {
    id: "components",
    label: "components",
    children: [
      {
        id: "ui",
        label: "ui",
        children: [
          { id: "button", label: "button.tsx" },
          { id: "fold-tree", label: "fold-tree.tsx" },
        ],
      },
      { id: "header", label: "site-header.tsx" },
    ],
  },
  { id: "public", label: "public", children: [] },
  { id: "package", label: "package.json" },
  { id: "readme", label: "README.md" },
]

export default function FoldTreeDemo() {
  return (
    <div className="w-full max-w-xs rounded-xl border bg-background p-2">
      <FoldTree data={projectFiles} defaultExpanded={["app", "components"]} defaultSelected="page" />
    </div>
  )
}
