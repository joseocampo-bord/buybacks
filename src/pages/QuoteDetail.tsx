import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import DetailTopBar from '../components/DetailTopBar'
import type { ClienteVencimientoSemaforo, CountryFlag } from '../data/buybacks'
import {
  bbxActions,
  buildFacturaBlocks,
  useBbxState,
  STAGE_BY_STATUS,
  type BuybackStatus,
  type Stage,
  type ToolRow,
} from '../store/bbxStore'
import { formatUSD, pluralizeTools, sumByCountry } from '../lib/format'
import { GRADE_STYLES, COUNTRY_FLAGS, TOOL_PHOTO_COUNT, splitTags, InfoTooltip, ExtraTagsBadge, ToolTableRow, ToolTable } from '../components/ToolTable'
import InvoiceCountryPanel, { type PaisFacturaBlock } from '../components/InvoiceCountryPanel'
import HistorialModal from '../components/HistorialModal'
import ToolDetailDrawer from '../components/ToolDetailDrawer'
import ImageViewerModal from '../components/ImageViewerModal'
import RejectReasonModal from '../components/RejectReasonModal'
import OrderSummaryModal from '../components/OrderSummaryModal'
import CancelBuybackModal from '../components/CancelBuybackModal'
import BulkActionIsland from '../components/BulkActionIsland'
import ConfirmSlaChangeModal from '../components/ConfirmSlaChangeModal'
import Toast from '../components/Toast'

import iconTime from '../assets/quote-detail/icon-time.svg'
import statusDotInformative from '../assets/quote-detail/status-dot-informative.svg'
import statusDotWarning from '../assets/quote-detail/status-dot-warning.svg'
import statusDotDanger from '../assets/quote-detail/status-dot-danger.svg'
import statusDotSuccess from '../assets/quote-detail/status-dot-success.svg'
import iconChevronDown from '../assets/quote-detail/icon-chevron-down.svg'
import iconExternalLink from '../assets/quote-detail/icon-external-link.svg'
import iconPerson from '../assets/quote-detail/icon-person.svg'
import iconPlusCircle from '../assets/quote-detail/icon-plus-circle.svg'
import iconCheck from '../assets/quote-detail/icon-check.svg'
import iconX from '../assets/quote-detail/icon-x.svg'
import iconCheckCircle from '../assets/quote-detail/icon-check-circle.svg'
import iconXCircle from '../assets/quote-detail/icon-x-circle.svg'
import iconDollarSign from '../assets/quote-detail/icon-dollar-sign.svg'
import iconSend from '../assets/quote-detail/icon-send.svg'
import iconSendSecondary from '../assets/quote-detail/icon-send-secondary.svg'
import iconEditPencil from '../assets/quote-detail/icon-edit-pencil.svg'
import divider from '../assets/quote-detail/divider.svg'
import avatarClient from '../assets/quote-detail/avatar-client.png'
import toolCoverPhoto from '../assets/quote-detail/tool-cover-photo.png'

import flagMexico from '../assets/quote-module/flag-mexico.svg'
import flagColombia from '../assets/quote-module/flag-colombia.svg'
import flagArgentina from '../assets/quote-module/flag-argentina.svg'
import flagTurkey from '../assets/quote-module/flag-turkey.svg'
import flagVenezuela from '../assets/quote-module/flag-venezuela.svg'
import iconFilter from '../assets/quote-module/icon-filter.svg'
import iconChevron from '../assets/quote-module/icon-chevron.svg'
import iconSort from '../assets/quote-module/icon-sort.svg'
import headerSearch from '../assets/layout/header-search.svg'

const TABLE_FILTERS = ['Modelo', 'País', 'Condición', 'Estado de la gestión']

// Grade/DetailTag/ManagementStatus/ClientDecision/ClientRejectReason/ToolRow
// + the per-stage mock lotes now live in src/store/bbxStore.ts (shared with
// BbxDashDetail.tsx, the Dash/cliente perspective on this same BBX) — see
// that file's comments for the "granularidad del estado en vivo" open
// decision that used to sit here.
//
// GRADE_STYLES/COUNTRY_FLAGS/TOOL_PHOTO_COUNT/splitTags/InfoTooltip/
// ExtraTagsBadge/ToolTableRow/ToolTable moved to src/components/ToolTable.tsx
// (imported above) — shared with BbxDashDetail.tsx so Dash renders the exact
// same table/row/hover behaviors Soga does, not a second implementation.

// Lowercase-keyed variant matching the list's `CountryFlag` type (data/buybacks.ts),
// used for the header's real "País" chip — separate from COUNTRY_FLAGS above,
// which keys by the per-tool `row.country` field (capitalized, unrelated data).
const LOT_COUNTRY_FLAGS: Record<string, string> = {
  mexico: flagMexico,
  colombia: flagColombia,
  argentina: flagArgentina,
  turkey: flagTurkey,
  venezuela: flagVenezuela,
}

// Extra fields only revealed when a row expands on hover — see the
// "31778:776713" Figma reference (a hover/expanded state of this same table,
// not a separate screen). Type + per-stage mock lotes moved to bbxStore.ts.

const STATUS_CONFIG: Record<BuybackStatus, { label: string; border: string; text: string; dot: string }> = {
  'por-cotizar': { label: 'Por cotizar', border: 'border-warning-fg', text: 'text-content-default', dot: statusDotWarning },
  'pendiente-aprobacion': { label: 'Pendiente de aprobación', border: 'border-informative-fg', text: 'text-content-default', dot: statusDotInformative },
  cancelado: { label: 'Cancelado', border: 'border-danger-fg', text: 'text-content-default', dot: statusDotDanger },
  // Matches data/buybacks.ts's STATUS_BADGE_CONFIG kind mapping (§5): aprobado/
  // aprobado-parcial are "warning", rechazado/vencido are "danger", comprado is "done".
  aprobado: { label: 'Aprobado', border: 'border-warning-fg', text: 'text-content-default', dot: statusDotWarning },
  'aprobado-parcial': { label: 'Aprobado parcial', border: 'border-warning-fg', text: 'text-content-default', dot: statusDotWarning },
  rechazado: { label: 'Rechazado', border: 'border-danger-fg', text: 'text-content-default', dot: statusDotDanger },
  vencido: { label: 'Vencido', border: 'border-danger-fg', text: 'text-content-default', dot: statusDotDanger },
  comprado: { label: 'Comprado', border: 'border-success-fg', text: 'text-content-default', dot: statusDotSuccess },
}

type SlaType = 'regular' | 'cto'

const SLA_CONFIG: Record<SlaType, { label: string; hours: number }> = {
  regular: { label: 'Regular – 24 horas', hours: 24 },
  cto: { label: 'CTO – 72 horas', hours: 72 },
}

// Dot-only color cue para el chip "Vencimiento cliente" — el chip en sí se
// mantiene neutro (mismo estilo que País/Creación), sólo el dot cambia de
// color según qué tan cerca está el vencimiento.
const SEMAFORO_DOT: Record<ClienteVencimientoSemaforo, string> = {
  ok: statusDotInformative,
  warning: statusDotWarning,
  vencido: statusDotDanger,
}

// Subtipo de "Vencida" — se muestra junto al pill de cabecera, copy tal cual
// la trae el modelo (Notion V2.0 §7.1 / data/buybacks.ts `VencidoSubtipo`).
const VENCIDO_SUBTIPO_LABEL: Record<'sin_respuesta' | 'rechazado' | 'no_concretado', string> = {
  sin_respuesta: 'Sin respuesta',
  rechazado: 'Rechazado',
  no_concretado: 'No concretado',
}

