'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// On définit le chargement dynamique hors du composant
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse" /> }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

export default function TeamsMap({ teams }: { teams: any[] }) {
  const [mounted, setMounted] = useState(false)

  // 1. On attend que le composant soit "monté" côté client
  useEffect(() => {
    setMounted(true)
  }, [])

  // 2. Tant que ce n'est pas monté, on ne retourne rien (ou un placeholder)
  if (!mounted) {
    return <div className="h-[400px] w-full bg-gray-50 flex items-center justify-center">Chargement de la carte...</div>
  }

  // 3. Une fois monté, on affiche la carte
  return (
    <div className="h-[400px] w-full">
      <MapContainer center={[48.8566, 2.3522] as [number, number]} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {teams.map((team) => (
          team.latitude && team.longitude ? (
            <Marker key={team.team_id} position={[team.latitude, team.longitude] as [number, number]}>
              <Popup>{team.team_name}</Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  )
}
