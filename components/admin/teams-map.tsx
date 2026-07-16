'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./map-component'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full flex items-center justify-center border">Chargement de la carte...</div>
})

export default function TeamsMap({ teams }: { teams: any[] }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return <div className="h-[400px] w-full border" />

  // ON SÉCURISE ICI : on garantit que teams est un tableau, même vide
  const safeTeams = Array.isArray(teams) ? teams : []

  return <Map teams={safeTeams} />
}
