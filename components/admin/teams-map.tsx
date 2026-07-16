'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getTeamsLastLocation } from '@/app/actions/admin'

// Correction d'un bug classique de Leaflet avec Next.js pour afficher les icônes de marqueurs
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface TeamLocation {
  team_id: number
  team_name: string
  team_code: string
  latitude: number
  longitude: number
  last_seen: string
  challenge_title: string
}

export function TeamsMap() {
  const [locations, setLocations] = useState<TeamLocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLocations() {
      const res = await getTeamsLastLocation()
      if (res.success && res.data) {
        setLocations(res.data as TeamLocation[])
      }
      setLoading(false)
    }

    loadLocations()
    // Optionnel : Rafraîchir les positions toutes les 30 secondes automatiquement !
    const interval = setInterval(loadLocations, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement de la carte...</div>
  }

  // Position de départ de la carte par défaut (ici centrée sur Paris, s'adaptera s'il y a des données)
  const defaultCenter: [number, number] = locations.length > 0 
    ? [locations[0].latitude, locations[0].longitude] 
    : [48.8566, 2.3522]

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-bold">Carte en direct</h2>
        <p className="text-sm text-muted-foreground">
          Dernière position GPS connue de vos {locations.length} équipes actives.
        </p>
      </div>

      <div className="h-[500px] w-full rounded-lg overflow-hidden border border-border">
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((loc) => (
            <Marker 
              key={loc.team_id} 
              position={[loc.latitude, loc.longitude]}
              icon={customIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong className="text-base text-primary">{loc.team_name}</strong>
                  <div className="text-xs text-muted-foreground">Code: {loc.team_code}</div>
                  <hr className="my-1.5" />
                  <div className="font-medium">Dernier défi validé :</div>
                  <div className="italic text-muted-foreground">"{loc.challenge_title}"</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-1">
                    Signal reçu à : {new Date(loc.last_seen).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
