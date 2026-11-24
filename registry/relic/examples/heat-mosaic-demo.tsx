"use client"

import { HeatMosaic, type MosaicItem } from "@/registry/relic/ui/heat-mosaic"

/** A pretend market: made-up companies, size = value, color = today's change. */
export const market: MosaicItem[] = [
  { id: "nmb", label: "Nimbus", group: "Tech", size: 2900, value: 2.4 },
  { id: "qnt", label: "Quanta", group: "Tech", size: 2100, value: -1.2 },
  { id: "pix", label: "Pixelry", group: "Tech", size: 1200, value: 4.8 },
  { id: "crl", label: "Corelink", group: "Tech", size: 800, value: 0.6 },
  { id: "byt", label: "Byteforge", group: "Tech", size: 520, value: -3.1 },
  { id: "hlx", label: "Helix", group: "Health", size: 1400, value: -0.8 },
  { id: "vit", label: "Vitara", group: "Health", size: 900, value: 1.9 },
  { id: "mdn", label: "Medline", group: "Health", size: 610, value: -2.2 },
  { id: "cur", label: "Curo", group: "Health", size: 300, value: 0.3 },
  { id: "sol", label: "Solare", group: "Energy", size: 1100, value: 3.6 },
  { id: "pet", label: "Petrox", group: "Energy", size: 950, value: -4.1 },
  { id: "wnd", label: "Windmere", group: "Energy", size: 420, value: 1.1 },
  { id: "bsk", label: "Basket", group: "Retail", size: 1300, value: -0.4 },
  { id: "thr", label: "Threadly", group: "Retail", size: 640, value: 2.7 },
  { id: "hme", label: "Homely", group: "Retail", size: 380, value: -1.6 },
  { id: "pnt", label: "Pantry", group: "Retail", size: 260, value: 0.9 },
  { id: "ldg", label: "Ledgr", group: "Finance", size: 1500, value: 0.2 },
  { id: "vlt", label: "Vaultio", group: "Finance", size: 820, value: -2.9 },
  { id: "cns", label: "Coinsure", group: "Finance", size: 450, value: 5.2 },
]

export default function HeatMosaicDemo() {
  return (
    <div className="w-full max-w-2xl">
      <HeatMosaic items={market} height={340} formatSize={(s) => `$${s}B`} />
    </div>
  )
}
