import { useState } from 'react'

import iconModalClose from '../assets/quote-detail/icon-modal-close.svg'
import iconArrowCircle from '../assets/quote-detail/icon-arrow-circle.svg'
import iconDownload from '../assets/quote-detail/icon-download.svg'

// "Fotos de la herramienta" — Figma node 30550:93912 ("Clic en la foto" /
// "Vista de las imágenes" flow steps). Photos are mock/generic stock imagery
// in the source design (same placeholder laptop photo repeated), matching
// this project's existing "approximation" note on per-tool photos.
export default function ImageViewerModal({
  photos,
  initialIndex = 0,
  onClose,
}: {
  photos: string[]
  initialIndex?: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const goPrev = () => setIndex((i) => (i - 1 + photos.length) % photos.length)
  const goNext = () => setIndex((i) => (i + 1) % photos.length)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070f21]/40 p-[24px]" onClick={onClose}>
      <div
        className="flex w-[540px] max-h-[90vh] flex-col overflow-hidden rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 shadow-[0px_16px_40px_rgba(7,15,33,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-solid border-stroke-default px-[24px] py-[16px]">
          <p className="text-[16px] font-bold leading-normal text-content-default">Fotos de la herramienta</p>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <img src={iconModalClose} alt="" className="size-[24px]" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-[12px] px-[32px] py-[24px]">
          <div className="flex w-full items-center justify-center gap-[12px]">
            {/* icon-arrow-circle is just the arrow glyph (no circle baked into the
                svg despite the name) — the round bordered button is built here. */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Foto anterior"
              className="flex size-[32px] shrink-0 items-center justify-center rounded-full border border-solid border-stroke-default"
            >
              <img src={iconArrowCircle} alt="" className="size-[16px]" />
            </button>
            <div className="flex aspect-square flex-1 items-center justify-center rounded-[12px] border border-solid border-stroke-default bg-layout-level-2 p-[12px]">
              <img src={photos[index]} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <button
              type="button"
              onClick={goNext}
              aria-label="Foto siguiente"
              className="flex size-[32px] shrink-0 items-center justify-center rounded-full border border-solid border-stroke-default"
            >
              <img src={iconArrowCircle} alt="" className="size-[16px] rotate-180" />
            </button>
          </div>

          {/* Wraps to as many rows as needed, left-aligned (not centered, which
              looked odd once an incomplete last row sat centered under a full one). */}
          <div className="flex w-full flex-wrap items-center justify-start gap-[8px]">
            {photos.map((photo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`flex size-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border-[1.5px] border-solid p-[6px] ${
                  i === index ? 'border-primary-default' : 'border-stroke-interactive'
                }`}
              >
                <img src={photo} alt="" className="max-h-full max-w-full object-contain" />
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-[12px]">
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-[8px] rounded-[8px] border border-solid border-primary-default px-[8px] py-[12px]"
            >
              <p className="text-[14px] font-medium leading-normal text-primary-default">Volver</p>
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-[8px] rounded-[8px] bg-primary-default px-[8px] py-[12px]"
            >
              <p className="text-[14px] font-medium leading-normal text-primary-fg">Descargar foto</p>
              <img src={iconDownload} alt="" className="size-[14px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
