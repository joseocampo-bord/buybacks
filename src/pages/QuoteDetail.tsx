import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import DetailTopBar from '../components/DetailTopBar'
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

type Grade = 'A' | 'B' | 'C' | 'D' | 'N'

const GRADE_STYLES: Record<Grade, string> = {
  A: 'bg-success-fg text-white',
  B: 'bg-informative-fg text-white',
  C: 'bg-warning-fg text-white',
  D: 'bg-danger-fg text-white',
  N: 'bg-content-secondary text-white',
}

type DetailTag = { label: string; tone: 'success' | 'danger' }

type ManagementStatus = 'pending' | 'quoted' | 'rejected'

// Danger tags always render on their own line (with the red x-circle icon),
// success tags always on their own line (green check-circle) — never mixed
// on the same line. The danger line is the always-visible default; the
// success line only needs a hover reveal when a danger line exists above it
// (otherwise there's nothing to hide it behind, so it just becomes default).
const VISIBLE_TAGS_PER_LINE = 2

function splitTags(tags: DetailTag[]) {
  const danger = tags.filter((t) => t.tone === 'danger')
  const success = tags.filter((t) => t.tone === 'success')
  return {
    danger: danger.slice(0, VISIBLE_TAGS_PER_LINE),
    extraDangerTags: danger.slice(VISIBLE_TAGS_PER_LINE),
    success: success.slice(0, VISIBLE_TAGS_PER_LINE),
    extraSuccessTags: success.slice(VISIBLE_TAGS_PER_LINE),
  }
}

