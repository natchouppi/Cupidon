'use client'

export function ProofMedia({
  pathname,
  mediaType,
  title,
}: {
  pathname: string | null | undefined
  mediaType: 'image' | 'video' | null | undefined
  title: string
}) {
  // Si le chemin est vide ou n'existe pas, on n'affiche pas de média cassé
  if (!pathname || pathname.trim() === '') {
    return (
      <div className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-center p-4">
        <span className="text-sm font-medium text-muted-foreground">
          Aucune photo / vidéo requise
        </span>
        <span className="text-xs text-muted-foreground/60 mt-1">
          Défi envoyé pour validation directe
        </span>
      </div>
    )
  }

  const src = `/api/file?pathname=${encodeURIComponent(pathname)}`

  if (mediaType === 'video') {
    return (
      <video
        controls
        preload="metadata"
        className="aspect-video w-full rounded-lg border border-border bg-black object-contain"
        src={src}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || '/placeholder.svg'}
      alt={`Proof for ${title}`}
      className="max-h-80 w-full rounded-lg border border-border object-contain"
    />
  )
}
