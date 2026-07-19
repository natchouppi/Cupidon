// Palette dédiée aux catégories, distincte des couleurs sémantiques
// (primary/accent/pending/destructive) déjà utilisées ailleurs dans l'UI.
const CATEGORY_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' }, // bleu
  { bg: 'rgba(168,85,247,0.15)', text: '#c084fc' }, // violet
  { bg: 'rgba(6,182,212,0.15)', text: '#22d3ee' }, // cyan
  { bg: 'rgba(249,115,22,0.15)', text: '#fb923c' }, // orange
  { bg: 'rgba(20,184,166,0.15)', text: '#2dd4bf' }, // teal
  { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' }, // indigo
]

const FALLBACK_COLOR = { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8' }

export function categoryColor(category: string | null | undefined) {
  if (!category) return FALLBACK_COLOR

  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}
