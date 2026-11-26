import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export default function PdfPreview({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null)
  const [rendering, setRendering] = useState(false)
  const [scale, setScale] = useState<number | null>(null)
  useEffect(() => {
    let cancelled = false
    const render = async () => {
      if (!url) return
      setRendering(true)
      const data = new Uint8Array(await (await fetch(url)).arrayBuffer())
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const page = await pdf.getPage(1)
      if (cancelled || !canvasRef.current) return
      const baseViewport = page.getViewport({ scale: 1 })
      const fitScale = Math.min(1.35, ((containerRef.current?.clientWidth ?? baseViewport.width) - 24) / baseViewport.width)
      const renderScale = scale ?? fitScale
      const viewport = page.getViewport({ scale: renderScale })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) return
       const outputScale = Math.min(window.devicePixelRatio || 1, 2)
       canvas.width = Math.floor(viewport.width * outputScale)
       canvas.height = Math.floor(viewport.height * outputScale)
       canvas.style.width = `${viewport.width}px`
       canvas.style.height = `${viewport.height}px`
       await page.render({ canvasContext: context, viewport, transform: [outputScale, 0, 0, outputScale, 0, 0] }).promise
       if (!cancelled) setRendering(false)
    }
    render().catch((error) => { console.error(error); setRendering(false) })
    return () => { cancelled = true }
  }, [url, scale])
  const pinchStart = (event: React.TouchEvent) => { if (event.touches.length === 2) { const dx = event.touches[0].clientX - event.touches[1].clientX; const dy = event.touches[0].clientY - event.touches[1].clientY; pinchRef.current = { distance: Math.hypot(dx, dy), scale: scale ?? 1.35 } } }
  const pinchMove = (event: React.TouchEvent) => { if (event.touches.length !== 2 || !pinchRef.current) return; event.preventDefault(); const dx = event.touches[0].clientX - event.touches[1].clientX; const dy = event.touches[0].clientY - event.touches[1].clientY; setScale(Math.min(2.7, Math.max(.7, pinchRef.current.scale * Math.hypot(dx, dy) / pinchRef.current.distance))) }
  return <div ref={containerRef} className="rounded-lg bg-slate-100 p-3 sm:p-5"><div className="mb-3 flex items-center justify-end gap-2"><button type="button" onClick={() => setScale((value) => Math.max(.7, (value ?? 1.35) - .2))} className="h-9 w-9 rounded-md border bg-white text-lg font-semibold transition-colors hover:bg-slate-50" aria-label="Perkecil PDF">−</button><span className="min-w-14 text-center text-sm font-medium text-slate-700 tabular-nums">Zoom</span><button type="button" onClick={() => setScale((value) => Math.min(2.7, (value ?? 1.35) + .2))} className="h-9 w-9 rounded-md border bg-white text-lg font-semibold transition-colors hover:bg-slate-50" aria-label="Perbesar PDF">+</button></div><div className="max-h-[720px] overflow-auto" style={{ touchAction: 'pan-x pan-y' }} onTouchStart={pinchStart} onTouchMove={pinchMove} onTouchEnd={() => { pinchRef.current = null }}><canvas ref={canvasRef} className={`mx-auto max-w-none rounded bg-white shadow-sm transition-opacity duration-300 ease-out ${rendering ? 'opacity-60' : 'opacity-100'}`} /></div></div>
}
