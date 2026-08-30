import { useState } from 'react'

import flagMexico from '../assets/quote-module/flag-mexico.svg'
import flagColombia from '../assets/quote-module/flag-colombia.svg'
import flagArgentina from '../assets/quote-module/flag-argentina.svg'
import flagTurkey from '../assets/quote-module/flag-turkey.svg'
import flagVenezuela from '../assets/quote-module/flag-venezuela.svg'
import iconExternalLink from '../assets/quote-detail/icon-external-link.svg'
import iconSend from '../assets/quote-detail/icon-send.svg'
import iconCheck from '../assets/quote-detail/icon-check.svg'
import iconX from '../assets/quote-detail/icon-x.svg'
import iconDropdownChevron from '../assets/quote-detail/icon-dropdown-chevron.svg'
import statusDotWarning from '../assets/quote-detail/status-dot-warning.svg'
import statusDotSuccess from '../assets/quote-detail/status-dot-success.svg'
import statusDotDanger from '../assets/quote-detail/status-dot-danger.svg'
import statusDotInformative from '../assets/quote-detail/status-dot-informative.svg'

import { entidadBordPorPais, type CountryFlag, type CuponEstado, type FacturaStatus } from '../data/buybacks'

const FLAGS: Record<CountryFlag, string> = {
  mexico: flagMexico,
  colombia: flagColombia,
  argentina: flagArgentina,
  turkey: flagTurkey,
  venezuela: flagVenezuela,
}

function formatUSD(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
}

const FACTURA_COPY: Record<FacturaStatus, { label: string; dot: string }> = {
  pendiente: { label: 'Factura pendiente de carga', dot: statusDotWarning },
  en_revision: { label: 'En revisión de Finanzas', dot: statusDotInformative },
  ok: { label: 'Factura OK', dot: statusDotSuccess },
  rechazada: { label: 'Factura rechazada', dot: statusDotDanger },
}

// Catálogo de motivos de rechazo de factura — a diferencia de
// REJECT_REASONS/CANCEL_REASONS (ya definidos en el resto de la app), no hay
// uno documentado para este caso. Placeholder razonable — DECISIÓN ABIERTA:
// validar con Finanzas antes de tratarlo como definitivo.
const FACTURA_RECHAZO_MOTIVOS = [
  'Falta RFC/documento fiscal del emisor',
  'El monto no coincide con lo aprobado',
  'Documento ilegible o incompleto',
  'Otro motivo',
]

export type PaisFacturaBlock = {
  pais: CountryFlag
  herramientas: { serial: string; model: string; priceUsd: number }[]
  subtotalUsd: number
  factura: { estado: FacturaStatus; comentarioFinanzas?: string | null }
  cupon: { estado: CuponEstado; consecutivo?: string; montoUsd?: number; fecha?: string }
}

export type CuponGenerado = { consecutivo: string; montoUsd: number; pais: CountryFlag; entidadEmisora: string; fecha: string }

