import { useState } from 'react'
import { useParams } from 'react-router-dom'

import DashSidebar from '../components/dash/DashSidebar'
import DashTopBar from '../components/dash/DashTopBar'
import DashFeedbackAlert from '../components/dash/DashFeedbackAlert'
import HistorialModal from '../components/HistorialModal'
import ToolDetailDrawer from '../components/ToolDetailDrawer'
import ImageViewerModal from '../components/ImageViewerModal'
import ClientRejectReasonModal from '../components/dash/ClientRejectReasonModal'
import ClientInvoiceCountryPanel from '../components/dash/ClientInvoiceCountryPanel'
import DashApprovalBulkBar from '../components/dash/DashApprovalBulkBar'
import ConfirmDecisionModal from '../components/dash/ConfirmDecisionModal'
import { ToolTable, TOOL_PHOTO_COUNT } from '../components/ToolTable'
import toolCoverPhoto from '../assets/quote-detail/tool-cover-photo.png'

import {
  allDecisionsMade,
  approvedAmountFor,
  bbxActions,
  buildFacturaBlocks,
  useBbxState,
  STAGE_BY_STATUS,
  type BuybackStatus,
  type ClientRejectReason,
  type Stage,
} from '../store/bbxStore'
import { formatUSD, pluralizeTools } from '../lib/format'
import type { ClienteVencimientoSemaforo } from '../data/buybacks'

import statusDotInformative from '../assets/quote-detail/status-dot-informative.svg'
import statusDotWarning from '../assets/quote-detail/status-dot-warning.svg'
import statusDotDanger from '../assets/quote-detail/status-dot-danger.svg'
import statusDotSuccess from '../assets/quote-detail/status-dot-success.svg'
import iconTime from '../assets/quote-detail/icon-time.svg'
import iconCheck from '../assets/quote-detail/icon-check.svg'
import iconXCircle from '../assets/quote-detail/icon-x-circle.svg'
import iconPerson from '../assets/quote-detail/icon-person.svg'
import iconPlusCircle from '../assets/quote-detail/icon-plus-circle.svg'

import flagMexico from '../assets/quote-module/flag-mexico.svg'
import flagColombia from '../assets/quote-module/flag-colombia.svg'
import flagArgentina from '../assets/quote-module/flag-argentina.svg'
import flagTurkey from '../assets/quote-module/flag-turkey.svg'
import flagVenezuela from '../assets/quote-module/flag-venezuela.svg'

// Dash (cliente) — su propia superficie: ruta propia (/dash/bbx/:id), su
// propio layout/chrome oscuro (DashSidebar/DashTopBar, NO Soga's Sidebar/
// DetailTopBar) abierta en otra pestaña del navegador, tema oscuro (envuelto
// en `.dash-theme`, ver index.css — docs/design-system.md "Dark (Dash)").
// El header/chips/tabla de "por_cotizar" están portados del diseño real en
// Figma (fileKey 1EUxZtg23ladPT9arKzHrA, node 36380:140402 — "Preparando
// buyback") en vez de improvisados; las demás etapas (pendiente_aprobacion/
// por_facturar/comprada/vencida/cancelada) no tenían un frame propio
// disponible ahí, así que reusan el MISMO lenguaje visual confirmado
// (header sin card contenedora, chips bg-layout-level-1, feedback-alert)
// en vez de inventar un estilo distinto para cada una.
// Comparte el mismo store (bbxStore.ts) y el mismo modelo de estados que
// QuoteDetail.tsx (Soga/interna) — NO es un re-skin de esas pantallas, ni
// vive dentro de ellas. Lo que cambia entre las dos es quién actúa y qué se
// muestra por etapa. Ver el brief para la tabla "dónde actúa cada lado":
//   - por_cotizar        → sólo lectura (tabla completa, "Oferta: En preparación")
//   - pendiente_aprobacion → el cliente aprueba/rechaza ítem a ítem
//   - por_facturar        → el cliente sube/envía la factura por país
//   - comprada            → el cliente ve sus cupones BBC (sólo lectura)
//   - vencida/cancelada    → sólo lectura
// Nada de saldos/consecutivos internos, comentarios internos, estado de
// Finanzas como tal, ni los motivos internos de rechazo de Bord — ver
// "Qué NO exponer" en el brief. La tabla de condición/detalles (grade + tags
// de inspección) SÍ es de cara al cliente — corrección respecto a una
// versión anterior de este archivo: el Figma real la muestra tal cual.

