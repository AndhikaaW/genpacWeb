/**
 * Minimal client-side router untuk admin/tutor panel.
 * Path-based routing (/admin/..., /tutor/...) dengan history.pushState.
 * Server/CDN harus redirect semua path ke index.html (lihat public/404.html untuk GitHub Pages).
 */
import { useState, useEffect, type ReactNode } from 'react'

function getPath() {
  return window.location.pathname || '/'
}

export function navigate(to: string) {
  history.pushState(null, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useLocation() {
  const [path, setPath] = useState(getPath)
  useEffect(() => {
    const handler = () => setPath(getPath())
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
  return path
}

export function Link({ to, children, className }: { to: string; children?: ReactNode; className?: string }) {
  return (
    <a
      href={to}
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
