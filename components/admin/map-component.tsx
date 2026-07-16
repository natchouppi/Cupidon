'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix pour les icônes de marqueurs par défaut qui ne s'affichent pas avec Next.js
const DefaultIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png', // Assurez-vous d'avoir ces assets dans votre dossier public
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

export default function MapComponent({ teams }: { teams: any[] }) {
  // Centre de la carte par défaut
  const center: [number, number] = [48.8566, 2.3522] 

  return (
    <MapContainer 
      center={center} 
      zoom={6} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {teams.map((team) => (
        team.latitude && team.longitude ? (
          <Marker 
            key={team.team_id} 
            position={[team.latitude, team.longitude] as [number, number]}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{team.team_name}</p>
                <p>{team.challenge_title || "En attente de défi"}</p>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  )
}
