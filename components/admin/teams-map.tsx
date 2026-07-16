'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// On importe la carte de manière dynamique pour éviter le crash côté serveur
const Map = dynamic(() => import('./map-component'), { ssr: false })

export default function TeamsMap({ teams }: { teams: any[] }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Si on est pas encore côté client, on affiche juste un chargement
  if (!isClient) return <div>Chargement de la carte...</div>

  // Si on est côté client, on vérifie les données avant d'afficher
  if (!teams || teams.length === 0) {
    return <div>Aucune position à afficher pour le moment.</div>
  }

  return <Map teams={teams} />
}
