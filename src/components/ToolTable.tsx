import { useState } from 'react'

import toolCoverPhoto from '../assets/quote-detail/tool-cover-photo.png'
import iconExternalLink from '../assets/quote-detail/icon-external-link.svg'
import iconXCircle from '../assets/quote-detail/icon-x-circle.svg'
import iconCheckCircle from '../assets/quote-detail/icon-check-circle.svg'
import iconCheck from '../assets/quote-detail/icon-check.svg'
import statusDotInformative from '../assets/quote-detail/status-dot-informative.svg'
import statusDotSuccess from '../assets/quote-detail/status-dot-success.svg'
import statusDotDanger from '../assets/quote-detail/status-dot-danger.svg'

import flagMexico from '../assets/quote-module/flag-mexico.svg'
import flagColombia from '../assets/quote-module/flag-colombia.svg'
import flagArgentina from '../assets/quote-module/flag-argentina.svg'
import flagTurkey from '../assets/quote-module/flag-turkey.svg'
import flagVenezuela from '../assets/quote-module/flag-venezuela.svg'

import { formatUSD } from '../lib/format'
import { CLIENT_REJECT_REASON_LABEL, type DetailTag, type Grade, type ToolRow } from '../store/bbxStore'

// Read-only per-tool table — shared by Soga (QuoteDetail.tsx, "Pendiente de
// aprobación"/"Vencida"/"Cancelada"/audit disclosures) AND Dash
// (BbxDashDetail.tsx). ONE table, same hover behaviors (spec line/"Ver
// detalle"/thumbnails/extra-tags reveal on row hover), same columns — only
// content and color differ per surface (color via `.dash-theme`'s token
// overrides, content via the props below), never a second implementation.
// This file used to be inlined in QuoteDetail.tsx; moved here so Dash could
// reuse it instead of a from-scratch (and visibly worse) table.

export const TOOL_PHOTO_COUNT = 9

export const GRADE_STYLES: Record<Grade, string> = {
  A: 'bg-success-fg text-white',
  B: 'bg-informative-fg text-white',
  C: 'bg-warning-fg text-white',
  D: 'bg-danger-fg text-white',
  N: 'bg-content-secondary text-white',
}

// Capitalized keys matching ToolRow.country ("Mexico", not "mexico").
export const COUNTRY_FLAGS: Record<string, string> = {
  Mexico: flagMexico,
  Colombia: flagColombia,
  Argentina: flagArgentina,
  Turkey: flagTurkey,
  Venezuela: flagVenezuela,
}

const VISIBLE_TAGS_PER_LINE = 2

export function splitTags(tags: DetailTag[]) {
  const danger = tags.filter((t) => t.tone === 'danger')
  const success = tags.filter((t) => t.tone === 'success')
  return {
    danger: danger.slice(0, VISIBLE_TAGS_PER_LINE),
    extraDangerTags: danger.slice(VISIBLE_TAGS_PER_LINE),
    success: success.slice(0, VISIBLE_TAGS_PER_LINE),
    extraSuccessTags: success.slice(VISIBLE_TAGS_PER_LINE),
  }
}

// Small "ⓘ" info icon with a hover tooltip — same pattern as the "Total del
// lote" breakdown and the extra-tags badges.
export function InfoTooltip({ message }: { message: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative flex shrink-0" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span className="flex size-[12px] items-center justify-center rounded-full border border-solid border-stroke-interactive text-[8px] leading-none text-content-secondary">
        i
      </span>
      {open && (
        <div className="absolute left-1/2 top-[calc(100%+6px)] z-30 w-max max-w-[160px] -translate-x-1/2 rounded-[6px] border border-solid border-stroke-default bg-layout-level-1 px-[8px] py-[6px] text-[10px] normal-case leading-normal text-content-default shadow-[0px_8px_24px_rgba(7,15,33,0.16)]">
          {message}
        </div>
      )}
    </div>
  )
}

