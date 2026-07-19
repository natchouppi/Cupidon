'use client'

import { MapContainer, TileLayer, Marker, Popup, Tooltip, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Une couleur distincte par équipe (recyclée si plus d'équipes que de couleurs)
const TEAM_COLORS = [
  '#e63946', // rouge
  '#2a9d8f', // sarcelle
  '#f4a261', // orange
  '#3a86ff', // bleu
  '#8338ec', // violet
  '#ffbe0b', // jaune
]

function colorForTeam(teamId: number) {
  return TEAM_COLORS[Math.abs(teamId) % TEAM_COLORS.length]
}

const pinIconCache = new Map<string, L.DivIcon>()

// Icône de pin coloré en SVG inline (pas de dépendance à une image externe)
function pinIcon(color: string) {
  const cached = pinIconCache.get(color)
  if (cached) return cached

  const icon = L.divIcon({
    className: '',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#1e293b" stroke-width="1"/>
        <circle cx="12.5" cy="12.5" r="5" fill="white"/>
      </svg>
    `,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -36],
  })
  pinIconCache.set(color, icon)
  return icon
}

function hasValidPosition(lat: unknown, lng: unknown) {
  const a = Number(lat)
  const b = Number(lng)
  return Number.isFinite(a) && Number.isFinite(b) && a >= -90 && a <= 90 && b >= -180 && b <= 180
}

export default function MapComponent({ teams, trail }: { teams: any[]; trail: any[] }) {  // Centre de la carte par défaut
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
      {/* Petits points : historique des défis validés */}
      {trail.map((entry) => {
        if (!hasValidPosition(entry.latitude, entry.longitude)) return null

        return (
          <CircleMarker
            key={entry.submission_id}
            center={[Number(entry.latitude), Number(entry.longitude)]}
            radius={5}
            pathOptions={{
              color: colorForTeam(entry.team_id),
              fillColor: colorForTeam(entry.team_id),
              fillOpacity: 0.85,
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{entry.team_name}</p>
                <p>{entry.challenge_title || 'Défi validé'}</p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}

      {/* Pin normal : dernière soumission de chaque équipe */}
      {teams.map((team) => {
        if (!hasValidPosition(team.latitude, team.longitude)) return null

        return (
          <Marker 
            key={team.team_id} 
            position={[Number(team.latitude), Number(team.longitude)]}
            icon={pinIcon(colorForTeam(team.team_id))}
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{team.team_name}</p>
                <p>{team.challenge_title || "En attente de défi"}</p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
