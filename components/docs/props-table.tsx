import type { PropDoc } from "@/lib/docs"

export function PropsTable({ props }: { props: PropDoc[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40 text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Prop</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Default</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b align-top last:border-0">
              <td className="px-4 py-3">
                <code className="font-mono text-sm font-medium">
                  {prop.name}
                </code>
                <p className="mt-1 text-muted-foreground">{prop.description}</p>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                  {prop.type}
                </code>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-xs text-muted-foreground">
                  {prop.default ?? "—"}
                </code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
