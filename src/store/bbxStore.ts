// Shared BBX state — the single source of truth Dash (cliente) and Soga
// (interna) both read and write, keyed by bbId. Per the brief: "Dash y Soga
// leen y escriben sobre el mismo modelo de BBX. No dupliques el modelo de
// estados ni el de ítems". Everything a client action can change and Martín
// needs to see live (or vice versa) lives here; each page keeps its own
// UI-only state locally (which modal is open, a row's in-progress price
// draft, etc. — see the comment on `readOnly`-adjacent local state in
// QuoteDetail.tsx and BbxDashDetail.tsx).
//
// Dash and Soga are two SEPARATE browser tabs (/dash/bbx/:id and
// /soga/bbx/:id), each its own JS runtime — no shared memory between them.
// No backend/websocket in this harness (out of scope per the brief), so the
// source of truth is `localStorage` (same-origin, both tabs see the same
// record) and a `BroadcastChannel` (+ `storage`-event fallback) carries the
// "something changed" signal so the other tab's mounted page re-renders
// without a manual refresh. See "Persistencia + cross-tab sync" below for
// the actual read/write/notify plumbing.

import { useSyncExternalStore } from 'react'
import {
  entidadBordPorPais,
  findBuyback,
  type Buyback,
  type ClienteVencimientoSemaforo,
  type CountryFlag,
  type CuponEstado,
  type FacturaStatus,
} from '../data/buybacks'
import { formatDueDate, formatNowTimestamp } from '../lib/format'

// --- Tool row model (moved from QuoteDetail.tsx — both perspectives render
// the same per-tool records, just different columns/actions on them) --------

export type Grade = 'A' | 'B' | 'C' | 'D' | 'N'
export type DetailTag = { label: string; tone: 'success' | 'danger' }
// 'vendido' = item's coupon was generated (moved to Bord-owned stock).
export type ManagementStatus = 'pending' | 'quoted' | 'rejected' | 'vendido'

// Decisión del CLIENTE sobre un ítem ya ofertado (Dash, `pendiente_aprobacion`).
export type ClientDecision = 'pendiente' | 'aprobado' | 'rechazado'

// Catálogo cerrado de motivos que el CLIENTE puede elegir al rechazar un ítem
// en Dash — distinto de REJECT_REASONS (RejectReasonModal.tsx), que son los
// motivos de BORD para excluir una herramienta ANTES de enviar la oferta.
export type ClientRejectReason = 'precio' | 'tiempo_respuesta' | 'no_aprobado_interno' | 'otro'

export const CLIENT_REJECT_REASONS: ClientRejectReason[] = ['precio', 'tiempo_respuesta', 'no_aprobado_interno', 'otro']

export const CLIENT_REJECT_REASON_LABEL: Record<ClientRejectReason, string> = {
  precio: 'Precio',
  tiempo_respuesta: 'Tiempo estimado de respuesta',
  no_aprobado_interno: 'No aprobado internamente',
  otro: 'Otro',
}

export type ToolRow = {
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
  clientDecision: ClientDecision | null
  clientRejectReason: ClientRejectReason | null
  ofertaHistorial: { fecha: string; montoUsd: number }[] | null
}

// --- Mock lotes per starting stage (moved from QuoteDetail.tsx verbatim) ----