const LOT_COUNTRY_FLAGS: Record<string, string> = {
  mexico: flagMexico,
  colombia: flagColombia,
  argentina: flagArgentina,
  turkey: flagTurkey,
  venezuela: flagVenezuela,
}

// Mismo mapeo de color/dot que STATUS_CONFIG en QuoteDetail.tsx — copia local
// (no importada) para no acoplar Dash a un archivo que es, por lo demás,
// 100% Soga. El LABEL de `por-cotizar` usa el copy de cliente confirmado por
// Figma ("Preparando buyback" en vez de "Por cotizar"); el resto no tenía
// una pantalla de referencia propia — se mantiene el nombre de estado tal
// cual hasta que haya un frame que diga lo contrario.
const STATUS_LABEL: Record<BuybackStatus, { label: string; border: string; dot: string }> = {
  'por-cotizar': { label: 'Preparando buyback', border: 'border-warning-fg', dot: statusDotWarning },
  'pendiente-aprobacion': { label: 'Pendiente de aprobación', border: 'border-informative-fg', dot: statusDotInformative },
  cancelado: { label: 'Cancelado', border: 'border-danger-fg', dot: statusDotDanger },
  aprobado: { label: 'Aprobado', border: 'border-warning-fg', dot: statusDotWarning },
  'aprobado-parcial': { label: 'Aprobado parcial', border: 'border-warning-fg', dot: statusDotWarning },
  rechazado: { label: 'Rechazado', border: 'border-danger-fg', dot: statusDotDanger },
  vencido: { label: 'Vencido', border: 'border-danger-fg', dot: statusDotDanger },
  comprado: { label: 'Comprado', border: 'border-success-fg', dot: statusDotSuccess },
}

const SEMAFORO_DOT: Record<ClienteVencimientoSemaforo, string> = {
  ok: statusDotInformative,
  warning: statusDotWarning,
  vencido: statusDotDanger,
}

const VENCIDO_SUBTIPO_CLIENT_LABEL: Record<'sin_respuesta' | 'rechazado' | 'no_concretado', string> = {
  sin_respuesta: 'No llegaste a responder dentro del plazo.',
  rechazado: 'Rechazaste esta oferta.',
  no_concretado: 'No se completó la facturación dentro del plazo.',
}

// bg-layout-level-1 per the Figma "chip" node (I36380:143015;...;14768:...) —
// not level-2 like this file's own header card used before (that card no
// longer exists; the header now sits directly on the page background, per
// reference, no bordered container around it).
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-[4px] rounded-[4px] border border-solid border-stroke-default bg-layout-level-1 px-[8px] py-[4px]">
      {children}
    </div>
  )
}

