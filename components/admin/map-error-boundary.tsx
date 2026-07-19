'use client'

import { Component, type ReactNode } from 'react'

export class MapErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[Map] Failed to render:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
          Impossible d'afficher la carte pour le moment.
        </div>
      )
    }
    return this.props.children
  }
}