// Small "ⓘ" info icon with a hover tooltip explaining a value — same pattern
// as the "Total del lote" breakdown and the extra-tags badges.
function InfoTooltip({ message }: { message: string }) {
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

// "+N" badge for tags hidden past the visible cap — hovering it reveals the
// rest in a tooltip, same pattern as the "Total del lote" country breakdown.
function ExtraTagsBadge({ tags, tone }: { tags: DetailTag[]; tone: 'danger' | 'success' }) {
  const [open, setOpen] = useState(false)
  if (tags.length === 0) return null

  const toneClass = tone === 'danger' ? 'bg-danger-bg text-danger-fg' : 'bg-success-bg text-success-fg'

  return (
    <div className="relative flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span className={`whitespace-nowrap rounded-[12px] px-[8px] py-[2px] text-[10px] leading-normal ${toneClass}`}>
        +{tags.length}
      </span>
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

// Every tool always has exactly 9 photos (a fixed business rule, not mock
// variance) — reused as the same generic stock laptop photo the Figma source
// itself uses for every tool.
const TOOL_PHOTO_COUNT = 9

const COUNTRY_FLAGS: Record<string, string> = {
  Mexico: flagMexico,
  Colombia: flagColombia,
  Argentina: flagArgentina,
  Turkey: flagTurkey,
  Venezuela: flagVenezuela,
}

// Extra fields only revealed when a row expands on hover — see the
// "31778:776713" Figma reference (a hover/expanded state of this same table,
// not a separate screen).
type ToolRow = {
  id: string
  model: string
  spec: string
  serial: string
  grade: Grade
  tags: DetailTag[]
  comment: string
  lastBuyback: string
  country: string
  status: ManagementStatus
  price: number | null
  rejectReason: string | null
}

// Tags use real accessory/component vocabulary from a trade-in inspection
// checklist (what's included/working vs. missing/faulty) — not vague
// adjectives like "Rayones"/"Golpe"/"Limpio"/"Sin novedades". Varied and
// non-repetitive across rows rather than reusing the same 2-3 terms.
const INITIAL_TOOL_ROWS: ToolRow[] = [
  { id: '1', model: 'MacBook Pro 16"', spec: 'M3 Pro, 18GB, 512GB SSD', serial: '98F4829K93-24', grade: 'D', tags: [{ label: 'Cargador', tone: 'danger' }, { label: 'Caja original', tone: 'danger' }, { label: 'Stickers', tone: 'danger' }, { label: 'Táctil', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Enciende', tone: 'success' }, { label: 'Cámara', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$189.00', country: 'Mexico', status: 'pending', price: null, rejectReason: null },
  { id: '2', model: 'MacBook Air 13"', spec: 'M2, 8GB, 256GB SSD', serial: '77H2931L44-19', grade: 'A', tags: [{ label: 'Batería', tone: 'success' }, { label: 'Trackpad', tone: 'success' }], comment: 'Cliente reportó batería en buen estado', lastBuyback: '$210.00', country: 'Colombia', status: 'pending', price: null, rejectReason: null },
  { id: '3', model: 'MacBook Pro 14"', spec: 'M3, 16GB, 1TB SSD', serial: '65D5820M12-22', grade: 'B', tags: [{ label: 'Cable', tone: 'danger' }, { label: 'Bocinas', tone: 'danger' }, { label: 'Caja original', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$175.00', country: 'Argentina', status: 'pending', price: null, rejectReason: null },
  { id: '4', model: 'MacBook Pro 16"', spec: 'M2 Max, 32GB, 1TB SSD', serial: '43K7719P08-21', grade: 'C', tags: [{ label: 'Pantalla', tone: 'danger' }, { label: 'Batería', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Puerto USB-C', tone: 'danger' }, { label: 'WiFi', tone: 'danger' }], comment: 'Pantalla con líneas visibles', lastBuyback: '$140.00', country: 'Turkey', status: 'pending', price: null, rejectReason: null },
  { id: '5', model: 'MacBook Air 15"', spec: 'M3, 16GB, 512GB SSD', serial: '29B4456Q77-23', grade: 'B', tags: [{ label: 'Cargador', tone: 'success' }, { label: 'Touch ID', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$198.00', country: 'Venezuela', status: 'pending', price: null, rejectReason: null },
  { id: '6', model: 'MacBook Pro 13"', spec: 'M1, 8GB, 256GB SSD', serial: '91C2287R33-20', grade: 'N', tags: [{ label: 'Caja original', tone: 'success' }, { label: 'Micrófono', tone: 'success' }], comment: 'Equipo con más de 5 años de uso', lastBuyback: '$0.00', country: 'Mexico', status: 'pending', price: null, rejectReason: null },
  { id: '7', model: 'MacBook Pro 16"', spec: 'M3 Max, 36GB, 2TB SSD', serial: '58F9012S65-24', grade: 'A', tags: [{ label: 'Teclado', tone: 'success' }, { label: 'Carcasa', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$225.00', country: 'Colombia', status: 'pending', price: null, rejectReason: null },
]

type BuybackStatus = 'por-cotizar' | 'pendiente-aprobacion' | 'cancelado'

const STATUS_CONFIG: Record<BuybackStatus, { label: string; border: string; text: string; dot: string }> = {
  'por-cotizar': { label: 'Por cotizar', border: 'border-warning-fg', text: 'text-content-default', dot: statusDotWarning },
  'pendiente-aprobacion': { label: 'Pendiente de aprobación', border: 'border-informative-fg', text: 'text-content-default', dot: statusDotInformative },
  cancelado: { label: 'Cancelado', border: 'border-danger-fg', text: 'text-content-default', dot: statusDotDanger },
}

type SlaType = 'regular' | 'cto'

const SLA_CONFIG: Record<SlaType, { label: string; hours: number }> = {
  regular: { label: 'Regular – 24 horas', hours: 24 },
  cto: { label: 'CTO – 72 horas', hours: 72 },
}

function formatUSD(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
}

function pluralizeTools(count: number) {
  return `${count} Herramienta${count === 1 ? '' : 's'}`
}

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

export default function QuoteDetail() {
  const { id } = useParams()
  const displayId = id ?? 'BB° 1234'

  const [tools, setTools] = useState<ToolRow[]>(INITIAL_TOOL_ROWS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({})
  const [bulkPriceDraft, setBulkPriceDraft] = useState('')
  const [imageViewer, setImageViewer] = useState<{ toolId: string; index: number } | null>(null)
  const [toolDetailId, setToolDetailId] = useState<string | null>(null)
  const [rejectTargetIds, setRejectTargetIds] = useState<string[] | null>(null)
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [buybackStatus, setBuybackStatus] = useState<BuybackStatus>('por-cotizar')
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
  const totalByCountry = Object.entries(
    quotedTools.reduce<Record<string, number>>((acc, t) => {
      acc[t.country] = (acc[t.country] ?? 0) + (t.price ?? 0)
      return acc
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([country, amount]) => ({ country, amount: formatUSD(amount) }))
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
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'quoted', price: value, rejectReason: null } : t)))
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
    setTools((prev) => prev.map((t) => (selectedIds.has(t.id) ? { ...t, status: 'quoted', price: value, rejectReason: null } : t)))
    clearSelection()
  }

  function confirmReject(reason: string) {
    if (!rejectTargetIds) return
    setTools((prev) =>
      prev.map((t) => (rejectTargetIds.includes(t.id) ? { ...t, status: 'rejected', rejectReason: reason, price: null } : t)),
    )
    if (rejectTargetIds.length > 1) clearSelection()
    setRejectTargetIds(null)
    setEditingRowId(null)
  }

  function confirmOrderSummary() {
    setOrderSummaryOpen(false)
    setBuybackStatus('pendiente-aprobacion')
    setToast({
      title: 'Cotización enviada con éxito',
      message: 'Informamos al cliente mediante un correo electrónico y a través de Dash.',
    })
  }

  function confirmCancel() {
    setCancelModalOpen(false)
    setBuybackStatus('cancelado')
    setToast({ title: 'Buyback cancelado', message: 'Informamos al cliente mediante un correo electrónico y a través de Dash.' })
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

  return (
    <div className="flex flex-col">
      <DetailTopBar breadcrumbId={displayId} />
      <div className="flex w-full flex-col items-start gap-[16px] p-[24px]">
        {/* manage-quote-header */}
        <div className="flex w-full flex-col gap-[10px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 py-[12px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.04)]">
          <div className="flex w-full items-center justify-between px-[12px]">
            <div className="flex flex-col items-start gap-[8px]">
              <div className="flex items-center gap-[12px]">
                <p className="whitespace-nowrap text-[20px] font-bold leading-normal text-content-default">Buyback N°9021</p>
                <div className={`flex items-center gap-[4px] rounded-[24px] border border-solid ${statusConfig.border} py-[4px] pl-[6px] pr-[8px]`}>
                  <img src={statusConfig.dot} alt="" className="size-[8px]" />
                  <p className={`whitespace-nowrap text-[12px] leading-normal ${statusConfig.text}`}>{statusConfig.label}</p>
                  <div className="h-full w-px shrink-0 bg-stroke-default" />
                  <img src={iconChevronDown} alt="" className="size-[12px] opacity-60" />
                </div>
              </div>

              <div className="flex items-center gap-[8px]">
                <Chip>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-secondary">País:</p>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">Varios</p>
                  <div className="flex items-center">
                    <img src={flagArgentina} alt="" className="size-[12px] shrink-0 rounded-full" style={{ marginRight: -4 }} />
                    <img src={flagColombia} alt="" className="size-[12px] shrink-0 rounded-full" style={{ marginRight: -4 }} />
                    <img src={flagMexico} alt="" className="size-[12px] shrink-0 rounded-full" />
                  </div>
                </Chip>
                <Chip>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-secondary">Creación:</p>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">12/03/2026</p>
                </Chip>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSlaMenuOpen((v) => !v)}
                    className={`flex shrink-0 items-center gap-[4px] rounded-[4px] border border-solid bg-layout-level-2 px-[8px] py-[4px] ${
                      slaType === 'cto' ? 'border-warning-fg' : 'border-informative-fg'
                    }`}
                  >
                    <p className={`whitespace-nowrap text-[12px] font-medium leading-normal ${slaType === 'cto' ? 'text-warning-fg' : 'text-informative-fg'}`}>
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
                  <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">Description</p>
                  <div className="flex items-center gap-[4px] rounded-[24px] border border-solid border-informative-fg px-[6px] py-[1px]">
                    <img src={statusDotInformative} alt="" className="size-[8px]" />
                    <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">00/00/0000 - 00:00 PM</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
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
                  <p className="whitespace-nowrap text-[14px] leading-normal text-content-default">Playtoy</p>
                  <img src={iconExternalLink} alt="" className="size-[12px] opacity-60" />
                </div>
              </div>
            </div>

            <div className="flex w-[200px] flex-col items-start gap-[4px]">
              <p className="w-[145px] whitespace-nowrap text-[10px] uppercase leading-normal tracking-[1px] text-content-secondary">Solicitante</p>
              <div className="flex items-center gap-[4px]">
                <img src={iconPerson} alt="" className="size-[14px] opacity-60" />
                <p className="truncate text-[14px] leading-normal text-content-default">Vicente</p>
              </div>
            </div>

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
            (not edge-to-edge, not tinted green when disabled) — per reference. */}
        <div className="flex h-[66px] w-full items-center gap-[12px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 pr-[12px]">
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
              <p className="whitespace-nowrap text-[14px] font-medium leading-normal">
                {buybackStatus === 'pendiente-aprobacion' ? 'Buyback enviado' : 'Enviar buyback'}
              </p>
            </button>
          )}
        </div>

        {/* Filter + tab row */}
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

        {/* Table */}
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
              <col className="w-[44px]" />
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
                <th className="px-[12px] py-[12px] text-[12px] font-bold leading-normal text-content-default">Modelo</th>
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
                    <td className="px-[12px] py-[16px]">
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
      </div>

      {selectedIds.size > 0 && (
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
    </div>
  )
}
