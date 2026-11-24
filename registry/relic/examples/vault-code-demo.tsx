"use client"

import { VaultCode } from "@/registry/relic/ui/vault-code"

export default function VaultCodeDemo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <VaultCode
        onComplete={async (code) => {
          await new Promise((r) => setTimeout(r, 500)) // pretend to ask the server
          return code === "123456"
        }}
      />
      <p className="text-xs text-muted-foreground">
        Try <span className="font-mono text-foreground">123456</span>, then any other code
      </p>
    </div>
  )
}