const INITIAL_TOOL_ROWS: ToolRow[] = [
  { id: '1', model: 'MacBook Pro 16"', spec: 'M3 Pro, 18GB, 512GB SSD', serial: '98F4829K93-24', grade: 'D', tags: [{ label: 'Cargador', tone: 'danger' }, { label: 'Caja original', tone: 'danger' }, { label: 'Stickers', tone: 'danger' }, { label: 'Táctil', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Enciende', tone: 'success' }, { label: 'Cámara', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$189.00', country: 'Mexico', status: 'pending', price: null, rejectReason: null, clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '2', model: 'MacBook Air 13"', spec: 'M2, 8GB, 256GB SSD', serial: '77H2931L44-19', grade: 'A', tags: [{ label: 'Batería', tone: 'success' }, { label: 'Trackpad', tone: 'success' }], comment: 'Cliente reportó batería en buen estado', lastBuyback: '$210.00', country: 'Colombia', status: 'pending', price: null, rejectReason: null, clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '3', model: 'MacBook Pro 14"', spec: 'M3, 16GB, 1TB SSD', serial: '65D5820M12-22', grade: 'B', tags: [{ label: 'Cable', tone: 'danger' }, { label: 'Bocinas', tone: 'danger' }, { label: 'Caja original', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$175.00', country: 'Argentina', status: 'pending', price: null, rejectReason: null, clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '4', model: 'MacBook Pro 16"', spec: 'M2 Max, 32GB, 1TB SSD', serial: '43K7719P08-21', grade: 'C', tags: [{ label: 'Pantalla', tone: 'danger' }, { label: 'Batería', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Puerto USB-C', tone: 'danger' }, { label: 'WiFi', tone: 'danger' }], comment: 'Pantalla con líneas visibles', lastBuyback: '$140.00', country: 'Turkey', status: 'pending', price: null, rejectReason: null, clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '5', model: 'MacBook Air 15"', spec: 'M3, 16GB, 512GB SSD', serial: '29B4456Q77-23', grade: 'B', tags: [{ label: 'Cargador', tone: 'success' }, { label: 'Touch ID', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$198.00', country: 'Venezuela', status: 'pending', price: null, rejectReason: null, clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '6', model: 'MacBook Pro 13"', spec: 'M1, 8GB, 256GB SSD', serial: '91C2287R33-20', grade: 'N', tags: [{ label: 'Caja original', tone: 'success' }, { label: 'Micrófono', tone: 'success' }], comment: 'Equipo con más de 5 años de uso', lastBuyback: '$0.00', country: 'Mexico', status: 'pending', price: null, rejectReason: null, clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '7', model: 'MacBook Pro 16"', spec: 'M3 Max, 36GB, 2TB SSD', serial: '58F9012S65-24', grade: 'A', tags: [{ label: 'Teclado', tone: 'success' }, { label: 'Carcasa', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$225.00', country: 'Colombia', status: 'pending', price: null, rejectReason: null, clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
]

const SENT_OFFER_TOOL_ROWS: ToolRow[] = [
  { id: '1', model: 'MacBook Pro 16"', spec: 'M3 Pro, 18GB, 512GB SSD', serial: '98F4829K93-24', grade: 'D', tags: [{ label: 'Cargador', tone: 'danger' }, { label: 'Caja original', tone: 'danger' }, { label: 'Stickers', tone: 'danger' }, { label: 'Táctil', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Enciende', tone: 'success' }, { label: 'Cámara', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$189.00', country: 'Mexico', status: 'quoted', price: 189, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: [{ fecha: '02/03/2026', montoUsd: 175 }] },
  { id: '2', model: 'MacBook Air 13"', spec: 'M2, 8GB, 256GB SSD', serial: '77H2931L44-19', grade: 'A', tags: [{ label: 'Batería', tone: 'success' }, { label: 'Trackpad', tone: 'success' }], comment: 'Cliente reportó batería en buen estado', lastBuyback: '$210.00', country: 'Colombia', status: 'quoted', price: 210, rejectReason: null, clientDecision: 'pendiente', clientRejectReason: null, ofertaHistorial: null },
  { id: '3', model: 'MacBook Pro 14"', spec: 'M3, 16GB, 1TB SSD', serial: '65D5820M12-22', grade: 'B', tags: [{ label: 'Cable', tone: 'danger' }, { label: 'Bocinas', tone: 'danger' }, { label: 'Caja original', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$175.00', country: 'Argentina', status: 'quoted', price: 175, rejectReason: null, clientDecision: 'rechazado', clientRejectReason: 'precio', ofertaHistorial: null },
  { id: '4', model: 'MacBook Pro 16"', spec: 'M2 Max, 32GB, 1TB SSD', serial: '43K7719P08-21', grade: 'C', tags: [{ label: 'Pantalla', tone: 'danger' }, { label: 'Batería', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Puerto USB-C', tone: 'danger' }, { label: 'WiFi', tone: 'danger' }], comment: 'Pantalla con líneas visibles', lastBuyback: '$140.00', country: 'Turkey', status: 'rejected', price: null, rejectReason: 'Pantalla dañada', clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '5', model: 'MacBook Air 15"', spec: 'M3, 16GB, 512GB SSD', serial: '29B4456Q77-23', grade: 'B', tags: [{ label: 'Cargador', tone: 'success' }, { label: 'Touch ID', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$198.00', country: 'Venezuela', status: 'quoted', price: 198, rejectReason: null, clientDecision: 'rechazado', clientRejectReason: 'tiempo_respuesta', ofertaHistorial: null },
  { id: '6', model: 'MacBook Pro 13"', spec: 'M1, 8GB, 256GB SSD', serial: '91C2287R33-20', grade: 'N', tags: [{ label: 'Caja original', tone: 'success' }, { label: 'Micrófono', tone: 'success' }], comment: 'Equipo con más de 5 años de uso', lastBuyback: '$0.00', country: 'Mexico', status: 'rejected', price: null, rejectReason: 'No coincide con la descripción', clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '7', model: 'MacBook Pro 16"', spec: 'M3 Max, 36GB, 2TB SSD', serial: '58F9012S65-24', grade: 'A', tags: [{ label: 'Teclado', tone: 'success' }, { label: 'Carcasa', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$225.00', country: 'Colombia', status: 'quoted', price: 225, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: [{ fecha: '15/01/2026', montoUsd: 210 }, { fecha: '20/11/2025', montoUsd: 195 }] },
]

const APPROVED_TOOL_ROWS: ToolRow[] = [
  { id: '1', model: 'MacBook Pro 16"', spec: 'M3 Pro, 18GB, 512GB SSD', serial: '98F4829K93-24', grade: 'D', tags: [{ label: 'Cargador', tone: 'danger' }, { label: 'Caja original', tone: 'danger' }, { label: 'Stickers', tone: 'danger' }, { label: 'Táctil', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Enciende', tone: 'success' }, { label: 'Cámara', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$189.00', country: 'Mexico', status: 'quoted', price: 189, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
  { id: '2', model: 'MacBook Air 13"', spec: 'M2, 8GB, 256GB SSD', serial: '77H2931L44-19', grade: 'A', tags: [{ label: 'Batería', tone: 'success' }, { label: 'Trackpad', tone: 'success' }], comment: 'Cliente reportó batería en buen estado', lastBuyback: '$210.00', country: 'Colombia', status: 'quoted', price: 210, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
  { id: '3', model: 'MacBook Pro 14"', spec: 'M3, 16GB, 1TB SSD', serial: '65D5820M12-22', grade: 'B', tags: [{ label: 'Cable', tone: 'danger' }, { label: 'Bocinas', tone: 'danger' }, { label: 'Caja original', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$175.00', country: 'Mexico', status: 'quoted', price: 175, rejectReason: null, clientDecision: 'rechazado', clientRejectReason: 'precio', ofertaHistorial: null },
  { id: '4', model: 'MacBook Pro 16"', spec: 'M2 Max, 32GB, 1TB SSD', serial: '43K7719P08-21', grade: 'C', tags: [{ label: 'Pantalla', tone: 'danger' }, { label: 'Batería', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Puerto USB-C', tone: 'danger' }, { label: 'WiFi', tone: 'danger' }], comment: 'Pantalla con líneas visibles', lastBuyback: '$140.00', country: 'Colombia', status: 'rejected', price: null, rejectReason: 'Pantalla dañada', clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '5', model: 'MacBook Air 15"', spec: 'M3, 16GB, 512GB SSD', serial: '29B4456Q77-23', grade: 'B', tags: [{ label: 'Cargador', tone: 'success' }, { label: 'Touch ID', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$198.00', country: 'Venezuela', status: 'quoted', price: 198, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
  { id: '6', model: 'MacBook Pro 13"', spec: 'M1, 8GB, 256GB SSD', serial: '91C2287R33-20', grade: 'N', tags: [{ label: 'Caja original', tone: 'success' }, { label: 'Micrófono', tone: 'success' }], comment: 'Equipo con más de 5 años de uso', lastBuyback: '$0.00', country: 'Mexico', status: 'quoted', price: 165, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
  { id: '7', model: 'MacBook Pro 16"', spec: 'M3 Max, 36GB, 2TB SSD', serial: '58F9012S65-24', grade: 'A', tags: [{ label: 'Teclado', tone: 'success' }, { label: 'Carcasa', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$225.00', country: 'Mexico', status: 'quoted', price: 225, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
]

const SOLD_TOOL_ROWS: ToolRow[] = [
  { id: '1', model: 'MacBook Pro 16"', spec: 'M3 Pro, 18GB, 512GB SSD', serial: '98F4829K93-24', grade: 'D', tags: [{ label: 'Cargador', tone: 'danger' }, { label: 'Caja original', tone: 'danger' }, { label: 'Stickers', tone: 'danger' }, { label: 'Táctil', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Enciende', tone: 'success' }, { label: 'Cámara', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$189.00', country: 'Mexico', status: 'vendido', price: 189, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
  { id: '2', model: 'MacBook Air 13"', spec: 'M2, 8GB, 256GB SSD', serial: '77H2931L44-19', grade: 'A', tags: [{ label: 'Batería', tone: 'success' }, { label: 'Trackpad', tone: 'success' }], comment: 'Cliente reportó batería en buen estado', lastBuyback: '$210.00', country: 'Colombia', status: 'vendido', price: 210, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
  { id: '3', model: 'MacBook Pro 14"', spec: 'M3, 16GB, 1TB SSD', serial: '65D5820M12-22', grade: 'B', tags: [{ label: 'Cable', tone: 'danger' }, { label: 'Bocinas', tone: 'danger' }, { label: 'Caja original', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$175.00', country: 'Argentina', status: 'rejected', price: null, rejectReason: 'No coincide con la descripción', clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '4', model: 'MacBook Pro 16"', spec: 'M2 Max, 32GB, 1TB SSD', serial: '43K7719P08-21', grade: 'C', tags: [{ label: 'Pantalla', tone: 'danger' }, { label: 'Batería', tone: 'danger' }, { label: 'Bisagra', tone: 'danger' }, { label: 'Puerto USB-C', tone: 'danger' }, { label: 'WiFi', tone: 'danger' }], comment: 'Pantalla con líneas visibles', lastBuyback: '$140.00', country: 'Argentina', status: 'vendido', price: 140, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
  { id: '5', model: 'MacBook Air 15"', spec: 'M3, 16GB, 512GB SSD', serial: '29B4456Q77-23', grade: 'B', tags: [{ label: 'Cargador', tone: 'success' }, { label: 'Touch ID', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$198.00', country: 'Mexico', status: 'vendido', price: 198, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
  { id: '6', model: 'MacBook Pro 13"', spec: 'M1, 8GB, 256GB SSD', serial: '91C2287R33-20', grade: 'N', tags: [{ label: 'Caja original', tone: 'success' }, { label: 'Micrófono', tone: 'success' }], comment: 'Equipo con más de 5 años de uso', lastBuyback: '$0.00', country: 'Colombia', status: 'rejected', price: null, rejectReason: 'Mal estado', clientDecision: null, clientRejectReason: null, ofertaHistorial: null },
  { id: '7', model: 'MacBook Pro 16"', spec: 'M3 Max, 36GB, 2TB SSD', serial: '58F9012S65-24', grade: 'A', tags: [{ label: 'Teclado', tone: 'success' }, { label: 'Carcasa', tone: 'success' }], comment: 'Sin comentarios', lastBuyback: '$225.00', country: 'Argentina', status: 'vendido', price: 225, rejectReason: null, clientDecision: 'aprobado', clientRejectReason: null, ofertaHistorial: null },
]

// --- Buyback-level status/stage (moved from QuoteDetail.tsx) ---------------
// `BuybackStatus` is the canonical shared status: a superset of data/buybacks.ts's
// `BuybackEstado` (which has no `cancelado` — that state only exists as a
// product of this app's interactive flow, never as list mock data).
export type BuybackStatus =
  | 'por-cotizar'
  | 'pendiente-aprobacion'
  | 'cancelado'
  | 'aprobado'
  | 'aprobado-parcial'
  | 'rechazado'
  | 'vencido'
  | 'comprado'

// Etapa derivada del estado real del BBX — misma que consumían ambas vistas.
export type Stage = 'por_cotizar' | 'pendiente_aprobacion' | 'por_facturar' | 'comprada' | 'vencida' | 'cancelada' | 'rechazada'

export const STAGE_BY_STATUS: Record<BuybackStatus, Stage> = {
  'por-cotizar': 'por_cotizar',
  'pendiente-aprobacion': 'pendiente_aprobacion',
  aprobado: 'por_facturar',
  'aprobado-parcial': 'por_facturar',
  comprado: 'comprada',
  vencido: 'vencida',
  cancelado: 'cancelada',
  rechazado: 'rechazada',
}

function statusFromEstado(estado: Buyback['estado']): BuybackStatus {
  switch (estado) {
    case 'por_cotizar':
      return 'por-cotizar'
    case 'pendiente_aprobacion':
      return 'pendiente-aprobacion'
    case 'aprobado':
      return 'aprobado'
    case 'aprobado_parcial':
      return 'aprobado-parcial'
    case 'rechazado':
      return 'rechazado'
    case 'vencido':
      return 'vencido'
    case 'comprado':
      return 'comprado'
  }
}

// --- Facturación / cupones — same shapes InvoiceCountryPanel already used,
// plus `archivoNombre` (Dash-only addition: name of the PDF the client
// attached, so Soga's "Ver factura" has something to point at). ------------

export type FacturaPorPaisEntry = {
  pais: CountryFlag
  factura: FacturaStatus
  comentarioFinanzas?: string | null
  archivoNombre?: string | null
}
export type CuponPorPaisEntry = { pais: CountryFlag; estado: CuponEstado; consecutivo?: string; montoUsd?: number; fecha?: string }
export type CuponGeneradoEntry = { consecutivo: string; montoUsd: number; pais: CountryFlag; entidadEmisora: string; fecha: string }
export type HistorialEntry = { fecha: string; usuario: string; estadoAnterior: string; estadoNuevo: string; motivo?: string }

export type BbxSharedState = {
  buyback: Buyback | null
  tools: ToolRow[]
  buybackStatus: BuybackStatus
  ofertaEnviadaAt: string | null
  clienteVencimiento: { fecha: string; semaforo: ClienteVencimientoSemaforo } | null
  /** Momento en que el cliente terminó de decidir el 100% del lote — puebla
      "Última actualización" en "Por facturar" en ambas vistas. */
  aprobadoClienteAt: string | null
  canceladaInfo: { fecha: string; usuario: string; motivo: string } | null
  historialEstados: HistorialEntry[]
  facturaPorPais: FacturaPorPaisEntry[]
  cuponesPorPais: CuponPorPaisEntry[]
  cuponesGenerados: CuponGeneradoEntry[]
}

function buildInitialState(bbId: string): BbxSharedState {
  const found = findBuyback(bbId)
  const buyback = found?.buyback ?? null

  const tools: ToolRow[] = (() => {
    switch (buyback?.estado) {
      case 'pendiente_aprobacion':
        return SENT_OFFER_TOOL_ROWS
      case 'aprobado':
      case 'aprobado_parcial':
        return APPROVED_TOOL_ROWS
      case 'comprado':
        return SOLD_TOOL_ROWS
      case 'vencido':
        return SENT_OFFER_TOOL_ROWS
      default:
        return INITIAL_TOOL_ROWS
    }
  })().map((row) => ({ ...row, tags: [...row.tags] }))

  return {
    buyback,
    tools,
    buybackStatus: buyback ? statusFromEstado(buyback.estado) : 'por-cotizar',
    ofertaEnviadaAt: buyback?.ofertaEnviadaAt ?? null,
    clienteVencimiento: buyback?.vencimientoCliente ?? null,
    aprobadoClienteAt: buyback?.aprobadoClienteAt ?? null,
    canceladaInfo: null,
    historialEstados: buyback?.historialEstados ?? [],
    facturaPorPais: (buyback?.facturacion?.porPais ?? []).map((p) => ({ ...p, archivoNombre: null })),
    cuponesPorPais: buyback?.cuponesPorPais ?? [],
    cuponesGenerados: buyback?.cuponesGenerados ?? [],
  }
}

// --- Persistence + cross-TAB sync ------------------------------------------
// Dash (/dash/bbx/:id) and Soga (/soga/bbx/:id) are two separate browser
// tabs now — two separate JS runtimes that share nothing in memory. A
// module-level Map alone (this session's earlier approach, when both lived
// in the same tab behind an in-app switcher) can't reach across that
// boundary. The single source of truth instead lives in `localStorage`
// (same-origin, so both tabs read/write the same record); each write also
// posts on a `BroadcastChannel` so the *other* tab's mounted React tree
// re-renders immediately instead of waiting for a manual refresh — that's
// the "sin recarga manual" requirement from the brief. `storage` events are
// wired too, as a fallback for the (now rare) browser without
// BroadcastChannel — same effect, standard-library only, no extra deps.
//
// A same-tab in-memory Map is still kept as a read cache (avoids
// re-parsing JSON on every render) — it's just no longer the source of
// truth, and gets invalidated by any cross-tab notification so the next
// read re-hydrates from `localStorage`.
//
// If this were ever real product state synced across devices/users (not
// just two tabs on one machine), this is exactly the seam to swap for a
// websocket/backend-backed store — out of scope today (per the brief).

const STORAGE_PREFIX = 'bbx:'
const CHANNEL_NAME = 'bbx-sync'

function storageKey(bbId: string) {
  return `${STORAGE_PREFIX}${bbId}`
}

function readFromStorage(bbId: string): BbxSharedState | null {
  try {
    const raw = localStorage.getItem(storageKey(bbId))
    return raw ? (JSON.parse(raw) as BbxSharedState) : null
  } catch {
    // Corrupt record or storage disabled (private mode, quota) — fall back
    // to rebuilding from the mock rather than crashing the page.
    return null
  }
}

function writeToStorage(bbId: string, state: BbxSharedState) {
  try {
    localStorage.setItem(storageKey(bbId), JSON.stringify(state))
  } catch {
    // Best-effort — a write failure just means this tab's cross-tab sync
    // degrades to same-tab-only for this bbId, not a crash.
  }
}

const states = new Map<string, BbxSharedState>()
const listeners = new Map<string, Set<() => void>>()

function notify(bbId: string) {
  listeners.get(bbId)?.forEach((cb) => cb())
}

// Lazily created — SSR-safe (unused in this SPA, but cheap to guard) and
// avoids opening a channel before anything actually needs cross-tab sync.
let channel: BroadcastChannel | null | undefined
function getChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel
  channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(CHANNEL_NAME) : null
  channel?.addEventListener('message', (event: MessageEvent<{ bbId: string }>) => {
    invalidateAndNotify(event.data.bbId)
  })
  return channel
}

// Fallback for browsers without BroadcastChannel: the native `storage` event
// already fires in every OTHER same-origin tab whenever localStorage changes
// here (never in the tab that made the change) — same signal, zero extra
// wiring needed beyond reading the key back out.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (!event.key?.startsWith(STORAGE_PREFIX)) return
    invalidateAndNotify(event.key.slice(STORAGE_PREFIX.length))
  })
}

// Drop this tab's cached copy so the next read re-hydrates from
// `localStorage` (the tab that wrote it already persisted the fresh value),
// then wake up any component subscribed to this bbId in THIS tab.
function invalidateAndNotify(bbId: string) {
  states.delete(bbId)
  notify(bbId)
}

function getState(bbId: string): BbxSharedState {
  let state = states.get(bbId)
  if (state) return state

  const stored = readFromStorage(bbId)
  state = stored ?? buildInitialState(bbId)
  states.set(bbId, state)
  if (!stored) writeToStorage(bbId, state) // seed storage so the other tab sees the same starting point
  return state
}

function setState(bbId: string, updater: (prev: BbxSharedState) => BbxSharedState) {
  const next = updater(getState(bbId))
  states.set(bbId, next)
  writeToStorage(bbId, next)
  notify(bbId) // this tab's own subscribers (immediate, no round-trip)
  getChannel()?.postMessage({ bbId }) // every OTHER tab's subscribers
}

function subscribe(bbId: string, onStoreChange: () => void) {
  let set = listeners.get(bbId)
  if (!set) {
    set = new Set()
    listeners.set(bbId, set)
  }
  set.add(onStoreChange)
  return () => set!.delete(onStoreChange)
}

/** Read + subscribe to the shared state for one bbId — used by both QuoteDetail
    (Soga) and BbxDashDetail (Dash). Re-renders whenever either side writes,
    whether that write happened in this tab or the other one. */
export function useBbxState(bbId: string): BbxSharedState {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(bbId, onStoreChange),
    () => getState(bbId),
  )
}

function appendHistorial(bbId: string, usuario: string, estadoAnterior: string, estadoNuevo: string, motivo: string) {
  setState(bbId, (s) => ({
    ...s,
    historialEstados: [{ fecha: formatNowTimestamp(), usuario, estadoAnterior, estadoNuevo, motivo }, ...s.historialEstados],
  }))
}

// Whether every quoted tool has a client decision — used both to gate the
// "Confirmar decisión" button (BbxDashDetail.tsx) and by `confirmDecisions`
// below. Terminar de decidir NO avanza el BBX solo: el cliente sigue
// pudiendo cambiar de opinión (aprobar↔rechazar cualquier ítem) hasta que
// confirma explícitamente — recién ahí se pasa a "Factura". Antes esto
// pasaba automático apenas se decidía el último ítem, sin que el cliente
// viera ni confirmara el resultado — se corrige acá agregando ese paso.
export function allDecisionsMade(state: BbxSharedState): boolean {
  const quoted = state.tools.filter((t) => t.status === 'quoted')
  return quoted.length > 0 && quoted.every((t) => t.clientDecision !== 'pendiente')
}

// --- Actions ----------------------------------------------------------------

export const bbxActions = {
  // ---- Soga (Martín) ----

  setToolsPrice(bbId: string, toolIds: string[], price: number) {
    setState(bbId, (s) => ({
      ...s,
      tools: s.tools.map((t) => (toolIds.includes(t.id) ? { ...t, status: 'quoted', price, rejectReason: null } : t)),
    }))
  },

  rejectTools(bbId: string, toolIds: string[], reason: string) {
    setState(bbId, (s) => ({
      ...s,
      tools: s.tools.map((t) => (toolIds.includes(t.id) ? { ...t, status: 'rejected', rejectReason: reason, price: null } : t)),
    }))
  },

  sendOffer(bbId: string, dueDateIso: string) {
    setState(bbId, (s) => ({
      ...s,
      buybackStatus: 'pendiente-aprobacion',
      ofertaEnviadaAt: formatNowTimestamp(),
      clienteVencimiento: { fecha: formatDueDate(dueDateIso), semaforo: 'ok' },
    }))
    appendHistorial(bbId, 'Martín Ríos', 'Por cotizar', 'Pendiente de aprobación', 'Oferta enviada al cliente')
  },

  cancelBuyback(bbId: string, reason: string) {
    setState(bbId, (s) => ({
      ...s,
      buybackStatus: 'cancelado',
      canceladaInfo: { fecha: formatNowTimestamp(), usuario: 'Martín Ríos', motivo: reason },
    }))
    appendHistorial(bbId, 'Martín Ríos', 'Por cotizar', 'Cancelado', reason)
  },

  revisarFactura(bbId: string, pais: CountryFlag, decision: 'aceptar' | 'rechazar', motivo: string | null) {
    setState(bbId, (s) => {
      const entry: FacturaPorPaisEntry = {
        pais,
        factura: decision === 'aceptar' ? 'ok' : 'rechazada',
        comentarioFinanzas: decision === 'rechazar' ? motivo : null,
        archivoNombre: s.facturaPorPais.find((f) => f.pais === pais)?.archivoNombre ?? null,
      }
      return {
        ...s,
        facturaPorPais: s.facturaPorPais.some((f) => f.pais === pais)
          ? s.facturaPorPais.map((f) => (f.pais === pais ? entry : f))
          : [...s.facturaPorPais, entry],
      }
    })
    appendHistorial(
      bbId,
      'Finanzas',
      'Factura en revisión',
      decision === 'aceptar' ? 'Factura OK' : 'Factura rechazada',
      decision === 'aceptar' ? `Factura de ${pais} aprobada` : `Factura de ${pais} rechazada: ${motivo}`,
    )
  },

  generarCupon(bbId: string, pais: CountryFlag, montoUsd: number) {
    if (montoUsd <= 0) return
    setState(bbId, (s) => {
      const approvedAmount = s.tools.filter((t) => t.clientDecision === 'aprobado').reduce((sum, t) => sum + (t.price ?? 0), 0)
      const cuponesGeneradosTotal = s.cuponesGenerados.reduce((sum, c) => sum + c.montoUsd, 0)
      const saldoPorGenerar = approvedAmount - cuponesGeneradosTotal
      if (montoUsd > saldoPorGenerar + 0.001) return s

      const entidadEmisora = entidadBordPorPais(pais).razonSocial
      const consecutivo = `BBC-${bbId.replace(/\D/g, '')}-${String(s.cuponesGenerados.length + 1).padStart(2, '0')}`
      const fecha = formatNowTimestamp()
      const cuponesGenerados = [...s.cuponesGenerados, { consecutivo, montoUsd, pais, entidadEmisora, fecha }]
      const cuponEntry = { pais, estado: 'generado' as const, consecutivo, montoUsd, fecha }
      const cuponesPorPais = s.cuponesPorPais.some((c) => c.pais === pais)
        ? s.cuponesPorPais.map((c) => (c.pais === pais ? cuponEntry : c))
        : [...s.cuponesPorPais, cuponEntry]
      const tools = s.tools.map((t) => (t.country.toLowerCase() === pais && t.status === 'quoted' ? { ...t, status: 'vendido' as const } : t))
      appendHistorial(bbId, 'Martín Ríos', 'Aprobado', 'Cupón generado', `${consecutivo} · ${pais}`)
      return { ...s, cuponesGenerados, cuponesPorPais, tools }
    })
  },

  // ---- Dash (cliente) ----

  /** Aprobar/rechazar un ítem ya ofertado — el cliente puede repetir esto
      (cambiar de decisión) mientras el BBX siga `pendiente-aprobacion`; NO
      avanza el BBX por sí solo — ver `confirmDecisions` abajo. */
  clientDecide(bbId: string, toolId: string, decision: 'aprobado' | 'rechazado', reason: ClientRejectReason | null) {
    setState(bbId, (s) => ({
      ...s,
      tools: s.tools.map((t) =>
        t.id === toolId ? { ...t, clientDecision: decision, clientRejectReason: decision === 'rechazado' ? reason : null } : t,
      ),
    }))
  },

  /** Paso explícito del cliente para cerrar la ronda de aprobación — recién
      acá el BBX pasa a `aprobado`/`aprobado-parcial`/`rechazado` y entra a
      "Factura". Antes esto pasaba solo apenas se decidía el último ítem, sin
      que el cliente viera ni confirmara el resultado; corregido a pedido
      explícito ("falta un paso de confirmación antes de pasar a Factura").
      No-op si falta algún ítem por decidir o si el BBX ya avanzó. */
  confirmDecisions(bbId: string) {
    setState(bbId, (s) => {
      if (s.buybackStatus !== 'pendiente-aprobacion' || !allDecisionsMade(s)) return s
      const quoted = s.tools.filter((t) => t.status === 'quoted')
      const approvedCount = quoted.filter((t) => t.clientDecision === 'aprobado').length
      const nextStatus: BuybackStatus = approvedCount === 0 ? 'rechazado' : approvedCount === quoted.length ? 'aprobado' : 'aprobado-parcial'
      const label = nextStatus === 'rechazado' ? 'Rechazado' : nextStatus === 'aprobado' ? 'Aprobado' : 'Aprobado parcial'
      appendHistorial(
        bbId,
        'Sistema (Dash)',
        'Pendiente de aprobación',
        label,
        nextStatus === 'rechazado'
          ? 'Cliente confirmó el rechazo de todo el lote'
          : `Cliente confirmó su decisión (${approvedCount}/${quoted.length} aprobadas)`,
      )
      return { ...s, buybackStatus: nextStatus, aprobadoClienteAt: formatNowTimestamp() }
    })
  },

  /** Cliente envía la factura de un país a revisión — bloquea el bloque hasta
      que Finanzas resuelva (ver `revisarFactura` arriba). Puede volver a
      subir si Finanzas la rechazó. */
  submitFactura(bbId: string, pais: CountryFlag, archivoNombre: string) {
    setState(bbId, (s) => {
      const prev = s.facturaPorPais.find((f) => f.pais === pais)
      const entry: FacturaPorPaisEntry = { pais, factura: 'en_revision', comentarioFinanzas: null, archivoNombre }
      return {
        ...s,
        facturaPorPais: prev ? s.facturaPorPais.map((f) => (f.pais === pais ? entry : f)) : [...s.facturaPorPais, entry],
      }
    })
    appendHistorial(bbId, 'Sistema (Dash)', 'Factura pendiente', 'Factura en revisión', `Factura de ${pais} cargada por el cliente (${archivoNombre})`)
  },
}

// --- Derived data shared by both perspectives' "Por facturar" body --------
// Both QuoteDetail's InvoiceCountryPanel (Martín reviews) and BbxDashDetail's
// upload panel (cliente sube) group the same approved-by-client tools by
// country against the same facturaPorPais/cuponesPorPais records — pulled out
// here once instead of reimplementing the grouping twice.

export type PaisFacturaBlockData = {
  pais: CountryFlag
  herramientas: { serial: string; model: string; priceUsd: number }[]
  subtotalUsd: number
  factura: FacturaPorPaisEntry
  cupon: CuponPorPaisEntry
}

export function buildFacturaBlocks(state: BbxSharedState): PaisFacturaBlockData[] {
  const approvedByClient = state.tools.filter((t) => t.clientDecision === 'aprobado')
  const paises = Array.from(new Set(approvedByClient.map((t) => t.country.toLowerCase()))) as CountryFlag[]
  return paises.map((pais) => {
    const herramientasPais = approvedByClient.filter((t) => t.country.toLowerCase() === pais)
    return {
      pais,
      herramientas: herramientasPais.map((t) => ({ serial: t.serial, model: t.model, priceUsd: t.price ?? 0 })),
      subtotalUsd: herramientasPais.reduce((sum, t) => sum + (t.price ?? 0), 0),
      factura: state.facturaPorPais.find((f) => f.pais === pais) ?? { pais, factura: 'pendiente', archivoNombre: null },
      cupon: state.cuponesPorPais.find((c) => c.pais === pais) ?? { pais, estado: 'pendiente' },
    }
  })
}

export function approvedAmountFor(state: BbxSharedState): number {
  return state.tools.filter((t) => t.clientDecision === 'aprobado').reduce((sum, t) => sum + (t.price ?? 0), 0)
}

export function saldoPorGenerarFor(state: BbxSharedState): number {
  const cuponesGeneradosTotal = state.cuponesGenerados.reduce((sum, c) => sum + c.montoUsd, 0)
  return approvedAmountFor(state) - cuponesGeneradosTotal
}
