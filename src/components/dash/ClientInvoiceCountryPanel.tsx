import { useRef, useState } from 'react'

import flagMexico from '../../assets/quote-module/flag-mexico.svg'
import flagColombia from '../../assets/quote-module/flag-colombia.svg'
import flagArgentina from '../../assets/quote-module/flag-argentina.svg'
import flagTurkey from '../../assets/quote-module/flag-turkey.svg'
import flagVenezuela from '../../assets/quote-module/flag-venezuela.svg'
import iconSend from '../../assets/quote-detail/icon-send.svg'
import statusDotWarning from '../../assets/quote-detail/status-dot-warning.svg'
import statusDotSuccess from '../../assets/quote-detail/status-dot-success.svg'
import statusDotDanger from '../../assets/quote-detail/status-dot-danger.svg'
import statusDotInformative from '../../assets/quote-detail/status-dot-informative.svg'

import { entidadBordPorPais, type CountryFlag, type FacturaStatus } from '../../data/buybacks'
import type { PaisFacturaBlockData } from '../../store/bbxStore'
import { formatUSD } from '../../lib/format'

const FLAGS: Record<CountryFlag, string> = {
  mexico: flagMexico,
  colombia: flagColombia,
  argentina: flagArgentina,
  turkey: flagTurkey,
  venezuela: flagVenezuela,
}

// Mismo copy/color-por-estado que la vista interna (InvoiceCountryPanel) pero
// en lenguaje de cliente — "Bord" en vez de "Finanzas", sin mencionar la
// revisión interna como un paso propio.
const FACTURA_COPY: Record<FacturaStatus, { label: string; dot: string }> = {
  pendiente: { label: 'Sube tu factura para este país', dot: statusDotWarning },
  en_revision: { label: 'Factura enviada — en revisión por Bord', dot: statusDotInformative },
  ok: { label: 'Factura aprobada', dot: statusDotSuccess },
  rechazada: { label: 'Bord rechazó esta factura', dot: statusDotDanger },
}

function CountryBlock({
  block,
  onSubmit,
}: {
  block: PaisFacturaBlockData
  onSubmit: (pais: CountryFlag, archivoNombre: string) => void
}) {
  const entidad = entidadBordPorPais(block.pais)
  const copy = FACTURA_COPY[block.factura.factura]
  // Se puede subir/reemplazar mientras siga "pendiente" (nunca se subió) o
  // "rechazada" (Bord pidió volver a subirla) — "en_revision"/"ok" quedan
  // bloqueadas, per brief: "queda bloqueada al enviar".
  const canUpload = block.factura.factura === 'pendiente' || block.factura.factura === 'rechazada'
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit() {
    if (!pendingFile) return
    onSubmit(block.pais, pendingFile.name)
    setPendingFile(null)
  }

  return (
    <div className="flex flex-col gap-[12px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 p-[16px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <img src={FLAGS[block.pais]} alt="" className="size-[16px] shrink-0 rounded-full" />
          <div className="flex flex-col items-start">
            <p className="whitespace-nowrap text-[14px] font-bold capitalize leading-normal text-content-default">{block.pais}</p>
            <p className="whitespace-nowrap text-[11px] leading-normal text-content-secondary">
              Factura a: {entidad.razonSocial} · {entidad.documentoFiscal}
            </p>
          </div>
        </div>
        <p className="whitespace-nowrap text-[16px] font-bold leading-normal text-content-default">{formatUSD(block.subtotalUsd)}</p>
      </div>

      <div className="flex flex-col gap-[4px] rounded-[8px] bg-layout-level-2 p-[8px]">
        {block.herramientas.map((h) => (
          <div key={h.serial} className="flex items-center justify-between text-[12px] leading-normal">
            <span className="text-content-secondary">
              {h.model} <span className="text-content-default">{h.serial}</span>
            </span>
            <span className="font-medium text-content-default">{formatUSD(h.priceUsd)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center gap-[4px]">
          <img src={copy.dot} alt="" className="size-[8px] shrink-0" />
          <p className="text-[12px] leading-normal text-content-default">{copy.label}</p>
        </div>
        {block.factura.factura === 'rechazada' && block.factura.comentarioFinanzas && (
          <p className="max-w-[420px] text-[11px] leading-normal text-danger-fg">Motivo: {block.factura.comentarioFinanzas}</p>
        )}
        {block.factura.archivoNombre && block.factura.factura !== 'pendiente' && (
          <p className="text-[11px] leading-normal text-content-secondary">Archivo: {block.factura.archivoNombre}</p>
        )}

        {canUpload && (
          <div className="flex items-center gap-[8px]">
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => setPendingFile(event.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-[32px] shrink-0 items-center gap-[6px] rounded-[8px] border border-solid border-stroke-interactive bg-layout-level-1 px-[12px] text-[12px] leading-normal text-content-default"
            >
              {pendingFile ? 'Cambiar archivo' : 'Adjuntar factura (PDF)'}
            </button>
            {pendingFile && (
              <>
                <span className="max-w-[160px] truncate text-[11px] leading-normal text-content-secondary">{pendingFile.name}</span>
                <button type="button" onClick={() => setPendingFile(null)} className="text-[11px] leading-normal text-primary-hover">
                  Quitar
                </button>
              </>
            )}
            <button
              type="button"
              disabled={!pendingFile}
              onClick={handleSubmit}
              className={`flex h-[32px] shrink-0 items-center gap-[6px] rounded-[8px] px-[12px] ${
                pendingFile ? 'bg-primary-default text-primary-fg' : 'bg-stroke-default text-content-secondary'
              }`}
            >
              <img src={iconSend} alt="" className={`size-[12px] ${pendingFile ? '' : 'opacity-40'}`} />
              <p className="whitespace-nowrap text-[12px] font-medium leading-normal">Enviar a revisión</p>
            </button>
          </div>
        )}
      </div>

      {block.cupon.estado === 'generado' && (
        <div className="flex items-center justify-between rounded-[8px] bg-success-bg px-[12px] py-[8px]">
          <p className="text-[12px] font-medium leading-normal text-success-fg">Cupón BBC generado</p>
          <p className="text-[12px] leading-normal text-content-secondary">
            {block.cupon.consecutivo} · {block.cupon.montoUsd != null ? formatUSD(block.cupon.montoUsd) : null}
          </p>
        </div>
      )}
    </div>
  )
}

export default function ClientInvoiceCountryPanel({
  paises,
  onSubmit,
}: {
  paises: PaisFacturaBlockData[]
  onSubmit: (pais: CountryFlag, archivoNombre: string) => void
}) {
  return (
    <div className="flex w-full flex-col gap-[12px]">
      {paises.map((block) => (
        <CountryBlock key={block.pais} block={block} onSubmit={onSubmit} />
      ))}
    </div>
  )
}