// Un bloque por país — entidad Bord a facturar, herramientas aprobadas +
// subtotal, revisión de factura (aceptar/rechazar) y generación de cupón —
// las 2 acciones reales de esta vista. En el producto real la revisión de
// factura es de Finanzas, no de Martín (Finanzas entra con su propia acción)
// — se expone acá porque esta app no tiene roles/login separados, no hay otra
// entrada donde vivir esa acción. El tope duro contra `saldoPorGenerar` sigue
// viviendo en la parte de cupón: el input nunca deja tipear más de lo que el
// lote todavía tiene disponible, y el botón se deshabilita si excede ese tope.
function CountryInvoiceBlock({
  block,
  saldoPorGenerar,
  onRevisarFactura,
  onGenerarCupon,
}: {
  block: PaisFacturaBlock
  saldoPorGenerar: number
  onRevisarFactura: (pais: CountryFlag, decision: 'aceptar' | 'rechazar', motivo: string | null) => void
  onGenerarCupon: (pais: CountryFlag, montoUsd: number) => void
}) {
  const entidad = entidadBordPorPais(block.pais)
  const facturaCopy = FACTURA_COPY[block.factura.estado]
  // Aceptar/rechazar sólo tiene sentido si ya hay algo cargado para revisar —
  // "pendiente de carga" significa que el cliente ni siquiera subió la
  // factura todavía, no hay nada que aceptar o rechazar.
  const facturaPorResolver = block.factura.estado === 'en_revision'
  const [rejecting, setRejecting] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [motivoOpen, setMotivoOpen] = useState(false)
  const tope = Math.max(0, Math.min(block.subtotalUsd, saldoPorGenerar))
  const [monto, setMonto] = useState(() => tope.toFixed(2))
  const montoNum = Number.parseFloat(monto)
  const puedeGenerar = block.factura.estado === 'ok' && block.cupon.estado === 'pendiente'
  const montoValido = !Number.isNaN(montoNum) && montoNum > 0 && montoNum <= tope + 0.001

  function confirmRechazo() {
    if (!motivo) return
    onRevisarFactura(block.pais, 'rechazar', motivo)
    setRejecting(false)
    setMotivo('')
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

      <div className="flex items-center justify-between gap-[16px]">
        <div className="flex flex-col gap-[4px]">
          <div className="flex items-center gap-[4px]">
            <img src={facturaCopy.dot} alt="" className="size-[8px] shrink-0" />
            <p className="text-[12px] leading-normal text-content-default">{facturaCopy.label}</p>
            {/* Sólo se puede abrir una vez que hay algo cargado — "pendiente
                de carga" no tiene archivo que ver. Sin backend en este mock,
                botón visual sin onClick real (mismo patrón que "Ver detalle"). */}
            {block.factura.estado !== 'pendiente' && (
              <button type="button" className="flex items-center gap-[4px] text-[11px] leading-normal text-primary-default">
                Ver factura
                <img src={iconExternalLink} alt="" className="size-[10px]" />
              </button>
            )}
          </div>
          {block.factura.estado === 'rechazada' && block.factura.comentarioFinanzas && (
            <p className="max-w-[320px] text-[11px] leading-normal text-danger-fg">{block.factura.comentarioFinanzas}</p>
          )}

          {/* Aceptar/rechazar la factura — sólo mientras sigue sin resolver.
              Una vez `ok`/`rechazada` no hay vuelta atrás desde acá (mismo
              criterio que un cupón ya "generado"). */}
          {facturaPorResolver && !rejecting && (
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={() => onRevisarFactura(block.pais, 'aceptar', null)}
                className="flex h-[26px] items-center gap-[4px] rounded-[6px] bg-success-fg px-[8px] text-white"
              >
                <img src={iconCheck} alt="" className="size-[10px] brightness-0 invert" />
                <p className="whitespace-nowrap text-[11px] font-medium leading-normal">Aceptar factura</p>
              </button>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                className="flex h-[26px] items-center gap-[4px] rounded-[6px] bg-danger-bg px-[8px] text-danger-fg"
              >
                <img src={iconX} alt="" className="size-[10px]" />
                <p className="whitespace-nowrap text-[11px] font-medium leading-normal">Rechazar factura</p>
              </button>
            </div>
          )}

          {facturaPorResolver && rejecting && (
            <div className="flex flex-col gap-[4px]">
              <div className="relative flex">
                <button
                  type="button"
                  onClick={() => setMotivoOpen((v) => !v)}
                  className="flex h-[28px] w-[220px] items-center justify-between rounded-[6px] border border-solid border-stroke-interactive bg-layout-level-2 px-[8px]"
                >
                  <span className={`text-[11px] leading-normal ${motivo ? 'text-content-default' : 'text-content-secondary'}`}>
                    {motivo || 'Motivo del rechazo'}
                  </span>
                  <img src={iconDropdownChevron} alt="" className={`size-[10px] transition-transform ${motivoOpen ? 'rotate-180' : ''}`} />
                </button>
                {motivoOpen && (
                  <div className="absolute left-0 top-[32px] z-10 flex w-[220px] flex-col overflow-hidden rounded-[6px] border border-solid border-stroke-default bg-layout-level-1 shadow-[0px_8px_24px_rgba(7,15,33,0.12)]">
                    {FACTURA_RECHAZO_MOTIVOS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setMotivo(option)
                          setMotivoOpen(false)
                        }}
                        className="px-[8px] py-[6px] text-left text-[11px] leading-normal text-content-default hover:bg-layout-level-2"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-[8px]">
                <button
                  type="button"
                  disabled={!motivo}
                  onClick={confirmRechazo}
                  className={`whitespace-nowrap text-[11px] font-medium leading-normal ${motivo ? 'text-danger-fg' : 'text-content-secondary'}`}
                >
                  Confirmar rechazo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(false)
                    setMotivo('')
                  }}
                  className="whitespace-nowrap text-[11px] leading-normal text-primary-hover"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {block.cupon.estado === 'generado' ? (
          <div className="flex flex-col items-end gap-[2px]">
            <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-success-fg">{block.cupon.consecutivo}</p>
            <p className="whitespace-nowrap text-[11px] leading-normal text-content-secondary">
              {block.cupon.montoUsd != null ? formatUSD(block.cupon.montoUsd) : null} · {block.cupon.fecha}
            </p>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-[6px]">
            <div
              className={`flex h-[32px] w-[110px] items-center gap-[4px] rounded-[8px] border-2 border-solid bg-layout-level-1 px-[10px] text-[12px] ${
                montoValido ? 'border-primary-default' : 'border-stroke-interactive'
              }`}
            >
              <span className="shrink-0 text-[11px] text-content-secondary opacity-70">$</span>
              <input
                type="text"
                inputMode="decimal"
                disabled={!puedeGenerar}
                value={monto}
                onChange={(event) => setMonto(event.target.value)}
                className="w-full min-w-0 bg-transparent text-[12px] text-content-default placeholder:text-content-secondary focus:outline-none disabled:opacity-50"
              />
            </div>
            <button
              type="button"
              disabled={!puedeGenerar || !montoValido}
              onClick={() => montoValido && onGenerarCupon(block.pais, montoNum)}
              className={`flex h-[32px] shrink-0 items-center gap-[6px] rounded-[8px] px-[12px] ${
                puedeGenerar && montoValido ? 'bg-primary-default text-primary-fg' : 'bg-stroke-default text-content-secondary'
              }`}
            >
              <img src={iconSend} alt="" className={`size-[12px] ${puedeGenerar && montoValido ? '' : 'opacity-40'}`} />
              <p className="whitespace-nowrap text-[12px] font-medium leading-normal">Generar cupón</p>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InvoiceCountryPanel({
  paises,
  saldoPorGenerar,
  cuponesGenerados,
  onRevisarFactura,
  onGenerarCupon,
}: {
  paises: PaisFacturaBlock[]
  /** Saldo restante a nivel de LOTE — el tope duro de cada país nunca puede
      superar esto (además de su propio subtotal), aunque cada país tenga su
      propio subtotal por separado. */
  saldoPorGenerar: number
  cuponesGenerados: CuponGenerado[]
  onRevisarFactura: (pais: CountryFlag, decision: 'aceptar' | 'rechazar', motivo: string | null) => void
  onGenerarCupon: (pais: CountryFlag, montoUsd: number) => void
}) {
  return (
    <div className="flex w-full flex-col gap-[12px]">
      {cuponesGenerados.length > 0 && (
        <div className="flex flex-col gap-[8px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 p-[16px]">
          <p className="text-[12px] font-bold leading-normal text-content-default">Cupones generados</p>
          <div className="flex flex-col gap-[4px]">
            {cuponesGenerados.map((c) => (
              <div key={c.consecutivo} className="flex items-center justify-between text-[12px] leading-normal">
                <span className="text-content-default">
                  {c.consecutivo} <span className="capitalize text-content-secondary">· {c.pais}</span>
                </span>
                <span className="flex items-center gap-[8px]">
                  <span className="font-medium text-content-default">{formatUSD(c.montoUsd)}</span>
                  <span className="text-content-secondary">{c.fecha}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {paises.map((block) => (
        <CountryInvoiceBlock
          key={block.pais}
          block={block}
          saldoPorGenerar={saldoPorGenerar}
          onRevisarFactura={onRevisarFactura}
          onGenerarCupon={onGenerarCupon}
        />
      ))}
    </div>
  )
}
