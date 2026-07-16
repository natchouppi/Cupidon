'use client'

export function ProofMedia({
  pathname,
  mediaType,
  title,
}: {
  pathname: string
  mediaType: 'image' | 'video'
  title: string
}) {
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