export default function BbxDashDetail() {
  const { id } = useParams()
  const bbKey = id ?? 'BB° 1234'
  // Mismo store que QuoteDetail.tsx — cualquier acción de Martín/Finanzas ya
  // reflejada acá sin recargar, y viceversa (ver src/store/bbxStore.ts).
  const state = useBbxState(bbKey)
  const { buyback, tools, buybackStatus, ofertaEnviadaAt, aprobadoClienteAt, clienteVencimiento, cuponesGenerados, historialEstados } = state
  const displayId = buyback?.bbId ?? id ?? 'BB° 1234'
  const stage: Stage = STAGE_BY_STATUS[buybackStatus]
  const statusCfg = STATUS_LABEL[buybackStatus]

  const [historialOpen, setHistorialOpen] = useState(false)
  // Array, no un solo id — soporta rechazo individual (1 elemento) y masivo
  // por selección (N elementos), mismo criterio que Soga's `rejectTargetIds`.
  const [rejectTargetIds, setRejectTargetIds] = useState<string[] | null>(null)
  // Selección para aprobar/rechazar en bloque — doc "BBX · Dash" §1:
  // "Aprobación/rechazo también masivo por selección (checkbox de fila +
  // checkbox de header para todo el lote), mismo patrón de 'ofertar precio'
  // en Soga". Sólo tiene sentido en `pendiente_aprobacion`; se limpia sola
  // al cambiar de BBX porque vive en este componente, no en el store.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmDecisionOpen, setConfirmDecisionOpen] = useState(false)
  // Mismo drawer/visor de fotos que Soga (ToolDetailDrawer/ImageViewerModal,
  // sin cambios) — "Ver detalle" y las miniaturas de la tabla abren lo mismo
  // acá que allá, sólo recoloreado por `.dash-theme`.
  const [toolDetailId, setToolDetailId] = useState<string | null>(null)
  const [imageViewer, setImageViewer] = useState<{ toolId: string; index: number } | null>(null)

  const quotedTools = tools.filter((t) => t.status === 'quoted')
  const rejectedByBord = tools.filter((t) => t.status === 'rejected')
  const approvedAmount = approvedAmountFor(state)
  const soldTools = tools.filter((t) => t.status === 'vendido')
  const paisesFacturaBlocks = buildFacturaBlocks(state)
  // Métrica de progreso "aprobadas / rechazadas / pendientes sobre el total
  // del lote" (doc "BBX · Dash" §1) — mismo criterio que Soga's propio
  // metric-card row para esta misma etapa (QuoteDetail.tsx).
  const approvedByClient = quotedTools.filter((t) => t.clientDecision === 'aprobado')
  const rejectedByClient = quotedTools.filter((t) => t.clientDecision === 'rechazado')
  const pendingDecision = quotedTools.filter((t) => t.clientDecision === 'pendiente')

  // "Puede cambiar su decisión hasta el vencimiento" — el BBX no avanza
  // solo al terminar de decidir, ver `bbxActions.confirmDecisions` más abajo.
  const vencido = clienteVencimiento?.semaforo === 'vencido'
  const canDecide = stage === 'pendiente_aprobacion' && !vencido
  const rejectTargets = rejectTargetIds ? tools.filter((t) => rejectTargetIds.includes(t.id)) : []
  const toolDetail = tools.find((t) => t.id === toolDetailId) ?? null
  const imageViewerTool = imageViewer ? tools.find((t) => t.id === imageViewer.toolId) ?? null : null

  function approve(toolId: string) {
    bbxActions.clientDecide(bbKey, toolId, 'aprobado', null)
  }

  function approveMany(toolIds: string[]) {
    toolIds.forEach((id) => bbxActions.clientDecide(bbKey, id, 'aprobado', null))
    clearSelection()
  }

  function confirmReject(reason: ClientRejectReason) {
    if (!rejectTargetIds) return
    rejectTargetIds.forEach((id) => bbxActions.clientDecide(bbKey, id, 'rechazado', reason))
    if (rejectTargetIds.length > 1) clearSelection()
    setRejectTargetIds(null)
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelectedIds((prev) => (prev.size === quotedTools.length ? new Set() : new Set(quotedTools.map((t) => t.id))))
  }

  // Sólo se muestra a partir de que hay algo real que reportar — por_cotizar
  // no tiene un hito propio todavía (per Figma: ese estado no muestra este
  // bloque en absoluto, el slot lo ocupa "Solicitante").
  const lastUpdate: { label: string; value: string | null } | null =
    stage === 'pendiente_aprobacion'
      ? { label: 'Oferta recibida', value: ofertaEnviadaAt }
      : stage === 'por_facturar'
        ? { label: 'Aprobaste tu oferta', value: aprobadoClienteAt }
        : stage === 'comprada'
          ? { label: 'Cupón generado', value: cuponesGenerados.at(-1)?.fecha ?? null }
          : stage === 'vencida'
            ? { label: 'Venció', value: buyback?.vencidoAt ?? null }
            : stage === 'cancelada'
              ? { label: 'Cancelado', value: null }
              : null

  return (
    // `.dash-theme` scopes every token utility below (bg-layout-level-1,
    // text-content-secondary, border-stroke-default…) to the dark hex values
    // from docs/design-system.md — see index.css. This div IS Dash's page
    // root: no shared <Layout>/<Sidebar> from App.tsx, own full-height flex
    // shell with its own sidebar + top bar. Sidebar collapsed to the icon
    // rail here, per the Figma detail-screen reference (the list screen
    // keeps it expanded — see DashBbxList.tsx).
    <div className="dash-theme flex h-screen w-screen bg-layout-background">
      <DashSidebar collapsed />
      <div className="flex flex-1 min-w-0 flex-col">
        <DashTopBar breadcrumbId={displayId} />
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="flex w-full flex-col items-start gap-[16px] p-[24px]">
            {/* Header — sin card contenedora (a diferencia de Soga), per
                Figma: título+pill / solicitante arriba, chips / última
                actualización abajo. */}
            <div className="flex w-full flex-col gap-[16px]">
              <div className="flex w-full items-start justify-between gap-[16px]">
                <div className="flex items-center gap-[12px]">
                  <p className="whitespace-nowrap text-[20px] font-bold leading-normal text-content-default">{displayId}</p>
                  <div className={`flex items-center gap-[4px] rounded-[24px] border border-solid ${statusCfg.border} py-[4px] pl-[6px] pr-[8px]`}>
                    <img src={statusCfg.dot} alt="" className="size-[8px]" />
                    <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">{statusCfg.label}</p>
                  </div>
                  {stage === 'vencida' && buyback?.vencidoSubtipo && (
                    <p className="whitespace-nowrap text-[12px] leading-normal text-content-secondary">
                      {VENCIDO_SUBTIPO_CLIENT_LABEL[buyback.vencidoSubtipo]}
                    </p>
                  )}
                </div>

                {/* Quién en tu organización pidió este BBX — sí es de cara al
                    cliente (es su propio colega), a diferencia de lo que
                    asumía una versión anterior de este archivo. */}
                <div className="flex w-[200px] shrink-0 flex-col items-start gap-[4px]">
                  <p className="w-full whitespace-nowrap text-[10px] uppercase leading-normal tracking-[1px] text-content-secondary">
                    Solicitante
                  </p>
                  <div className="flex items-center gap-[4px]">
                    <img src={iconPerson} alt="" className="size-[14px] opacity-70" />
                    <p className="truncate text-[14px] leading-normal text-content-default">{buyback?.solicitadoPor ?? '—'}</p>
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-[16px]">
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
                    <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">{buyback?.creacion ?? '—'}</p>
                  </Chip>
                  {(stage === 'pendiente_aprobacion' || stage === 'vencida') && clienteVencimiento && (
                    <Chip>
                      <img src={SEMAFORO_DOT[clienteVencimiento.semaforo]} alt="" className="size-[8px] shrink-0" />
                      <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-secondary">
                        {stage === 'vencida' ? 'Venció:' : 'Tienes hasta:'}
                      </p>
                      <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">{clienteVencimiento.fecha}</p>
                    </Chip>
                  )}
                  {/* Decorativo — sin backend de referencias en este mock,
                      mismo criterio que "Agregar responsables" en Soga. */}
                  <button
                    type="button"
                    className="flex h-[24px] shrink-0 items-center gap-[8px] rounded-[4px] border border-solid border-[#1c323b] py-[8px] pl-[4px] pr-[8px]"
                  >
                    <img src={iconPlusCircle} alt="" className="size-[14px]" />
                    <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">Agregar referencia interna</p>
                  </button>
                </div>

                {lastUpdate && (
                  <div className="flex shrink-0 items-center gap-[12px]">
                    <div className="flex items-center gap-[6px]">
                      <img src={iconTime} alt="" className="size-[14px] shrink-0 opacity-70" />
                      <p className="whitespace-nowrap text-[12px] leading-normal text-content-secondary">{lastUpdate.label}:</p>
                      <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">{lastUpdate.value ?? '—'}</p>
                    </div>
                    <button type="button" onClick={() => setHistorialOpen(true)} className="whitespace-nowrap text-[12px] font-medium leading-normal text-primary-default">
                      Ver historial
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Body per stage */}
            {stage === 'por_cotizar' && (
              <>
                <DashFeedbackAlert
                  label="Recibirás tu oferta en un plazo estimado de"
                  value="24 horas desde tu solicitud."
                />
                {/* Misma tabla que Soga (components/ToolTable.tsx) — mismo
                    hover (spec/"Ver detalle"/miniaturas), mismos tags de
                    condición, sólo sin columna "Estado" (nada decidido
                    todavía) y con "Oferta: En preparación" en su lugar. */}
                <ToolTable
                  rows={tools}
                  onViewDetail={setToolDetailId}
                  onViewPhoto={(id, index) => setImageViewer({ toolId: id, index })}
                  showEstado={false}
                  showCheckbox
                  priceHeader="Oferta (Impuestos incluidos)"
                  renderPrice={(row) => (row.price != null ? formatUSD(row.price) : 'En preparación')}
                />
              </>
            )}

            {stage === 'pendiente_aprobacion' && (
              <>
                {vencido && <DashFeedbackAlert tone="danger" label="Esta oferta ya venció —" value="no puedes seguir decidiendo." />}
                {/* Métrica de progreso — aprobadas/rechazadas/pendientes +
                    total aprobado, se actualiza en vivo con cada decisión
                    (doc "BBX · Dash" §1). Mismo patrón que el metric-card row
                    de Soga para esta misma etapa (QuoteDetail.tsx). */}
                <div className="flex h-[66px] w-full items-center rounded-[8px] border border-solid border-stroke-default bg-layout-level-1">
                  <div className="flex flex-1 flex-col items-start gap-[4px] border-r border-solid border-stroke-default px-[16px]">
                    <p className="text-[10px] uppercase leading-normal text-content-secondary">Aprobadas</p>
                    <p className="text-[16px] font-bold leading-normal text-success-fg">{approvedByClient.length}</p>
                  </div>
                  <div className="flex flex-1 flex-col items-start gap-[4px] border-r border-solid border-stroke-default px-[16px]">
                    <p className="text-[10px] uppercase leading-normal text-content-secondary">Rechazadas</p>
                    <p className="text-[16px] font-bold leading-normal text-danger-fg">{rejectedByClient.length}</p>
                  </div>
                  <div className="flex flex-1 flex-col items-start gap-[4px] border-r border-solid border-stroke-default px-[16px]">
                    <p className="text-[10px] uppercase leading-normal text-content-secondary">Pendientes</p>
                    <p className="text-[16px] font-bold leading-normal text-informative-fg">{pendingDecision.length}</p>
                  </div>
                  <div className="flex flex-1 flex-col items-start gap-[4px] px-[16px]">
                    <p className="text-[10px] uppercase leading-normal text-content-secondary">Total aprobado</p>
                    <p className="text-[16px] font-bold leading-normal text-content-default">{formatUSD(approvedByClient.reduce((sum, t) => sum + (t.price ?? 0), 0))}</p>
                  </div>
                </div>

                {/* Paso de confirmación explícito — complemento del lado
                    cliente de "Enviar buyback" en Soga (OrderSummaryModal):
                    Martín revisa un resumen antes de mandar la oferta a
                    `pendiente_aprobacion`; el cliente revisa un resumen
                    simétrico (ConfirmDecisionModal) antes de mandar su
                    decisión a `aprobado`/`aprobado-parcial`/`rechazado`. El
                    cliente sigue pudiendo cambiar cualquier decisión (tabla
                    de abajo queda igual de editable) hasta que confirma en
                    el modal — decidir el último ítem ya NO avanza el BBX
                    solo. */}
                {!vencido && allDecisionsMade(state) && (
                  <div className="flex w-full items-center gap-[16px] rounded-[8px] border border-solid border-primary-default bg-layout-level-1 px-[16px] py-[12px]">
                    <div className="flex flex-1 flex-col gap-[2px]">
                      <p className="text-[12px] font-medium leading-normal text-content-default">Ya decidiste sobre todas las herramientas.</p>
                      <p className="text-[11px] leading-normal text-content-secondary">
                        Puedes seguir cambiando tu decisión hasta que confirmes — después de confirmar, el BBX pasa a facturación.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmDecisionOpen(true)}
                      className="flex h-[36px] shrink-0 items-center gap-[8px] rounded-[8px] bg-primary-default px-[16px] text-primary-fg"
                    >
                      <p className="whitespace-nowrap text-[12px] font-medium leading-normal">Confirmar decisión</p>
                    </button>
                  </div>
                )}

                {/* Misma tabla que Soga (components/ToolTable.tsx) — la
                    columna "Estado" ya deriva Aprobado/Rechazado/Pendiente
                    de `clientDecision` sola (mismo componente que Soga usa
                    para mostrar esa misma decisión, sólo lectura ahí); acá
                    se le agrega la columna "Acciones" con los botones, y
                    checkbox real (no decorativo) para aprobar/rechazar en
                    bloque — doc "BBX · Dash" §1. */}
                <ToolTable
                  rows={quotedTools}
                  onViewDetail={setToolDetailId}
                  onViewPhoto={(id, index) => setImageViewer({ toolId: id, index })}
                  priceHeader="Oferta"
                  actionsHeader="Acciones"
                  selection={canDecide ? { selectedIds, onToggleRow: toggleRow, onToggleAll: toggleAll } : undefined}
                  renderActions={(row) =>
                    canDecide ? (
                      <div className="flex items-center gap-[8px]">
                        <button
                          type="button"
                          onClick={() => approve(row.id)}
                          disabled={row.clientDecision === 'aprobado'}
                          className="flex h-[28px] items-center gap-[4px] rounded-[6px] bg-success-fg px-[10px] text-white disabled:opacity-40"
                        >
                          <img src={iconCheck} alt="" className="size-[10px] brightness-0 invert" />
                          <p className="whitespace-nowrap text-[11px] font-medium leading-normal">Aprobar</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectTargetIds([row.id])}
                          disabled={row.clientDecision === 'rechazado'}
                          className="flex h-[28px] items-center gap-[4px] rounded-[6px] bg-danger-bg px-[10px] text-danger-fg disabled:opacity-40"
                        >
                          <img src={iconXCircle} alt="" className="size-[10px]" />
                          <p className="whitespace-nowrap text-[11px] font-medium leading-normal">Rechazar</p>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] leading-normal text-content-secondary">—</span>
                    )
                  }
                />

                {/* Herramientas que Bord no ofertó — en lenguaje de cliente, con la
                    razón (brief: "el motivo por el que Bord no ofertó una
                    herramienta, con su razón, en lenguaje de cliente").
                    DECISIÓN ABIERTA (doc "BBX · Dash" discrepancia #7):
                    "pendiente tuyo previo" sobre si estos motivos deben
                    verse en la vista de tabla — hoy se muestran en este
                    bloque aparte, no dentro de la tabla principal; no se
                    asume que integrarlos a la tabla sea lo pedido. */}
                {rejectedByBord.length > 0 && (
                  <div className="flex w-full flex-col gap-[8px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 p-[16px]">
                    <p className="text-[12px] font-bold leading-normal text-content-default">
                      Herramientas que no incluimos en esta oferta ({rejectedByBord.length})
                    </p>
                    {rejectedByBord.map((tool) => (
                      <div key={tool.id} className="flex items-center justify-between text-[12px] leading-normal">
                        <span className="text-content-default">
                          {tool.model} <span className="text-content-secondary">{tool.serial}</span>
                        </span>
                        <span className="text-content-secondary">{tool.rejectReason}</span>
                      </div>
                    ))}
                  </div>
                )}

                {canDecide && selectedIds.size > 0 && (
                  <DashApprovalBulkBar
                    count={selectedIds.size}
                    onApprove={() => approveMany([...selectedIds])}
                    onReject={() => setRejectTargetIds([...selectedIds])}
                    onClose={clearSelection}
                  />
                )}
              </>
            )}

            {stage === 'por_facturar' && (
              <>
                <div className="flex h-[56px] w-full items-center gap-[12px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 px-[16px]">
                  <p className="text-[12px] leading-normal text-content-secondary">Total aprobado</p>
                  <p className="text-[16px] font-bold leading-normal text-content-default">{formatUSD(approvedAmount)}</p>
                  {/* "Métrica de progreso: facturas por país en cada sub-estado
                      (ej. 2 OK · 1 en revisión)" — doc "BBX · Dash" §2. */}
                  <p className="ml-auto text-[12px] leading-normal text-content-secondary">
                    {paisesFacturaBlocks.filter((p) => p.factura.factura === 'ok' || p.cupon.estado === 'generado').length} OK ·{' '}
                    {paisesFacturaBlocks.filter((p) => p.factura.factura === 'en_revision').length} en revisión ·{' '}
                    {paisesFacturaBlocks.filter((p) => p.factura.factura === 'pendiente').length} pendiente
                  </p>
                </div>
                <DashFeedbackAlert
                  label="Sube la factura de cada país a la entidad de Bord indicada —"
                  value="una vez enviada queda bloqueada hasta que Bord la revise."
                />
                {/* DECISIÓN ABIERTA (doc "BBX · Dash" discrepancia #4): un
                    mismo BBX puede tener países ya vendidos (cupón generado)
                    mientras otros siguen facturándose — hoy el BBX entero
                    sigue viviendo en el tab "Factura" hasta que TODOS sus
                    países tengan cupón (`comprado` es un estado de cabecera
                    único, ver bbxStore.ts). No se decide acá si debería
                    aparecer también en "Vendido" mientras tanto, ni con qué
                    subtotales — se deja el comportamiento actual (un solo
                    tab a la vez) sin inventar el partido.
                    DECISIÓN ABIERTA (discrepancia #5): falta el indicador
                    "factura OK · cupón pendiente" vs "cupón generado" como
                    conceptos separados de cara al cliente — hoy
                    ClientInvoiceCountryPanel ya distingue esto por bloque de
                    país (ver su bloque "Cupón BBC generado" condicional),
                    pero no hay un resumen a nivel de BBX que lo agregue. */}
                <ClientInvoiceCountryPanel
                  paises={paisesFacturaBlocks}
                  onSubmit={(pais, archivoNombre) => bbxActions.submitFactura(bbKey, pais, archivoNombre)}
                />
              </>
            )}

            {stage === 'comprada' && (
              <div className="flex w-full flex-col gap-[12px]">
                <div className="flex h-[56px] w-full items-center gap-[12px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 px-[16px]">
                  <p className="text-[12px] leading-normal text-content-secondary">Herramientas compradas</p>
                  <p className="text-[16px] font-bold leading-normal text-content-default">{pluralizeTools(soldTools.length)}</p>
                </div>
                {/* Datos del cupón per doc "BBX · Dash" §3: valor, vigencia 1
                    año, restricciones, y el consecutivo del BBX (no sólo el
                    del cupón) como referencia — más la bandera del país de
                    origen + sugerencia de uso local (§10.3). El saldo por
                    generar es de Comercial/Martín, no se muestra acá (§10.2,
                    decisión 20; ver `approvedAmountFor`/`saldoPorGenerarFor`
                    en bbxStore.ts, usadas sólo del lado Soga). */}
                {cuponesGenerados.map((c) => (
                  <div key={c.consecutivo} className="flex flex-col gap-[8px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 p-[16px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[6px]">
                        <img src={LOT_COUNTRY_FLAGS[c.pais]} alt="" className="size-[16px] shrink-0 rounded-full" />
                        <p className="text-[14px] font-bold capitalize leading-normal text-content-default">Cupón BBC · {c.pais}</p>
                      </div>
                      <p className="text-[14px] font-bold leading-normal text-content-default">{formatUSD(c.montoUsd)}</p>
                    </div>
                    <p className="text-[12px] leading-normal text-content-secondary">
                      {c.consecutivo} · {c.fecha} · Referencia {displayId}
                    </p>
                    <p className="text-[11px] leading-normal text-content-secondary">
                      Vigencia: 1 año desde la emisión. Válido sólo en órdenes del marketplace, no combinable con otro cupón.
                      Úsalo en {c.pais} para aprovechar mejor tu compra.
                    </p>
                    <div className="flex flex-col gap-[4px] rounded-[8px] bg-layout-level-2 p-[8px]">
                      {soldTools
                        .filter((t) => t.country.toLowerCase() === c.pais)
                        .map((t) => (
                          <div key={t.serial} className="flex items-center justify-between text-[12px] leading-normal">
                            <span className="text-content-secondary">
                              {t.model} <span className="text-content-default">{t.serial}</span>
                            </span>
                            <span className="whitespace-nowrap rounded-[12px] bg-success-bg px-[8px] py-[2px] text-[11px] leading-normal text-success-fg">
                              Vendido
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
                {/* DECISIÓN ABIERTA (doc "BBX · Dash" discrepancia #6): dónde
                    vive el cupón BBC en Dash frente a los cupones comerciales
                    del módulo de empresas (UC6/D6) — pendiente de diseño, no
                    se asume que esta card sea la ubicación final. */}
              </div>
            )}

            {stage === 'vencida' && (
              <>
                <DashFeedbackAlert
                  tone="danger"
                  label="Esta oferta venció."
                  value={buyback?.vencidoSubtipo ? VENCIDO_SUBTIPO_CLIENT_LABEL[buyback.vencidoSubtipo] : 'Ya no se puede gestionar.'}
                />
                {/* DECISIÓN ABIERTA (doc "BBX · Dash" discrepancia #8): no
                    está documentado si el cliente puede reintentar tras
                    vencer. Asumible: crear un BBX nuevo desde Inventario —
                    no se agrega un botón "reintentar" acá hasta confirmar,
                    para no inventar una acción que hoy no existe. */}
              </>
            )}

            {stage === 'rechazada' && (
              <>
                {/* §5 "Cancelado": "el BBX con cada herramienta en Rechazado
                    y el motivo que registró... Read-only." — antes esta
                    etapa sólo mostraba un banner genérico; ahora reusa la
                    misma tabla, sin acciones ni checkbox (nada que hacer). */}
                <DashFeedbackAlert tone="danger" label="Rechazaste todas las herramientas de este buyback." value="Sólo consulta." />
                <ToolTable rows={tools} onViewDetail={setToolDetailId} onViewPhoto={(id, index) => setImageViewer({ toolId: id, index })} />
              </>
            )}

            {stage === 'cancelada' && (
              // DECISIÓN ABIERTA (doc "BBX · Dash" discrepancia #3):
              // "Cancelado" no es un estado real del sistema hoy — sólo
              // mapea a `Rechazado` (rechazaste todo). Este estado
              // (`cancelado`) es resultado del flujo interactivo de Soga
              // (BBX cancelado en `por_cotizar` con 0 herramientas
              // cotizadas) y no tiene bandera de cliente definida en
              // ningún doc — se deja el banner genérico anterior sin
              // inventarle una tabla que el doc no pide para este caso.
              <DashFeedbackAlert tone="danger" label="Este buyback ya no está activo." value="Si tienes dudas, contacta a tu ejecutivo de cuenta." />
            )}
          </div>
        </main>
      </div>

      {historialOpen && <HistorialModal entries={historialEstados} onClose={() => setHistorialOpen(false)} />}

      {rejectTargetIds && (
        <ClientRejectReasonModal
          count={rejectTargetIds.length}
          model={rejectTargetIds.length === 1 ? rejectTargets[0]?.model : undefined}
          onCancel={() => setRejectTargetIds(null)}
          onConfirm={confirmReject}
        />
      )}

      {confirmDecisionOpen && (
        <ConfirmDecisionModal
          buybackId={displayId}
          approvedCount={approvedByClient.length}
          rejectedCount={rejectedByClient.length}
          approvedAmount={approvedByClient.reduce((sum, t) => sum + (t.price ?? 0), 0)}
          onCancel={() => setConfirmDecisionOpen(false)}
          onConfirm={() => {
            bbxActions.confirmDecisions(bbKey)
            setConfirmDecisionOpen(false)
          }}
        />
      )}

      {imageViewer && imageViewerTool && (
        <ImageViewerModal
          photos={Array.from({ length: TOOL_PHOTO_COUNT }, () => toolCoverPhoto)}
          initialIndex={imageViewer.index}
          onClose={() => setImageViewer(null)}
        />
      )}

      {/* DECISIÓN ABIERTA (doc "BBX · Dash" discrepancia #1): V2.0 §6 dice
          que el cliente SÍ puede descargar la última inspección desde Dash
          — esto contradice la decisión previa de que el cliente no debía
          ver última inspección, DSN ni pricing interno. Este drawer es
          literalmente el de Soga ("Interna de la herramienta", con DSN/SKU/
          ubicación de bodega) reusado tal cual — ya trae el botón
          "Descargar inspección" que §6 pide, pero también expone lo que la
          decisión previa quería ocultar. No se resuelve acá cuál manda; se
          deja el mismo drawer de Soga sin diseñar una versión propia para
          Dash hasta que se confirme qué campos quedan. */}
      {toolDetail && (
        <ToolDetailDrawer
          model={toolDetail.model}
          serial={toolDetail.serial}
          specs={toolDetail.spec.split(', ')}
          ofertaHistorial={toolDetail.ofertaHistorial}
          onClose={() => setToolDetailId(null)}
        />
      )}
    </div>
  )
}
