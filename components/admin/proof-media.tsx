'use client'

export function ProofMedia({
  pathname,
  mediaType,
  title,
  comment, // On récupère le commentaire écrit par l'équipe
}: {
  pathname: string | null | undefined
  mediaType: 'image' | 'video' | null | undefined
  title: string
  comment?: string | null // Nouveau paramètre
}) {
  
  // Si aucune photo ou vidéo n'est fournie
  if (!pathname || pathname.trim() === '') {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            Preuve Textuelle / Message
          </span>
        </div>
        {comment && comment.trim() !== '' ? (
          <div className="rounded border border-border bg-background p-3 text-sm italic text-foreground">
            "{comment}"
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground italic">
            Aucun commentaire ni média fourni pour ce défi.
          </div>
        )}
      </div>
    )
  }

  const src = `/api/file?pathname=${encodeURIComponent(pathname)}`

  return (
    <div className="flex flex-col gap-3">
      {mediaType === 'video' ? (
        <video
          controls
          preload="metadata"
          className="aspect-video w-full rounded-lg border border-border bg-black object-contain"
          src={src}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src || '/placeholder.svg'}
          alt={`Proof for ${title}`}
          className="max-h-80 w-full rounded-lg border border-border object-contain"
        />
      )}

      {/* S'il y a une photo ET un commentaire, on l'affiche juste en dessous */}
      {comment && comment.trim() !== '' && (
        <div className="rounded border border-border bg-muted/40 p-2 text-xs italic text-muted-foreground">
          <span className="font-semibold not-italic">Note de l'équipe :</span> "{comment}"
        </div>
      )}
    </div>
  )
}