// "+N" badge for tags hidden past the visible cap — hovering reveals the
// rest in a tooltip, same pattern as the "Total del lote" country breakdown.
export function ExtraTagsBadge({ tags, tone }: { tags: DetailTag[]; tone: 'danger' | 'success' }) {
  const [open, setOpen] = useState(false)
  if (tags.length === 0) return null

  const toneClass = tone === 'danger' ? 'bg-danger-bg text-danger-fg' : 'bg-success-bg text-success-fg'

  return (
    <div className="relative flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span className={`whitespace-nowrap rounded-[12px] px-[8px] py-[2px] text-[10px] leading-normal ${toneClass}`}>+{tags.length}</span>
      {open && (
        <div className="absolute left-1/2 top-[calc(100%+8px)] z-30 flex w-max max-w-[240px] -translate-x-1/2 flex-col gap-[10px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 p-[16px] shadow-[0px_16px_40px_rgba(7,15,33,0.16)]">
          {tags.map((tag) => (
            <div key={tag.label} className="flex items-center gap-[8px]">
              <img src={tone === 'danger' ? iconXCircle : iconCheckCircle} alt="" className="size-[16px] shrink-0" />
              <span className="whitespace-nowrap text-[14px] leading-normal text-content-default">{tag.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Estado column — status-dot + texto coloreado por tono, sin stroke/borde
// alrededor.
type ItemStatusTone = 'informative' | 'success' | 'danger'

const ITEM_STATUS_DOT: Record<ItemStatusTone, string> = {
  informative: statusDotInformative,
  success: statusDotSuccess,
  danger: statusDotDanger,
}

const ITEM_STATUS_TEXT: Record<ItemStatusTone, string> = {
  informative: 'text-informative-fg',
  success: 'text-success-fg',
  danger: 'text-danger-fg',
}

function ItemStatusChip({ tone, label }: { tone: ItemStatusTone; label: string }) {
  return (
    <div className="inline-flex max-w-full items-start gap-[4px]">
      <img src={ITEM_STATUS_DOT[tone]} alt="" className="mt-[3px] size-[8px] shrink-0" />
      {/* Los motivos de rechazo (Bord o cliente) pueden ser largos — permite
          que el texto haga wrap a 2 líneas en vez de desbordar la columna. */}
      <p className={`text-[12px] leading-normal ${ITEM_STATUS_TEXT[tone]}`}>{label}</p>
    </div>
  )
}

function defaultPrice(row: ToolRow) {
  return row.status === 'rejected' ? '—' : formatUSD(row.price ?? 0)
}

export type ToolTableRowProps = {
  row: ToolRow
  striped: boolean
  onViewDetail: () => void
  onViewPhoto: (index: number) => void
  /** Oculta la columna "Estado" — por_cotizar en Dash no tiene todavía una
      decisión de cliente que mostrar (ver BbxDashDetail.tsx). Default true. */
  showEstado?: boolean
  /** Reemplaza el contenido de la celda de precio (default: monto/— como en
      Soga). Dash's por_cotizar la usa para mostrar "En preparación". */
  renderPrice?: (row: ToolRow) => React.ReactNode
  /** Celda extra al final — Dash's pendiente_aprobacion la usa para los
      botones Aprobar/Rechazar; Soga no la pasa (sin columna extra). */
  renderActions?: (row: ToolRow) => React.ReactNode
  /** Columna de checkbox al inicio — per Figma (fileKey
      1EUxZtg23ladPT9arKzHrA, node 36380:140402): la tabla de "por_cotizar"
      en Dash SÍ la muestra, aunque no hay ninguna acción masiva que hacer
      con la selección todavía (el cliente no puede actuar en ese estado).
      Se renderiza deshabilitada/decorativa por eso — no un checkbox
      funcional a medias. Soga no la pasa (su propia tabla interactiva ya
      tiene su propio checkbox real, con bulk actions de verdad). */
  showCheckbox?: boolean
  /** Vuelve el checkbox real (Soga's mismo visual: relleno + check cuando
      está seleccionado) en vez de decorativo/deshabilitado. Dash's
      pendiente_aprobacion la usa para aprobar/rechazar por selección
      ("mismo patrón de 'ofertar precio' en Soga" — doc "BBX · Dash");
      por_cotizar sigue con el checkbox mudo (no hay acción posible ahí). */
  selected?: boolean
  onToggle?: () => void
}

export function ToolTableRow({ row, striped, onViewDetail, onViewPhoto, showEstado = true, showCheckbox, selected, onToggle, renderPrice, renderActions }: ToolTableRowProps) {
  const { danger, extraDangerTags, success, extraSuccessTags } = splitTags(row.tags)
  const photos = Array.from({ length: TOOL_PHOTO_COUNT }, () => toolCoverPhoto)

  return (
    <tr className={`group border-b border-solid border-stroke-default align-top last:border-b-0 ${striped ? 'bg-layout-level-2' : 'bg-layout-level-1'}`}>
      {showCheckbox && (
        <td className="px-[12px] py-[16px]">
          <div className="flex items-center justify-center">
            {onToggle ? (
              <button
                type="button"
                aria-label={selected ? 'Deseleccionar herramienta' : 'Seleccionar herramienta'}
                onClick={onToggle}
                className={`flex size-[14px] shrink-0 items-center justify-center rounded-[4px] border border-solid ${
                  selected ? 'border-primary-default bg-primary-default' : 'border-stroke-interactive'
                }`}
              >
                {selected && <img src={iconCheck} alt="" className="size-[9px] brightness-0 invert" />}
              </button>
            ) : (
              <span
                aria-hidden
                className="flex size-[14px] shrink-0 items-center justify-center rounded-[4px] border border-solid border-stroke-interactive opacity-40"
              />
            )}
          </div>
        </td>
      )}
      {/* Divisor vertical checkbox|contenido — mismo `border-l` que ya usa la
          tabla interactiva de Soga entre su checkbox y "Modelo"; el read-only
          nunca lo tuvo porque nunca tuvo checkbox. Sólo aparece junto con
          `showCheckbox` — nunca en Soga (ver ToolTable arriba). Color
          `stroke-interactive` (no `stroke-default`: en modo oscuro
          `stroke/default` y `layout/level-2` son el mismo hex #262B39 per
          docs/design-system.md, un borde en ese color se vuelve invisible
          contra las filas rayadas) — pero atenuado a 50% de opacidad: sólido
          resaltaba demasiado contra ambos fondos de fila, más de lo que un
          divisor de tabla debería (nunca es el elemento más prominente). */}
      <td className={`px-[12px] py-[16px] ${showCheckbox ? 'border-l border-solid border-stroke-interactive/50' : ''}`}>
        <div className="flex flex-col items-start gap-[6px]">
          <p className="text-[12px] leading-normal text-content-default">{row.model}</p>
          <div className="hidden group-hover:flex">
            <p className="text-[11px] leading-normal text-content-secondary">{row.spec}</p>
          </div>
        </div>
      </td>
      <td className="px-[12px] py-[16px]">
        <div className="flex flex-col items-start gap-[6px]">
          <p className="text-[12px] leading-normal text-content-secondary">{row.serial}</p>
          <button
            type="button"
            onClick={onViewDetail}
            className="hidden items-center gap-[4px] text-[11px] leading-normal text-primary-default group-hover:flex"
          >
            Ver detalle
            <img src={iconExternalLink} alt="" className="size-[10px]" />
          </button>
        </div>
      </td>
      <td className="px-[12px] py-[16px]">
        <div className="flex flex-col items-start gap-[6px]">
          <div className="flex items-center gap-[4px]">
            <span className={`flex size-[24px] items-center justify-center rounded-[8px] text-[12px] font-bold ${GRADE_STYLES[row.grade]}`}>
              {row.grade}
            </span>
            <span className="flex items-center gap-[4px] text-[12px] leading-normal text-primary-default">
              DSN
              <img src={iconExternalLink} alt="" className="size-[10px]" />
            </span>
          </div>
          <div className="hidden items-center gap-[4px] group-hover:flex">
            {photos.slice(0, 2).map((photo, idx) => (
              <button
                key={idx}
                type="button"
                aria-label="Ver foto"
                onClick={() => onViewPhoto(idx)}
                className="size-[24px] shrink-0 overflow-hidden rounded-[6px] border border-solid border-stroke-default"
              >
                <img src={photo} alt="" className="size-full object-cover" />
              </button>
            ))}
            {photos.length > 2 && (
              <button
                type="button"
                aria-label="Ver foto"
                onClick={() => onViewPhoto(2)}
                className="flex size-[24px] shrink-0 items-center justify-center rounded-[6px] bg-stroke-default text-[10px] font-bold text-content-default"
              >
                +{photos.length - 2}
              </button>
            )}
          </div>
        </div>
      </td>
      <td className="px-[12px] py-[16px]">
        <div className="flex flex-col items-start gap-[6px]">
          {danger.length > 0 && (
            <div className="flex flex-wrap items-center gap-[4px]">
              <img src={iconXCircle} alt="" className="size-[14px] shrink-0" />
              {danger.map((tag) => (
                <span key={tag.label} className="whitespace-nowrap rounded-[12px] bg-danger-bg px-[8px] py-[2px] text-[10px] leading-normal text-danger-fg">
                  {tag.label}
                </span>
              ))}
              <ExtraTagsBadge tags={extraDangerTags} tone="danger" />
            </div>
          )}
          {success.length > 0 && (
            <div className={`flex flex-wrap items-center gap-[4px] ${danger.length > 0 ? 'hidden group-hover:flex' : ''}`}>
              <img src={iconCheckCircle} alt="" className="size-[14px] shrink-0" />
              {success.map((tag) => (
                <span key={tag.label} className="whitespace-nowrap rounded-[12px] bg-success-bg px-[8px] py-[2px] text-[10px] leading-normal text-success-fg">
                  {tag.label}
                </span>
              ))}
              <ExtraTagsBadge tags={extraSuccessTags} tone="success" />
            </div>
          )}
        </div>
      </td>
      <td className="px-[12px] py-[16px]">
        <div className="flex items-center gap-[4px]">
          <img src={COUNTRY_FLAGS[row.country]} alt="" className="size-[14px] rounded-full" />
          <span className="text-[12px] leading-normal text-content-default">{row.country}</span>
        </div>
      </td>
      <td className="px-[12px] py-[16px] text-[12px] leading-normal text-content-secondary">{row.comment}</td>
      {showEstado && (
        <td className="px-[12px] py-[16px]">
          {row.status === 'rejected' ? (
            // Rechazada por BORD antes de enviar la oferta — el caller ya
            // filtra estas filas fuera de la tabla en modo lectura (no se
            // muestran, sólo cuentan en el metric "Rechazadas"), así que esta
            // rama queda como red de seguridad, no debería alcanzarse.
            <ItemStatusChip tone="danger" label={`Rechazado por Bord: ${row.rejectReason}`} />
          ) : row.status === 'vendido' ? (
            <ItemStatusChip tone="success" label="Vendido" />
          ) : row.clientDecision === 'aprobado' ? (
            <ItemStatusChip tone="success" label="Aprobado" />
          ) : row.clientDecision === 'rechazado' ? (
            <ItemStatusChip tone="danger" label={row.clientRejectReason ? CLIENT_REJECT_REASON_LABEL[row.clientRejectReason] : 'Rechazado'} />
          ) : (
            <ItemStatusChip tone="informative" label="Pendiente de aprobación" />
          )}
        </td>
      )}
      {/* Mismo divisor, del lado de Precio/Oferta — separa el bloque de
          contenido del monto, igual que en la tabla interactiva de Soga. */}
      <td className={`px-[12px] py-[16px] text-right ${showCheckbox ? 'border-l border-solid border-stroke-interactive/50' : ''}`}>
        <p className="text-[12px] font-medium leading-normal text-content-default">{(renderPrice ?? defaultPrice)(row)}</p>
      </td>
      {renderActions && <td className="px-[12px] py-[16px]">{renderActions(row)}</td>}
    </tr>
  )
}

export type ToolTableSelection = {
  selectedIds: Set<string>
  onToggleRow: (id: string) => void
  onToggleAll: () => void
}

export function ToolTable({
  rows,
  onViewDetail,
  onViewPhoto,
  showEstado = true,
  showCheckbox,
  selection,
  priceHeader = 'Precio final con impuestos',
  renderPrice,
  actionsHeader,
  renderActions,
}: {
  rows: ToolRow[]
  onViewDetail: (id: string) => void
  onViewPhoto: (id: string, index: number) => void
  showEstado?: boolean
  showCheckbox?: boolean
  /** Presencia de `selection` implica checkbox real (no hace falta pasar
      `showCheckbox` aparte) — ver ToolTableRowProps.selected/onToggle. */
  selection?: ToolTableSelection
  priceHeader?: string
  renderPrice?: (row: ToolRow) => React.ReactNode
  actionsHeader?: string
  renderActions?: (row: ToolRow) => React.ReactNode
}) {
  const hasCheckbox = showCheckbox || !!selection
  const allSelected = !!selection && rows.length > 0 && rows.every((r) => selection.selectedIds.has(r.id))
  const someSelected = !!selection && rows.some((r) => selection.selectedIds.has(r.id)) && !allSelected
  // Sin `showEstado` y sin `actionsHeader` sólo puede ser Dash's `por_cotizar`
  // (ver BbxDashDetail.tsx) — ahí "Oferta (Impuestos incluidos)" es la última
  // columna y absorbe el espacio que en Soga ocupan Estado+Precio, así que
  // le toca ser más ancha (per Figma) en vez de heredar el w-[140px] de Soga
  // (que dejaba un hueco enorme sin asignar — table-fixed absorbe todo el
  // sobrante en la primera columna sin ancho explícito si no se fija uno).
  const priceColWidth = actionsHeader || showEstado ? 'w-[140px]' : 'w-[220px]'

  return (
    <div className="w-full overflow-x-auto rounded-[8px] border border-solid border-stroke-default pb-[8px]">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          {hasCheckbox && <col className="w-[38px]" />}
          <col className="w-[176px]" />
          <col className="w-[130px]" />
          <col className="w-[105px]" />
          <col className="w-[210px]" />
          <col className="w-[90px]" />
          <col className="w-[230px]" />
          {showEstado && <col className="w-[150px]" />}
          <col className={priceColWidth} />
          {actionsHeader && <col className="w-[210px]" />}
        </colgroup>
        <thead>
          <tr className="border-b border-solid border-stroke-default bg-layout-level-1">
            {hasCheckbox && (
              <th className="px-[12px] py-[12px]">
                <div className="flex items-center justify-center">
                  {selection ? (
                    <button
                      type="button"
                      aria-label={allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                      onClick={selection.onToggleAll}
                      className={`flex size-[14px] shrink-0 items-center justify-center rounded-[4px] border border-solid ${
                        allSelected || someSelected ? 'border-primary-default bg-primary-default' : 'border-stroke-interactive'
                      }`}
                    >
                      {allSelected && <img src={iconCheck} alt="" className="size-[9px] brightness-0 invert" />}
                      {someSelected && <span className="block h-[2px] w-[8px] rounded-full bg-white" />}
                    </button>
                  ) : (
                    <span aria-hidden className="flex size-[14px] shrink-0 items-center justify-center rounded-[4px] border border-solid border-stroke-interactive opacity-40" />
                  )}
                </div>
              </th>
            )}
            <th className={`px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default ${hasCheckbox ? 'border-l border-solid border-stroke-interactive/50' : ''}`}>
              Modelo
            </th>
            <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Serial</th>
            <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Condición</th>
            <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Detalles</th>
            <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">País</th>
            <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Comentarios</th>
            {showEstado && <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Estado</th>}
            <th className={`px-[12px] py-[12px] text-right text-[12px] font-bold leading-normal text-content-default ${hasCheckbox ? 'border-l border-solid border-stroke-interactive/50' : ''}`}>
              {priceHeader}
            </th>
            {actionsHeader && <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">{actionsHeader}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <ToolTableRow
              key={row.id}
              row={row}
              striped={i % 2 === 0}
              onViewDetail={() => onViewDetail(row.id)}
              onViewPhoto={(index) => onViewPhoto(row.id, index)}
              showEstado={showEstado}
              showCheckbox={hasCheckbox}
              selected={selection?.selectedIds.has(row.id)}
              onToggle={selection ? () => selection.onToggleRow(row.id) : undefined}
              renderPrice={renderPrice}
              renderActions={renderActions}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