// Etapa derivada del estado real del BBX (Stage/STAGE_BY_STATUS, importados
// de bbxStore.ts) — reemplaza el uso disperso de `buybackStatus` para
// ramificar cabecera/contadores/cuerpo. `aprobado` y `aprobado_parcial`
// colapsan en la misma etapa ("Por facturar": la unidad de trabajo pasa de
// herramienta a factura/cupón por país, sin distinción entre aprobado 100% o
// parcial). `rechazada` (BBX `rechazado`) no tiene vista dedicada en este
// trabajo — cae al mismo fallback de tabla read-only que `pendiente_aprobacion`
// (Bord-rechazadas ocultas, sin métricas propias).
// DECISIÓN ABIERTA (heredada de docs/handoff-buybacks-listado-tabs.md §1): el
// BBX `rechazado` tampoco tiene tab en el listado — no se le inventa vista
// propia acá, sigue sin resolver con Camila/Martín.

function Chip({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'informative' }) {
  return (
    <div
      className={`flex shrink-0 items-center gap-[4px] rounded-[4px] border border-solid bg-layout-level-2 px-[8px] py-[4px] ${
        tone === 'informative' ? 'border-informative-fg' : 'border-stroke-default'
      }`}
    >
      {children}
    </div>
  )
}

function MetricCard({
  icon,
  iconBg,
  title,
  value,
  isLast,
  breakdown,
}: {
  icon: string
  iconBg: string
  title: string
  value: string
  isLast?: boolean
  /** Per-country subtotal rows — only shown (as a hover tooltip on the info
      icon) once there are 2 or more countries to break down. */
  breakdown?: { country: string; amount: string }[]
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  return (
    <div className={`flex flex-1 items-center gap-[12px] px-[16px] ${isLast ? '' : 'border-r border-solid border-stroke-default'}`}>
      <div className={`flex size-[32px] shrink-0 items-center justify-center rounded-[8px] ${iconBg}`}>
        <img src={icon} alt="" className="size-[16px]" />
      </div>
      <div className="flex flex-col items-start gap-[4px]">
        <div className="flex items-center gap-[4px]">
          <p className="whitespace-nowrap text-[10px] uppercase leading-normal text-content-secondary">{title}</p>
          {breakdown && breakdown.length >= 2 && (
            <div className="relative flex" onMouseEnter={() => setTooltipOpen(true)} onMouseLeave={() => setTooltipOpen(false)}>
              <span className="flex size-[12px] items-center justify-center rounded-full border border-solid border-stroke-interactive text-[8px] leading-none text-content-secondary">
                i
              </span>
              {tooltipOpen && (
                <div className="absolute left-1/2 top-[calc(100%+8px)] z-30 flex w-max min-w-[220px] -translate-x-1/2 flex-col gap-[6px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 p-[12px] shadow-[0px_8px_24px_rgba(7,15,33,0.16)]">
                  {breakdown.map((row) => (
                    <div key={row.country} className="flex items-center justify-between gap-[16px]">
                      <div className="flex items-center gap-[6px]">
                        <img src={COUNTRY_FLAGS[row.country]} alt="" className="size-[14px] shrink-0 rounded-full" />
                        <span className="whitespace-nowrap text-[12px] normal-case leading-normal text-content-default">{row.country}</span>
                      </div>
                      <span className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">{row.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="whitespace-nowrap text-[16px] font-bold leading-normal text-content-default">{value}</p>
      </div>
    </div>
  )
}

// "Ver herramientas fuera del funnel" — usado en "Por facturar" (rechazadas
// cliente/Bord) y "Comprada" (lo que no llegó a `vendido`): "sólo las
// herramientas Aprobado avanzan... las Rechazado quedan fuera del funnel,
// visibles solo para auditoría (colapsadas)" — se implementa como disclosure
// colapsado, reutilizando `ToolTableRow` (components/ToolTable.tsx) tal cual.
function AuditDisclosure({
  rows,
  onViewDetail,
  onViewPhoto,
}: {
  rows: ToolRow[]
  onViewDetail: (id: string) => void
  onViewPhoto: (id: string, index: number) => void
}) {
  const [open, setOpen] = useState(false)
  if (rows.length === 0) return null

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-[6px] text-[12px] font-medium leading-normal text-primary-default"
      >
        {open ? 'Ocultar' : 'Ver'} herramientas fuera del funnel ({rows.length})
        <img src={iconChevronDown} alt="" className={`size-[10px] opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="w-full overflow-x-auto rounded-[8px] border border-solid border-stroke-default pb-[8px]">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[176px]" />
              <col className="w-[130px]" />
              <col className="w-[105px]" />
              <col className="w-[210px]" />
              <col className="w-[90px]" />
              <col className="w-[230px]" />
              <col className="w-[150px]" />
              <col className="w-[140px]" />
            </colgroup>
            <tbody>
              {rows.map((row, i) => (
                <ToolTableRow
                  key={row.id}
                  row={row}
                  striped={i % 2 === 0}
                  onViewDetail={() => onViewDetail(row.id)}
                  onViewPhoto={(index) => onViewPhoto(row.id, index)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function QuoteDetail() {
  const { id } = useParams()
  const bbKey = id ?? 'BB° 1234'
  // Todo lo compartido con Dash (tools, buybackStatus, facturación, cupones,
  // historial…) vive en el store — ver src/store/bbxStore.ts. Esto reemplaza
  // los useState que antes tenía cada uno de esos campos: leerlos de acá
  // (en vez de duplicarlos en local state) es lo que hace que una acción del
  // cliente en Dash aparezca acá sin recargar, y viceversa.
  const state = useBbxState(bbKey)
  const { buyback, tools, buybackStatus, ofertaEnviadaAt, aprobadoClienteAt, clienteVencimiento, canceladaInfo, historialEstados, cuponesGenerados } = state
  const displayId = buyback?.bbId ?? id ?? 'BB° 1234'

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({})
  const [bulkPriceDraft, setBulkPriceDraft] = useState('')
  const [imageViewer, setImageViewer] = useState<{ toolId: string; index: number } | null>(null)
  const [toolDetailId, setToolDetailId] = useState<string | null>(null)
  const [rejectTargetIds, setRejectTargetIds] = useState<string[] | null>(null)
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null)
  // Explicit "edit" click on an already-managed row's price cell — independent
  // of hover, so the editor stays open (pre-filled) after the mouse leaves.
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [slaType, setSlaType] = useState<'regular' | 'cto'>('regular')
  const [slaMenuOpen, setSlaMenuOpen] = useState(false)
  // Which SLA change is pending double-confirmation — null when no modal is
  // open. Both directions (extend to CTO, revert to Regular) notify the
  // client, so both need explicit confirmation, not just the dropdown pick.
  const [slaConfirmTarget, setSlaConfirmTarget] = useState<SlaType | null>(null)
  const [historialOpen, setHistorialOpen] = useState(false)
  // Modo monitoreo: la oferta ya se envió, no se puede editar/reenviar/cancelar.
  // Antes sólo cubría `pendiente-aprobacion` — eso dejaba `aprobado`/`vencido`/
  // `comprado`/`cancelado` cayendo en la tabla interactiva de por_cotizar por
  // accidente (un BBX cancelado seguía mostrando precio editable). Ahora es
  // "todo menos por_cotizar", que es justamente el único estado con acción.
  const readOnly = buybackStatus !== 'por-cotizar'
  const stage: Stage = STAGE_BY_STATUS[buybackStatus]

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  const quotedTools = tools.filter((t) => t.status === 'quoted')
  const rejectedTools = tools.filter((t) => t.status === 'rejected')
  const totalAmount = quotedTools.reduce((sum, t) => sum + (t.price ?? 0), 0)
  // Per-country subtotal, alphabetical — only meaningful (and only shown) once
  // 2 or more countries are part of the quoted total.
  const totalByCountry = sumByCountry(quotedTools)
  // Modo lectura: lo relevante ya no es el progreso de Martín (cotizadas/
  // rechazadas por Bord, eso ya pasó) sino la decisión del CLIENTE sobre lo
  // ofertado — ver ClientDecision arriba, mismo comentario de "reactivo por
  // ítem" aplica acá.
  // Deriva de `tools` completo (no de `quotedTools`) a propósito: en
  // "Comprada" los ítems aprobados ya pasaron a `status: 'vendido'`, así que
  // filtrar por `status === 'quoted'` los perdería — "Total aprobado" es un
  // techo estable, no debe encogerse cuando un ítem se cupón-ea.
  const approvedByClient = tools.filter((t) => t.clientDecision === 'aprobado')
  const rejectedByClient = quotedTools.filter((t) => t.clientDecision === 'rechazado')
  const pendingClientDecision = quotedTools.filter((t) => t.clientDecision === 'pendiente')
  // "Total del lote" en modo lectura pasa a ser el monto ya APROBADO por el
  // cliente, no el total ofertado — lo pendiente/rechazado todavía puede
  // cambiar o nunca concretarse, así que el número relevante acá es lo que
  // efectivamente se va a comprar hasta ahora.
  const approvedAmount = approvedByClient.reduce((sum, t) => sum + (t.price ?? 0), 0)
  const approvedByCountry = sumByCountry(approvedByClient)
  // "Por facturar"/"Comprada": saldo restante por cupón-ear — lógica NUEVA de
  // BBX (el componente de cupones del módulo de empresas no la calcula hoy).
  // Recalcula en vivo conforme se generan cupones en esta sesión.
  const cuponesGeneradosTotal = cuponesGenerados.reduce((sum, c) => sum + c.montoUsd, 0)
  const saldoPorGenerar = approvedAmount - cuponesGeneradosTotal
  const soldTools = tools.filter((t) => t.status === 'vendido')
  // Cuerpo de "Por facturar" — agrupa `approvedByClient` por país (incluye
  // los ya `vendido`, para que el bloque de su país no desaparezca al generar
  // el cupón, sólo cambia de "pendiente" a "generado"). La agrupación en sí
  // (buildFacturaBlocks) vive en bbxStore.ts — la comparte BbxDashDetail.tsx
  // (Dash) para su propio panel de carga de factura — acá sólo se adapta la
  // forma de `factura` al contrato que ya tenía InvoiceCountryPanel
  // (`{ estado, comentarioFinanzas }` en vez de `{ pais, factura, ... }`).
  const paisesFacturaBlocks: PaisFacturaBlock[] = buildFacturaBlocks(state).map((block) => ({
    pais: block.pais,
    herramientas: block.herramientas,
    subtotalUsd: block.subtotalUsd,
    factura: { estado: block.factura.factura, comentarioFinanzas: block.factura.comentarioFinanzas },
    cupon: block.cupon,
  }))
  // "Facturas OK / esperadas" — esperadas = # de países con equipos aprobados.
  const facturasOk = paisesFacturaBlocks.filter((p) => p.factura.estado === 'ok' || p.cupon.estado === 'generado').length
  // Fila principal de la tabla (`comprada`/`vencida`/`cancelada`/
  // `pendiente_aprobacion`/`rechazada` — `por_facturar` no usa tabla, ver
  // InvoiceCountryPanel) + lo que queda "fuera del funnel" (rechazado por
  // cliente o por Bord), sólo visible tras el toggle de auditoría.
  const tableRows =
    stage === 'comprada'
      ? soldTools
      : stage === 'vencida' || stage === 'cancelada'
        ? tools // congelado completo, sin filtrar — acá sí es auditoría del snapshot
        : tools.filter((row) => row.status !== 'rejected')
  // Sólo "Comprada" — en "Por facturar" se decidió no mostrar lo que quedó
  // fuera del funnel (a pedido explícito, sin disclosure de auditoría ahí).
  const auditRows = stage === 'comprada' ? tools.filter((t) => t.status !== 'vendido') : []
  const allManaged = tools.every((t) => t.status !== 'pending')
  const canSend = allManaged && quotedTools.length > 0 && buybackStatus === 'por-cotizar'
  const canCancel = allManaged && quotedTools.length === 0 && buybackStatus === 'por-cotizar'

  const toolDetail = tools.find((t) => t.id === toolDetailId) ?? null
  const imageViewerTool = imageViewer ? tools.find((t) => t.id === imageViewer.toolId) ?? null : null
  const rejectTargets = rejectTargetIds ? tools.filter((t) => rejectTargetIds.includes(t.id)) : []

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
    setBulkPriceDraft('')
  }

  const allSelected = tools.length > 0 && selectedIds.size === tools.length
  const someSelected = selectedIds.size > 0 && !allSelected

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(tools.map((t) => t.id)))
  }

  function setRowPrice(id: string, value: string) {
    setPriceDrafts((prev) => ({ ...prev, [id]: value }))
  }

  function confirmRowPrice(id: string) {
    const draft = priceDrafts[id]
    const value = Number.parseFloat(draft ?? '')
    if (!draft || Number.isNaN(value) || value <= 0) return
    bbxActions.setToolsPrice(bbKey, [id], value)
    setPriceDrafts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setEditingRowId(null)
  }

  function confirmBulkPrice() {
    const value = Number.parseFloat(bulkPriceDraft)
    if (!bulkPriceDraft || Number.isNaN(value) || value <= 0) return
    bbxActions.setToolsPrice(bbKey, [...selectedIds], value)
    clearSelection()
  }

  function confirmReject(reason: string) {
    if (!rejectTargetIds) return
    bbxActions.rejectTools(bbKey, rejectTargetIds, reason)
    if (rejectTargetIds.length > 1) clearSelection()
    setRejectTargetIds(null)
    setEditingRowId(null)
  }

  // `dueDate` es la fecha ("YYYY-MM-DD") que Martín eligió en OrderSummaryModal
  // como plazo de respuesta del cliente.
  function confirmOrderSummary(dueDate: string) {
    setOrderSummaryOpen(false)
    bbxActions.sendOffer(bbKey, dueDate)
    setToast({
      title: 'Cotización enviada con éxito',
      message: 'Informamos al cliente mediante un correo electrónico y a través de Dash.',
    })
  }

  // `reason` es el motivo que CancelBuybackModal ya emite.
  function confirmCancel(reason: string) {
    setCancelModalOpen(false)
    // No hay sesión/auth en esta app — usuario mockeado, ver DECISIÓN ABIERTA 5.
    bbxActions.cancelBuyback(bbKey, reason)
    setToast({ title: 'Buyback cancelado', message: 'Informamos al cliente mediante un correo electrónico y a través de Dash.' })
  }

  // A pedido explícito: Martín también puede aceptar/rechazar la factura de
  // un país (antes era sólo lectura — ver el comentario en `facturaPorPais`).
  // Sólo aplica mientras la factura sigue `pendiente`/`en_revision`; una vez
  // resuelta (`ok`/`rechazada`) no hay botón de vuelta — mismo criterio que
  // "generado" en cupones, no se modela una re-revisión.
  function revisarFactura(pais: CountryFlag, decision: 'aceptar' | 'rechazar', motivo: string | null) {
    bbxActions.revisarFactura(bbKey, pais, decision, motivo)
    setToast(
      decision === 'aceptar'
        ? { title: 'Factura aprobada', message: `Ya se puede generar el cupón para ${pais}.` }
        : { title: 'Factura rechazada', message: 'Informamos al cliente que debe volver a cargar la factura.' },
    )
  }

  // Único punto de acción real de Martín en "Por facturar": generar el cupón
  // de un país cuya factura ya está `ok`. `montoUsd` ya viene acotado por
  // InvoiceCountryPanel (no puede exceder el subtotal del país ni el saldo
  // restante del lote) — bbxActions.generarCupon revalida el saldo también
  // (bloqueo duro, no sólo visual: el brief pide explícitamente que esto no
  // sea una alerta ignorable).
  function generarCupon(pais: CountryFlag, montoUsd: number) {
    if (montoUsd <= 0 || montoUsd > saldoPorGenerar) return
    bbxActions.generarCupon(bbKey, pais, montoUsd)
    const consecutivo = `BBC-${displayId.replace(/\D/g, '')}-${String(cuponesGenerados.length + 1).padStart(2, '0')}`
    setToast({
      title: 'Cupón generado con éxito',
      message: `${consecutivo} se envió por correo al cliente, al creador del BBX y al admin de la organización.`,
    })
  }

  // Either direction (extend to CTO, revert to Regular) notifies the client,
  // so both need an explicit double-confirmation modal — not just the pick.
  function selectSla(type: SlaType) {
    setSlaMenuOpen(false)
    if (type === slaType) return
    setSlaConfirmTarget(type)
  }

  function confirmSlaChange() {
    if (!slaConfirmTarget) return
    setSlaType(slaConfirmTarget)
    setToast(
      slaConfirmTarget === 'cto'
        ? { title: 'SLA extendido con éxito', message: 'Se amplió el tiempo del SLA para esta cotización y se informó al cliente' }
        : { title: 'SLA actualizado con éxito', message: 'Se actualizó el tiempo del SLA para esta cotización y se informó al cliente' },
    )
    setSlaConfirmTarget(null)
  }

  const statusConfig = STATUS_CONFIG[buybackStatus]
  // "Última actualización" — label + valor varían por etapa (antes era un
  // único placeholder fijo salvo `ofertaEnviadaAt`). `por_cotizar`/`rechazada`
  // no tienen un hito propio definido — mantienen el placeholder de siempre.
  const lastUpdate: { label: string; value: string | null } =
    stage === 'pendiente_aprobacion'
      ? { label: 'Oferta enviada al cliente', value: ofertaEnviadaAt }
      : stage === 'por_facturar'
        ? { label: 'Aprobado por el cliente', value: aprobadoClienteAt }
        : stage === 'comprada'
          ? { label: 'Cupón generado', value: cuponesGenerados.at(-1)?.fecha ?? null }
          : stage === 'vencida'
            ? { label: 'Vencido', value: buyback?.vencidoAt ?? null }
            : stage === 'cancelada'
              ? { label: 'Cancelada', value: canceladaInfo?.fecha ?? null }
              : { label: 'Description', value: null }

  return (
    <div className="flex flex-col">
      <DetailTopBar breadcrumbId={displayId} />
      <div className="flex w-full flex-col items-start gap-[16px] p-[24px]">
        {/* manage-quote-header */}
        <div className="flex w-full flex-col gap-[10px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 py-[12px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.04)]">
          <div className="flex w-full items-center justify-between px-[12px]">
            <div className="flex flex-col items-start gap-[8px]">
              <div className="flex items-center gap-[12px]">
                {/* displayId is the real bbId (e.g. "BB° 9817") when the list
                    linked here with a known one — already reads as a full
                    identifier, so no extra "Buyback N°" prefix needed. */}
                <p className="whitespace-nowrap text-[20px] font-bold leading-normal text-content-default">{displayId}</p>
                <div className={`flex items-center gap-[4px] rounded-[24px] border border-solid ${statusConfig.border} py-[4px] pl-[6px] pr-[8px]`}>
                  <img src={statusConfig.dot} alt="" className="size-[8px]" />
                  <p className={`whitespace-nowrap text-[12px] leading-normal ${statusConfig.text}`}>{statusConfig.label}</p>
                  <div className="h-full w-px shrink-0 bg-stroke-default" />
                  <img src={iconChevronDown} alt="" className="size-[12px] opacity-60" />
                </div>
                {/* Subtipo de "Vencida" — visible junto al pill, no reemplaza
                    el estado de cabecera (que sigue siendo un único "Vencido"). */}
                {stage === 'vencida' && buyback?.vencidoSubtipo && (
                  <p className="whitespace-nowrap text-[12px] leading-normal text-content-secondary">
                    {VENCIDO_SUBTIPO_LABEL[buyback.vencidoSubtipo]}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-[8px]">
                <Chip>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-secondary">País:</p>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">
                    {!buyback ? 'Varios' : buyback.paises.length > 1 ? 'Varios' : buyback.paises[0]}
                  </p>
                  <div className="flex items-center">
                    {(buyback?.paises ?? ['argentina', 'colombia', 'mexico']).map((pais, i, arr) => (
                      <img
                        key={pais}
                        src={LOT_COUNTRY_FLAGS[pais]}
                        alt={pais}
                        className="size-[12px] shrink-0 rounded-full"
                        style={{ marginRight: i === arr.length - 1 ? 0 : -4 }}
                      />
                    ))}
                  </div>
                </Chip>
                <Chip>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-secondary">Creación:</p>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">
                    {buyback?.creacion ?? '12/03/2026'}
                  </p>
                </Chip>
                {/* El SLA de Martín (dropdown Regular/CTO) sólo tiene sentido
                    mientras el BBX sigue en `por_cotizar` — una vez enviada la
                    oferta ese reloj ya terminó. En `pendiente_aprobacion` y
                    `vencida` se reemplaza por un chip NO interactivo con el
                    vencimiento del CLIENTE (contador/fecha distintos, ver
                    `clienteVencimiento`) — mismo estilo neutro que País/Creación
                    (el color queda sólo en el dot). En `por_facturar`/
                    `comprada`/`cancelada` no hay nada que mostrar acá todavía:
                    DECISIÓN ABIERTA 1 (brief) — no existe un SLA/deadline
                    definido para la fase de facturación, así que no se agrega
                    un chip inventado. */}
                {stage === 'por_cotizar' ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSlaMenuOpen((v) => !v)}
                    className="flex shrink-0 items-center gap-[4px] rounded-[4px] border border-solid border-stroke-default bg-layout-level-2 px-[8px] py-[4px]"
                  >
                    <img src={slaType === 'cto' ? statusDotWarning : statusDotInformative} alt="" className="size-[8px] shrink-0" />
                    <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-secondary">
                      SLA:
                    </p>
                    <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">
                      {SLA_CONFIG[slaType].label} <span className="font-bold">(2 horas transcurridas)</span>
                    </p>
                    <img
                      src={iconChevronDown}
                      alt=""
                      className={`size-[12px] opacity-60 transition-transform ${slaMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {slaMenuOpen && (
                    <>
                      {/* Click-outside catcher */}
                      <div className="fixed inset-0 z-10" onClick={() => setSlaMenuOpen(false)} />
                      {/* Matches the width of the trigger chip (the wrapping
                          `relative` div shrinks to the button's content width) and
                          the app's established open-dropdown styling — rounded-[6px],
                          border-stroke-default, bg-layout-level-1 — same as the
                          reject-reason / cancel-buyback dropdown menus. */}
                      <div className="absolute left-0 top-[calc(100%+8px)] z-20 flex w-full min-w-max flex-col gap-[2px] rounded-[6px] border border-solid border-stroke-default bg-layout-level-1 p-[6px] shadow-[0px_8px_24px_rgba(7,15,33,0.12)]">
                        {(Object.keys(SLA_CONFIG) as SlaType[]).map((type) => {
                          const active = slaType === type
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => selectSla(type)}
                              className={`flex items-center gap-[8px] rounded-[6px] px-[8px] py-[6px] text-left ${
                                active ? '' : 'hover:bg-layout-level-2'
                              }`}
                            >
                              <span
                                className={`flex size-[16px] shrink-0 items-center justify-center rounded-full border-2 border-solid ${
                                  active ? 'border-primary-default' : 'border-stroke-interactive'
                                }`}
                              >
                                {active && <span className="size-[8px] rounded-full bg-primary-default" />}
                              </span>
                              <span className={`text-[12px] leading-normal ${active ? 'font-medium text-primary-default' : 'text-content-default'}`}>
                                {SLA_CONFIG[type].label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
                ) : (stage === 'pendiente_aprobacion' || stage === 'vencida') && clienteVencimiento ? (
                  <Chip>
                    <img src={SEMAFORO_DOT[clienteVencimiento.semaforo]} alt="" className="size-[8px] shrink-0" />
                    <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-secondary">
                      {stage === 'vencida' ? 'Venció:' : 'Vencimiento cliente:'}
                    </p>
                    <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">
                      {clienteVencimiento.fecha}
                    </p>
                  </Chip>
                ) : null}
              </div>
            </div>

            {/* last-update card */}
            <div className="flex h-[72px] w-[480px] items-center justify-between rounded-[12px] border border-solid border-stroke-default bg-layout-level-2 px-[12px] py-[8px]">
              <div className="flex h-full items-center gap-[10px]">
                <div className="flex size-[32px] shrink-0 items-center justify-center rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 p-[8px]">
                  <img src={iconTime} alt="" className="size-[18px] opacity-70" />
                </div>
                <div className="flex flex-col items-start gap-[4px]">
                  <p className="w-[145px] whitespace-nowrap text-[10px] uppercase leading-normal tracking-[1px] text-content-secondary">
                    Última actualización
                  </p>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">{lastUpdate.label}</p>
                  <div className="flex items-center gap-[4px] rounded-[24px] border border-solid border-informative-fg px-[6px] py-[1px]">
                    <img src={statusDotInformative} alt="" className="size-[8px]" />
                    <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">
                      {lastUpdate.value ?? '00/00/0000 - 00:00 PM'}
                    </p>
                  </div>
                  {/* Quién/motivo de cancelación — sólo aplica acá, el resto de
                      etapas no captura un actor (no hay auth en la app). */}
                  {stage === 'cancelada' && canceladaInfo && (
                    <p className="max-w-[280px] truncate text-[10px] leading-normal text-content-secondary">
                      {canceladaInfo.usuario} · {canceladaInfo.motivo}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistorialOpen(true)}
                className="flex items-center justify-center gap-[8px] rounded-[8px] border border-solid border-primary-default p-[8px]"
              >
                <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-primary-default">Ver historial</p>
              </button>
            </div>
          </div>

          <img src={divider} alt="" className="h-px w-full opacity-70" />

          <div className="flex w-full items-center justify-between px-[12px]">
            <div className="flex items-center gap-[12px]">
              <img src={avatarClient} alt="" className="size-[56px] rounded-[7px] border-[0.56px] border-solid border-stroke-interactive object-cover" />
              <div className="flex flex-col items-start gap-[4px]">
                <p className="w-[145px] whitespace-nowrap text-[10px] uppercase leading-normal tracking-[1px] text-content-secondary">
                  Cliente standard
                </p>
                <div className="flex items-center gap-[4px]">
                  <p className="whitespace-nowrap text-[14px] leading-normal text-content-default">
                    {buyback?.cliente.nombre ?? 'Playtoy'}
                  </p>
                  <img src={iconExternalLink} alt="" className="size-[12px] opacity-60" />
                </div>
              </div>
            </div>

            <div className="flex w-[200px] flex-col items-start gap-[4px]">
              <p className="w-[145px] whitespace-nowrap text-[10px] uppercase leading-normal tracking-[1px] text-content-secondary">Solicitante</p>
              <div className="flex items-center gap-[4px]">
                <img src={iconPerson} alt="" className="size-[14px] opacity-60" />
                <p className="truncate text-[14px] leading-normal text-content-default">{buyback?.solicitadoPor ?? 'Vicente'}</p>
              </div>
            </div>

            {/* Número de contacto / Correo aren't part of the list's Buyback
                contract (handoff §9 has no contact fields) — left as generic
                placeholders rather than inventing fake contact data. */}
            <div className="flex w-[200px] flex-col items-start gap-[4px]">
              <p className="w-[145px] whitespace-nowrap text-[10px] uppercase leading-normal tracking-[1px] text-content-secondary">
                Número de contacto
              </p>
              <p className="whitespace-nowrap text-[14px] leading-normal text-content-default">+52 5556747758</p>
            </div>

            <div className="flex w-[200px] flex-col items-start gap-[4px]">
              <p className="w-[145px] whitespace-nowrap text-[10px] uppercase leading-normal tracking-[1px] text-content-secondary">Correo</p>
              <p className="whitespace-nowrap text-[14px] leading-normal text-content-default">claudia@playtoy.com</p>
            </div>

            <button
              type="button"
              className="flex shrink-0 items-center justify-center gap-[8px] rounded-[8px] border border-solid border-primary-default px-[8px] py-[12px]"
            >
              <p className="whitespace-nowrap text-[14px] font-medium leading-normal text-primary-default">
                Agregar responsables
              </p>
              <img src={iconPlusCircle} alt="" className="size-[14px]" />
            </button>
          </div>
        </div>

        {/* Metric group card — the send/cancel button lives INSIDE this same
            bordered container, as its own rounded pill with breathing room
            (not edge-to-edge, not tinted green when disabled) — per reference.
            Cada etapa cuenta sólo lo que sigue siendo relevante ahí (mismo
            patrón que ya diferenciaba pendiente_aprobacion de por_cotizar).
            `cancelada` no tiene contadores pedidos en el brief — se omite la
            fila entera en vez de inventar una métrica. */}
        {stage !== 'cancelada' && (
          <div className="flex h-[66px] w-full items-center gap-[12px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 pr-[12px]">
            {stage === 'por_cotizar' ? (
              <>
                <MetricCard icon={iconCheck} iconBg="bg-success-bg" title="Cotizadas" value={pluralizeTools(quotedTools.length)} />
                <MetricCard icon={iconX} iconBg="bg-danger-bg" title="Rechazadas" value={pluralizeTools(rejectedTools.length)} />
                <MetricCard
                  icon={iconDollarSign}
                  iconBg="bg-informative-bg"
                  title="Total del lote"
                  value={formatUSD(totalAmount)}
                  breakdown={totalByCountry}
                  isLast
                />
                <div className="h-[32px] w-px shrink-0 bg-stroke-default" />
                {canCancel ? (
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(true)}
                    className="flex h-[42px] shrink-0 items-center justify-center gap-[8px] rounded-[8px] bg-danger-fg px-[24px] text-white"
                  >
                    <p className="whitespace-nowrap text-[14px] font-medium leading-normal">Cancelar buyback</p>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canSend}
                    onClick={() => canSend && setOrderSummaryOpen(true)}
                    className={`flex h-[42px] min-w-[280px] shrink-0 items-center justify-center gap-[8px] rounded-[8px] px-[40px] ${
                      canSend ? 'bg-primary-default text-primary-fg' : 'bg-stroke-default text-content-secondary'
                    }`}
                  >
                    <img src={canSend ? iconSend : iconSendSecondary} alt="" className="size-[14px]" />
                    <p className="whitespace-nowrap text-[14px] font-medium leading-normal">Enviar buyback</p>
                  </button>
                )}
              </>
            ) : stage === 'pendiente_aprobacion' ? (
              <>
                <MetricCard icon={iconCheck} iconBg="bg-success-bg" title="Aprobadas" value={pluralizeTools(approvedByClient.length)} />
                <MetricCard icon={iconX} iconBg="bg-danger-bg" title="Rechazadas" value={pluralizeTools(rejectedByClient.length)} />
                <MetricCard icon={iconTime} iconBg="bg-informative-bg" title="Pendientes" value={pluralizeTools(pendingClientDecision.length)} />
                <MetricCard
                  icon={iconDollarSign}
                  iconBg="bg-informative-bg"
                  title="Total aprobado"
                  value={formatUSD(approvedAmount)}
                  breakdown={approvedByCountry}
                  isLast
                />
              </>
            ) : stage === 'por_facturar' ? (
              <>
                <MetricCard
                  icon={iconCheck}
                  iconBg="bg-success-bg"
                  title="Facturas OK / esperadas"
                  value={`${facturasOk}/${paisesFacturaBlocks.length}`}
                />
                <MetricCard icon={iconCheckCircle} iconBg="bg-success-bg" title="Cupones generados" value={String(cuponesGenerados.length)} />
                <MetricCard
                  icon={iconDollarSign}
                  iconBg="bg-informative-bg"
                  title="Total aprobado"
                  value={formatUSD(approvedAmount)}
                  breakdown={approvedByCountry}
                />
                {/* El dato más importante para Martín en esta etapa — lo que
                    todavía puede convertirse en cupón. */}
                <MetricCard icon={iconDollarSign} iconBg="bg-warning-bg" title="Saldo por generar" value={formatUSD(saldoPorGenerar)} isLast />
              </>
            ) : stage === 'comprada' ? (
              <>
                <MetricCard icon={iconCheck} iconBg="bg-success-bg" title="Herramientas compradas" value={pluralizeTools(soldTools.length)} />
                <MetricCard
                  icon={iconCheckCircle}
                  iconBg="bg-success-bg"
                  title="Cupones generados"
                  value={`${cuponesGenerados.length} · ${formatUSD(cuponesGeneradosTotal)}`}
                />
                <MetricCard
                  icon={iconDollarSign}
                  iconBg="bg-informative-bg"
                  title="Total aprobado"
                  value={formatUSD(approvedAmount)}
                  breakdown={approvedByCountry}
                  isLast={saldoPorGenerar <= 0}
                />
                {/* DECISIÓN ABIERTA 2 (brief): ¿un BBX puede cerrar en "Comprada"
                    con saldo aprobado que nunca se cupón-eó? Sólo se muestra
                    si queda saldo — no se asume qué pasa con él. */}
                {saldoPorGenerar > 0 && (
                  <MetricCard icon={iconDollarSign} iconBg="bg-warning-bg" title="Saldo sin cupón" value={formatUSD(saldoPorGenerar)} isLast />
                )}
              </>
            ) : stage === 'vencida' ? (
              <>
                <MetricCard icon={iconCheck} iconBg="bg-success-bg" title="Aprobadas al vencer" value={pluralizeTools(approvedByClient.length)} />
                <MetricCard icon={iconX} iconBg="bg-danger-bg" title="Rechazadas al vencer" value={pluralizeTools(rejectedByClient.length)} />
                <MetricCard icon={iconTime} iconBg="bg-informative-bg" title="Pendientes al vencer" value={pluralizeTools(pendingClientDecision.length)} />
                {/* Nada se compró — informativo, no es plata "en juego". */}
                <MetricCard
                  icon={iconDollarSign}
                  iconBg="bg-informative-bg"
                  title="Se habría comprado"
                  value={formatUSD(approvedAmount)}
                  breakdown={approvedByCountry}
                  isLast
                />
              </>
            ) : null}
          </div>
        )}

        {/* "Por facturar" cambia de tabla plana a agrupado-por-país (cambio
            estructural pedido explícitamente) — InvoiceCountryPanel reemplaza
            por completo el filtro/tabla de abajo para esta etapa. Las
            herramientas fuera del funnel (rechazadas cliente/Bord) no se
            muestran acá — a pedido explícito, sin disclosure de auditoría. */}
        {stage === 'por_facturar' && (
          <InvoiceCountryPanel
            paises={paisesFacturaBlocks}
            saldoPorGenerar={saldoPorGenerar}
            cuponesGenerados={cuponesGenerados}
            onRevisarFactura={revisarFactura}
            onGenerarCupon={generarCupon}
          />
        )}

        {stage === 'vencida' && (
          <div className="flex w-full items-center rounded-[8px] border border-solid border-danger-fg bg-danger-bg px-[16px] py-[10px]">
            <p className="text-[12px] leading-normal text-content-default">
              <span className="font-bold">Este BBX venció:</span> todos los equipos volvieron al estado que tenían en
              inventario antes del BBX. La tabla de abajo muestra el estado en el que quedó cada uno justo antes de vencer
              (congelado, sólo auditoría).
            </p>
          </div>
        )}

        {stage === 'cancelada' && (
          <div className="flex w-full items-center rounded-[8px] border border-solid border-danger-fg bg-danger-bg px-[16px] py-[10px]">
            <p className="text-[12px] leading-normal text-content-default">
              <span className="font-bold">Buyback cancelado.</span>{' '}
              {/* DECISIÓN ABIERTA 5 (brief): "Cancelada" no está en la spec —
                  no se asume el efecto real sobre inventario, se asume el
                  mismo comportamiento que "Vencido" (los equipos vuelven a su
                  estado previo) sólo como placeholder a confirmar. */}
              Efecto sobre inventario: se asume el mismo comportamiento que "Vencido" (los equipos vuelven a su estado
              previo) — a confirmar con producto.
            </p>
          </div>
        )}

        {/* Filter + tab row — no aplica a "Por facturar" (sin tabla plana). */}
        {stage !== 'por_facturar' && (
        <>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <img src={iconFilter} alt="" className="size-[14px] shrink-0 opacity-60" />
            {TABLE_FILTERS.map((label) => (
              <div
                key={label}
                className="flex items-center gap-[8px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 p-[8px]"
              >
                <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-secondary">{label}</p>
                <img src={iconChevron} alt="" className="size-[12px] shrink-0 opacity-60" />
              </div>
            ))}
            <button type="button" className="flex items-center gap-[8px]">
              <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">Ordenar</p>
              <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full border border-solid border-stroke-default">
                <img src={iconSort} alt="" className="size-[12px] -rotate-90" />
              </span>
            </button>
          </div>
          <div className="flex h-[36px] w-[340px] items-center gap-[8px] rounded-[6px] border border-solid border-stroke-default px-[12px]">
            <img src={headerSearch} alt="" className="size-[14px] shrink-0 opacity-50" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full min-w-0 flex-1 bg-transparent text-[12px] text-content-default placeholder:text-content-secondary focus:outline-none"
            />
          </div>
        </div>

        {/* Table — readOnly usa el ToolTable compartido con Dash
            (components/ToolTable.tsx, mismas filas/comportamientos que
            BbxDashDetail.tsx); sólo el flujo interactivo por_cotizar
            (checkbox + precio editable) sigue siendo 100% Soga, sin
            equivalente en Dash. */}
        {readOnly ? (
          <ToolTable
            rows={tableRows}
            onViewDetail={setToolDetailId}
            onViewPhoto={(id, index) => setImageViewer({ toolId: id, index })}
          />
        ) : (
        <div className="w-full overflow-x-auto rounded-[8px] border border-solid border-stroke-default pb-[8px]">
          {/* table-fixed + explicit per-column widths so the hover-revealed content
              (spec line, "Ver detalle", thumbnails, secondary tags) never reflows the
              column widths — it wraps/clips inside the fixed column instead. */}
          <table className="w-full table-fixed border-collapse text-left">
            {/* Column widths are proportional to the real Figma column frames
                (48/164/164/120/224/124/224/194px, measured from the "Tabla" node
                metadata), scaled down to fit this app's content width — Figma's own
                frame excludes the persistent Sidebar, ours doesn't, so copying its
                absolute px caused the table to overflow/cut off. Every column
                (including Precio) has an explicit width — leaving one column unsized
                made it greedily absorb 100% of the leftover space as a giant gap. */}
            <colgroup>
              <col className="w-[38px]" />
              <col className="w-[176px]" />
              <col className="w-[130px]" />
              <col className="w-[105px]" />
              <col className="w-[210px]" />
              <col className="w-[90px]" />
              <col className="w-[230px]" />
              <col className="w-[210px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-solid border-stroke-default bg-layout-level-1">
                <th className="px-[12px] py-[12px]">
                  <button
                    type="button"
                    aria-label={allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                    onClick={toggleSelectAll}
                    className={`flex size-[14px] items-center justify-center rounded-[4px] border border-solid ${
                      allSelected || someSelected ? 'border-primary-default bg-primary-default' : 'border-stroke-interactive'
                    }`}
                  >
                    {allSelected && <img src={iconCheck} alt="" className="size-[9px] brightness-0 invert" />}
                    {someSelected && <span className="block h-[2px] w-[8px] rounded-full bg-white" />}
                  </button>
                </th>
                <th className="border-l border-solid border-stroke-default px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">
                  Modelo
                </th>
                <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Serial</th>
                <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Condición</th>
                <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Detalles</th>
                <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">País</th>
                <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Comentarios</th>
                <th className="border-l border-solid border-stroke-default px-[12px] py-[12px] text-right text-[12px] font-bold leading-normal text-content-default">
                  Precio final con impuestos
                </th>
              </tr>
            </thead>
            <tbody>
              {tools.map((row, i) => {
                // Light-theme banding: alternate white / layout-level-2 (#fafaf9) instead
                // of the dark-navy stripe the Figma reference used.
                const striped = i % 2 === 0
                const selected = selectedIds.has(row.id)
                const { danger, extraDangerTags, success, extraSuccessTags } = splitTags(row.tags)
                const photos = Array.from({ length: TOOL_PHOTO_COUNT }, () => toolCoverPhoto)
                const priceDraft = priceDrafts[row.id] ?? (row.price != null ? row.price.toFixed(2) : '')
                const draftValue = Number.parseFloat(priceDraft)
                const canConfirmRow = priceDraft.trim() !== '' && !Number.isNaN(draftValue) && draftValue > 0
                const isEditingRow = editingRowId === row.id

                return (
                  <tr
                    key={row.id}
                    className={`group border-b border-solid border-stroke-default align-top last:border-b-0 ${
                      selected ? 'bg-primary-default/10' : striped ? 'bg-layout-level-2' : 'bg-layout-level-1'
                    }`}
                  >
                    <td className="px-[12px] py-[16px]">
                      <button
                        type="button"
                        aria-label={selected ? 'Deseleccionar herramienta' : 'Seleccionar herramienta'}
                        onClick={() => toggleSelect(row.id)}
                        className={`flex size-[14px] items-center justify-center rounded-[4px] border border-solid ${
                          selected ? 'border-primary-default bg-primary-default' : 'border-stroke-interactive'
                        }`}
                      >
                        {selected && <img src={iconCheck} alt="" className="size-[9px] brightness-0 invert" />}
                      </button>
                    </td>
                    <td className="border-l border-solid border-stroke-default px-[12px] py-[16px]">
                      <div className="flex flex-col items-start gap-[6px]">
                        <p className="text-[12px] leading-normal text-content-default">{row.model}</p>
                        {/* Revealed on row hover — see Figma "expanded row" reference (31778:776713) */}
                        <div className="hidden group-hover:flex">
                          <p className="text-[11px] leading-normal text-content-secondary">{row.spec}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-[12px] py-[16px]">
                      <div className="flex flex-col items-start gap-[6px]">
                        <p className="text-[12px] leading-normal text-content-secondary">{row.serial}</p>
                        {/* "Ver detalle" sits under Serial, not Modelo — per Figma expanded-row reference */}
                        <button
                          type="button"
                          onClick={() => setToolDetailId(row.id)}
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
                          <span
                            className={`flex size-[24px] items-center justify-center rounded-[8px] text-[12px] font-bold ${GRADE_STYLES[row.grade]}`}
                          >
                            {row.grade}
                          </span>
                          {/* DSN is a separate link (device serial lookup), not wired to the
                              "Interna de la herramienta" drawer — only "Ver detalle" opens it. */}
                          <span className="flex items-center gap-[4px] text-[12px] leading-normal text-primary-default">
                            DSN
                            <img src={iconExternalLink} alt="" className="size-[10px]" />
                          </span>
                        </div>
                        {/* Revealed on row hover — clickable thumbnails open the image viewer modal */}
                        <div className="hidden items-center gap-[4px] group-hover:flex">
                          {photos.slice(0, 2).map((photo, idx) => (
                            <button
                              key={idx}
                              type="button"
                              aria-label="Ver foto"
                              onClick={() => setImageViewer({ toolId: row.id, index: idx })}
                              className="size-[24px] shrink-0 overflow-hidden rounded-[6px] border border-solid border-stroke-default"
                            >
                              <img src={photo} alt="" className="size-full object-cover" />
                            </button>
                          ))}
                          {photos.length > 2 && (
                            <button
                              type="button"
                              aria-label="Ver foto"
                              onClick={() => setImageViewer({ toolId: row.id, index: 2 })}
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
                        {/* Danger tags always render on the top line (red x-circle) —
                            never mixed with success tags on the same line. */}
                        {danger.length > 0 && (
                          <div className="flex flex-wrap items-center gap-[4px]">
                            <img src={iconXCircle} alt="" className="size-[14px] shrink-0" />
                            {danger.map((tag) => (
                              <span
                                key={tag.label}
                                className="whitespace-nowrap rounded-[12px] bg-danger-bg px-[8px] py-[2px] text-[10px] leading-normal text-danger-fg"
                              >
                                {tag.label}
                              </span>
                            ))}
                            <ExtraTagsBadge tags={extraDangerTags} tone="danger" />
                          </div>
                        )}
                        {/* Success tags always render on their own line (green
                            check-circle). When there's no danger line above it, this
                            becomes the default-visible line instead of a hover reveal —
                            there'd be nothing to hide it behind otherwise. */}
                        {success.length > 0 && (
                          <div
                            className={`flex flex-wrap items-center gap-[4px] ${
                              danger.length > 0 ? 'hidden group-hover:flex' : ''
                            }`}
                          >
                            <img src={iconCheckCircle} alt="" className="size-[14px] shrink-0" />
                            {success.map((tag) => (
                              <span
                                key={tag.label}
                                className="whitespace-nowrap rounded-[12px] bg-success-bg px-[8px] py-[2px] text-[10px] leading-normal text-success-fg"
                              >
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
                    <td className="border-l border-solid border-stroke-default px-[12px] py-[16px] text-right">
                      {/* Default state — depends on management status. For a still-pending
                          row (no pencil button yet), row hover reveals the editor directly.
                          Once quoted/rejected, hover must NOT hide this anymore — reaching
                          for the pencil button below would itself trigger the row hover and
                          hide the very button being clicked. Only the explicit pencil click
                          (isEditingRow) opens the editor for those rows. */}
                      <div
                        className={`flex items-center justify-end gap-[6px] ${row.status === 'pending' ? 'group-hover:hidden' : ''} ${
                          isEditingRow ? 'hidden' : ''
                        }`}
                      >
                        {row.status === 'quoted' && (
                          <p className="text-[12px] font-medium leading-normal text-content-default">{formatUSD(row.price ?? 0)}</p>
                        )}
                        {row.status === 'rejected' && (
                          <p className="text-[12px] leading-normal text-danger-fg">
                            <span className="font-medium">Rechazado:</span> {row.rejectReason}
                          </p>
                        )}
                        {row.status === 'pending' && <p className="text-[12px] font-medium leading-normal text-content-default">$00.00 USD</p>}
                        {row.status !== 'pending' && (
                          <button
                            type="button"
                            aria-label="Editar"
                            onClick={() => setEditingRowId(row.id)}
                            className="flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border border-solid border-stroke-default"
                          >
                            <img src={iconEditPencil} alt="" className="size-[10px]" />
                          </button>
                        )}
                      </div>
                      {/* Pending rows: revealed on row hover. Quoted/rejected rows: only
                          opened via the explicit pencil click above (isEditingRow) — no
                          hover involvement, so hovering near the pencil can't hide it. */}
                      <div
                        className={`flex-col items-end gap-[4px] ${
                          isEditingRow ? 'flex' : row.status === 'pending' ? 'hidden group-hover:flex' : 'hidden'
                        }`}
                      >
                        <div className="flex items-center gap-[6px]">
                          <div
                            className={`flex h-[32px] w-[110px] items-center gap-[4px] rounded-[8px] border-2 border-solid bg-layout-level-1 px-[10px] text-[12px] ${
                              canConfirmRow ? 'border-primary-default' : 'border-stroke-interactive'
                            }`}
                          >
                            <span className="shrink-0 text-[11px] text-content-secondary opacity-70">$</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={priceDraft}
                              onChange={(event) => setRowPrice(row.id, event.target.value)}
                              placeholder="0.00"
                              className="w-full min-w-0 bg-transparent text-[12px] text-content-default placeholder:text-content-secondary focus:outline-none"
                            />
                            <span className="shrink-0 text-[11px] text-content-secondary opacity-70">USD</span>
                          </div>
                          {/* Confirm = solid filled primary pill with a white check (not an
                              outline), reject = soft danger fill, borderless — per reference. */}
                          <button
                            type="button"
                            aria-label="Confirmar precio"
                            disabled={!canConfirmRow}
                            onClick={() => confirmRowPrice(row.id)}
                            className={`flex size-[32px] shrink-0 items-center justify-center rounded-[10px] ${
                              canConfirmRow ? 'bg-primary-default' : 'bg-stroke-default'
                            }`}
                          >
                            <img src={iconCheck} alt="" className="size-[14px] brightness-0 invert" />
                          </button>
                          <button
                            type="button"
                            aria-label="Rechazar herramienta"
                            onClick={() => setRejectTargetIds([row.id])}
                            className="flex size-[32px] shrink-0 items-center justify-center rounded-[10px] bg-danger-bg"
                          >
                            <img src={iconX} alt="" className="size-[14px]" />
                          </button>
                        </div>
                        <div className="flex items-center gap-[4px]">
                          <InfoTooltip message="Precio de la última herramienta comprada con este mismo SKU." />
                          <p className="whitespace-nowrap text-[10px] leading-normal text-content-secondary">
                            Último buyback: {row.lastBuyback}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
        {/* "Comprada": Facturas (por país, OK de Finanzas + PDF) y Cupones
            generados — reutiliza el mismo InvoiceCountryPanel de "Por
            facturar" en modo ya resuelto (todo `ok`/`generado`, sin acción
            pendiente en el caso normal). */}
        {stage === 'comprada' && paisesFacturaBlocks.length > 0 && (
          <InvoiceCountryPanel
            paises={paisesFacturaBlocks}
            saldoPorGenerar={saldoPorGenerar}
            cuponesGenerados={cuponesGenerados}
            onRevisarFactura={revisarFactura}
            onGenerarCupon={generarCupon}
          />
        )}
        <AuditDisclosure
          rows={auditRows}
          onViewDetail={setToolDetailId}
          onViewPhoto={(id, index) => setImageViewer({ toolId: id, index })}
        />
        </>
        )}
      </div>

      {/* No hay selección posible en modo lectura (sin checkboxes en la
          tabla), pero se guarda explícitamente por claridad. */}
      {!readOnly && selectedIds.size > 0 && (
        <BulkActionIsland
          count={selectedIds.size}
          price={bulkPriceDraft}
          onPriceChange={setBulkPriceDraft}
          onConfirmPrice={confirmBulkPrice}
          onReject={() => setRejectTargetIds([...selectedIds])}
          onClose={clearSelection}
        />
      )}

      {imageViewer && imageViewerTool && (
        <ImageViewerModal
          photos={Array.from({ length: TOOL_PHOTO_COUNT }, () => toolCoverPhoto)}
          initialIndex={imageViewer.index}
          onClose={() => setImageViewer(null)}
        />
      )}

      {toolDetail && (
        <ToolDetailDrawer
          model={toolDetail.model}
          serial={toolDetail.serial}
          specs={toolDetail.spec.split(', ')}
          ofertaHistorial={toolDetail.ofertaHistorial}
          onClose={() => setToolDetailId(null)}
        />
      )}

      {rejectTargetIds && (
        <RejectReasonModal
          count={rejectTargetIds.length}
          toolSummary={
            rejectTargetIds.length === 1 && rejectTargets[0]
              ? {
                  model: rejectTargets[0].model,
                  serial: rejectTargets[0].serial,
                  specs: rejectTargets[0].spec.split(', '),
                  grade: rejectTargets[0].grade,
                  country: rejectTargets[0].country,
                }
              : null
          }
          onCancel={() => setRejectTargetIds(null)}
          onConfirm={confirmReject}
        />
      )}

      {orderSummaryOpen && (
        <OrderSummaryModal
          buybackId={displayId}
          client="Playtoy Inc"
          quotedCount={quotedTools.length}
          rejectedCount={rejectedTools.length}
          totalAmount={totalAmount}
          onCancel={() => setOrderSummaryOpen(false)}
          onConfirm={confirmOrderSummary}
        />
      )}

      {cancelModalOpen && <CancelBuybackModal onCancel={() => setCancelModalOpen(false)} onConfirm={confirmCancel} />}

      {slaConfirmTarget && (
        <ConfirmSlaChangeModal target={slaConfirmTarget} onCancel={() => setSlaConfirmTarget(null)} onConfirm={confirmSlaChange} />
      )}

      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}

      {historialOpen && <HistorialModal entries={historialEstados} onClose={() => setHistorialOpen(false)} />}
    </div>
  )
}
