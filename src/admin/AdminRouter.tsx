/**
 * Minimal client-side router untuk admin panel.
 * Tidak pakai library external — hash-based (#/admin/...) agar kompatibel
 * dengan Vite SPA tanpa server-side routing config.
 */
import { useState, useEffect, type ReactNode } from 'react'

type Listener = () => void
const listeners = new Set<Listener>()

function getPath() {
  // hash: #/admin/dashboard → /admin/dashboard
  const hash = window.location.hash.slice(1) || '/'
  return hash
}

export function navigate(to: string) {
  window.location.hash = to
}

export function useLocation() {
  const [path, setPath] = useState(getPath)
  useEffect(() => {
    const handler = () => setPath(getPath())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])
  return path
}

export function Link({ to, children, className }: { to: string; children?: ReactNode; className?: string }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
}
