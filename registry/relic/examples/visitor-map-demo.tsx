import { VisitorMap } from "@/registry/relic/ui/visitor-map"

export const places = [
  { id: "mum", label: "Mumbai", lat: 19.08, lng: 72.88, count: 128 },
  { id: "blr", label: "Bengaluru", lat: 12.97, lng: 77.59, count: 96 },
  { id: "sf", label: "San Francisco", lat: 37.77, lng: -122.42, count: 74 },
  { id: "ny", label: "New York", lat: 40.71, lng: -74.0, count: 61 },
  { id: "ldn", label: "London", lat: 51.51, lng: -0.13, count: 58 },
  { id: "ber", label: "Berlin", lat: 52.52, lng: 13.4, count: 33 },
  { id: "sp", label: "São Paulo", lat: -23.55, lng: -46.63, count: 27 },
  { id: "tok", label: "Tokyo", lat: 35.68, lng: 139.69, count: 41 },
  { id: "syd", label: "Sydney", lat: -33.87, lng: 151.21, count: 19 },
  { id: "lag", label: "Lagos", lat: 6.52, lng: 3.38, count: 22 },
  { id: "sgp", label: "Singapore", lat: 1.35, lng: 103.82, count: 36 },
]

export default function VisitorMapDemo() {
  return (
    <div className="w-full max-w-2xl">
      <VisitorMap points={places} home={{ lat: 50.11, lng: 8.68, label: "Frankfurt" }} autoCycle={2.5} />
    </div>
  )
}
