// Data model + mock data for the BuyBacks list, per
// docs/handoff-buybacks-listado-tabs.md. The JSON contract in §9 of that doc
// is the source of truth for field shape; anything the doc marks `PROPUESTA`
// is marked the same way here — needs sign-off from Camila/Martín before
// this is treated as final, not just a mock-data convenience.

import avatarClient from '../assets/quote-module/avatar-client.png'
import avatarAssignee1 from '../assets/quote-module/avatar-assignee-1.png'
import avatarAssignee2 from '../assets/quote-module/avatar-assignee-2.png'
import avatarAssignee3 from '../assets/quote-module/avatar-assignee-3.png'

export type CountryFlag = 'mexico' | 'colombia' | 'argentina' | 'turkey' | 'venezuela'

// Header states from Notion V2.0 §7.1. `rechazado` has no tab mapping yet —
// see the TODO on TAB_CONFIG below (handoff §1, open decision 1).
export type BuybackEstado =
  | 'por_cotizar'
  | 'pendiente_aprobacion'
  | 'aprobado'
  | 'aprobado_parcial'
  | 'rechazado'
  | 'vencido'
  | 'comprado'

export type VencidoSubtipo = 'sin_respuesta' | 'rechazado' | 'no_concretado'

export type ClienteVencimientoSemaforo = 'ok' | 'warning' | 'vencido'

// PROPUESTA (handoff §4) — depends on RM-1127/RM-1130, not built yet.
export type FacturacionSubIndicador = 'factura_pendiente' | 'factura_en_revision' | 'ok_cupon_pendiente' | 'cupon_parcial'

// Handoff §9's JSON contract already sketches `facturacion.porPais` (factura
// por país, ya que §10 regla 1 dice que la facturación sí se separa por
// país aunque el BBX sea un solo lote) — usado aquí para poder contar
// "cuántas facturas ya se subieron" en la tab "Pendientes de facturación".
// `rechazada` se agrega para la vista interna "Por facturar" (Finanzas puede
// rechazar una factura con comentario — ver `comentarioFinanzas` abajo).
export type FacturaStatus = 'pendiente' | 'en_revision' | 'ok' | 'rechazada'

// Estado del cupón BBC por país — lógica NUEVA de BBX (el componente de
// cupones del módulo de empresas no calcula esto hoy). Ver `cuponesPorPais`.
export type CuponEstado = 'pendiente' | 'generado'

export type Buyback = {
  bbId: string
  estado: BuybackEstado
  vencidoSubtipo: VencidoSubtipo | null
  paises: CountryFlag[]
  cliente: { nombre: string; avatarUrl: string }
  solicitadoPor: string
  herramientas: { total: number; gestionadas: number }
  /** null until the offer is sent — appears starting at `pendiente_aprobacion` (handoff §2). */
  valorTotalUsd: number | null
  /** Per-country subtotal — only meaningful (and populated) when `paises.length >= 2`;
      shown as a hover breakdown on "Valor total", same pattern as the detail page's
      "Total del lote". Not part of the handoff §9 contract — PROPUESTA. */
  valorPorPais?: { pais: CountryFlag; montoUsd: number }[]
  creacion: string
  tiempoTranscurrido: { valor: number; unidad: string; semaforo: 'ok' | 'warning' | 'vencido' } | null
  responsables: string[]
  /** PROPUESTA (handoff §4) — only meaningful for `aprobado`/`aprobado_parcial` (tab "Pendientes de facturación").
      `porPais` drives that tab's "Facturas subidas" counter (§9's suggested shape). */
  facturacion?: {
    subIndicador: FacturacionSubIndicador
    porPais: {
      pais: CountryFlag
      factura: FacturaStatus
      /** Sólo se usa cuando `factura === 'rechazada'` — motivo que dejó Finanzas. */
      comentarioFinanzas?: string | null
    }[]
  }
  /** Estado del cupón BBC por país — sólo relevante en `aprobado`/`aprobado_parcial`
      ("Por facturar") y `comprado` ("Comprada", ya resuelto). Independiente de
      `factura` arriba: un país puede tener factura `ok` y cupón aún `pendiente`
      (ver DECISIÓN ABIERTA 4, brief — no hay un indicador unificado todavía). */
  cuponesPorPais?: { pais: CountryFlag; estado: CuponEstado; consecutivo?: string; montoUsd?: number; fecha?: string }[]
  /** Cupones ya generados a nivel de lote — lista mostrada en "Por facturar" y
      "Comprada". Se va appendeando en vivo cuando Martín genera uno en la sesión
      (ver InvoiceCountryPanel / QuoteDetail.tsx). */
  cuponesGenerados?: { consecutivo: string; montoUsd: number; pais: CountryFlag; entidadEmisora: string; fecha: string }[]
  /** "Última actualización" de la vista "Por facturar" — momento en que el
      cliente terminó de decidir (100% de los ítems con clientDecision resuelto). */
  aprobadoClienteAt?: string
  /** "Última actualización" de la vista "Vencida" — momento en que el BBX venció. */
  vencidoAt?: string
  /** Auditoría de cambios de estado (BBX) — mismo componente de historial en
      las 4 vistas nuevas + las 2 ya construidas. Se siembra acá para BBX vistos
      directo desde la lista; la sesión interactiva (enviar/cancelar/generar
      cupón) va appendeando entradas nuevas en QuoteDetail.tsx. */
  historialEstados?: { fecha: string; usuario: string; estadoAnterior: string; estadoNuevo: string; motivo?: string }[]
  /** Timestamp de cuándo Martín envió la oferta al cliente — puebla "Última
      actualización" en el detalle desde `pendiente_aprobacion` en adelante.
      Null antes de enviarse (aún no hay nada que mostrar ahí). */
  ofertaEnviadaAt: string | null
  /** Vencimiento que Martín le definió al CLIENTE al enviar la oferta (la
      fecha que ya captura el date-picker de OrderSummaryModal al enviar). Es
      un contador y una fecha DISTINTOS del SLA de Martín (`tiempoTranscurrido`
      arriba): ese SLA deja de correr en el instante en que el BBX llega a
      `pendiente_aprobacion` — este campo es el que sigue corriendo después,
      contra el cliente. Null antes de enviarse la oferta.
      PROPUESTA: los umbrales de `semaforo` (a cuántos días/horas de faltar se
      vuelve warning/vencido) no están definidos en ningún doc fuente — validar
      con Camila/Martín antes de cerrar. */
  vencimientoCliente: { fecha: string; semaforo: ClienteVencimientoSemaforo } | null
}

// --- Entidades Bord por país (bloque de facturación, "Por facturar") ------
// El cliente factura a la entidad de Bord del país DONDE ESTÁ EL EQUIPO, no
// según su propia razón social. Tabla completa tal como fue provista — este
// mock sólo usa 5 países (mexico/colombia/argentina/turkey/venezuela), de ahí
// que sólo 3 de estas filas sean alcanzables hoy + el catch-all "Otros países"
// para turkey/venezuela (no están en la tabla original — no se inventa una
// entidad para ellos, se usa literalmente la fila que la tabla ya define para
// este caso). El resto de filas (brasil/chile/costa_rica/peru/uruguay/usa)
// quedan listas para cuando el mock soporte más países.
export const BORD_ENTIDAD_POR_PAIS: Record<string, { razonSocial: string; documentoFiscal: string }> = {
  argentina: { razonSocial: 'Mobidoc SAS', documentoFiscal: '30-71591511-8' },
  brasil: { razonSocial: 'HAYA DO BRASIL IMPORTAÇÃO E EXPORTAÇÃO LTDA', documentoFiscal: '33.021.168/0001-32' },
  chile: { razonSocial: 'BORD CHILE SPA', documentoFiscal: '78123971-2' },
  colombia: { razonSocial: 'Nudos SAS', documentoFiscal: '901522254-2' },
  costa_rica: { razonSocial: 'BORD CR LIMITADA', documentoFiscal: '3102932233' },
  mexico: { razonSocial: 'Somos Nudos SAPI de CV', documentoFiscal: 'SNU220222112' },
  peru: { razonSocial: 'Nudos Peru SAC', documentoFiscal: '20608772457' },
  uruguay: { razonSocial: 'ONEPOINT SAS', documentoFiscal: '219424280012' },
  usa: { razonSocial: 'Nudos CORP', documentoFiscal: '320684802' },
}
export const BORD_ENTIDAD_OTROS = { razonSocial: 'Bord Operating LLC', documentoFiscal: '32-0789583' }
export const CORREO_FACTURACION = 'admin@bord.co'

export function entidadBordPorPais(pais: string): { razonSocial: string; documentoFiscal: string } {
  return BORD_ENTIDAD_POR_PAIS[pais] ?? BORD_ENTIDAD_OTROS
}

// --- §5: estado → status-badge mapping (PROPUESTA) ------------------------
// The 5 status-badge states + hex are already defined in docs/design-system.md
// and wired as tokens in src/index.css — reused as-is, no new colors invented.
export type StatusBadgeKind = 'pending' | 'in-process' | 'warning' | 'done' | 'danger'

export const STATUS_BADGE_CONFIG: Record<BuybackEstado, { label: string; badge: StatusBadgeKind }> = {
  por_cotizar: { label: 'Por cotizar', badge: 'pending' },
  pendiente_aprobacion: { label: 'Pendiente de aprobación', badge: 'in-process' },
  aprobado: { label: 'Aprobado', badge: 'warning' },
  aprobado_parcial: { label: 'Aprobado parcial', badge: 'warning' },
  rechazado: { label: 'Rechazado', badge: 'danger' },
  vencido: { label: 'Vencido', badge: 'danger' },
  comprado: { label: 'Comprado', badge: 'done' },
}

const STATUS_BADGE_COLORS: Record<StatusBadgeKind, string> = {
  pending: 'var(--color-content-secondary)', // #626C82
  'in-process': 'var(--color-informative-fg)', // #23A5FF
  warning: 'var(--color-warning-fg)', // #DCC410
  done: 'var(--color-success-fg)', // #09A432
  danger: 'var(--color-danger-fg)', // #FC543D
}

export function statusBadgeColor(estado: BuybackEstado): string {
  return STATUS_BADGE_COLORS[STATUS_BADGE_CONFIG[estado].badge]
}

// --- §1 + §3 + §6: tab → estado(s) grouped, counter semantics, CTA --------
// "Aprobadas" y "Pendientes de facturación" estuvieron unificadas en una
// sola tab (ver historial) — separadas de nuevo por decisión de producto,
// ahora que "Pendientes de facturación" tiene su propio contador (facturas
// subidas, no herramientas aprobadas) que las diferencia de verdad.
export type TabKey = 'por_cotizar' | 'aprobadas' | 'pendientes_facturacion' | 'compradas' | 'vencidas'

export const TAB_CONFIG: Record<
  TabKey,
  {
    label: string
    estados: BuybackEstado[]
    /** §3 — what the second ("gestionadas") counter means for this tab. */
    herramientasLabel: string
    /** §3 — Vencidas has "sin progreso relevante"; hide the second counter
        and the progress bar entirely, showing only the total. */
    showGestionadas: boolean
    /** Progress-bar tooltip row labels — PROPUESTA, no copy specified anywhere;
        derived from herramientasLabel's verb per tab. */
    progressPendingLabel: string
    progressDoneLabel: string
    /** §2 — valorTotal only appears from `pendiente_aprobacion` onward. */
    showValorTotal: boolean
    /** §6 CTA label — PROPUESTA. "Por facturar" varies by facturacion sub-indicator, see ctaLabelFor(). */
    ctaLabel: string
  }
> = {
  por_cotizar: {
    label: 'Por cotizar',
    estados: ['por_cotizar'],
    herramientasLabel: 'Herramientas cotizadas',
    showGestionadas: true,
    progressPendingLabel: 'Pendientes por cotizar',
    progressDoneLabel: 'Cotizadas',
    showValorTotal: false,
    ctaLabel: 'Gestionar',
  },
  aprobadas: {
    label: 'Aprobadas',
    estados: ['pendiente_aprobacion'],
    // Deviates from handoff §3 (line 66: "ofertadas") per explicit product
    // correction: what's useful to see here is how many del lote ya aprobó
    // el cliente (progreso mientras sigue pendiente) — no cuántas se ofertaron.
    herramientasLabel: 'Herramientas aprobadas',
    showGestionadas: true,
    progressPendingLabel: 'Pendientes por aprobar',
    progressDoneLabel: 'Aprobadas',
    showValorTotal: true,
    ctaLabel: 'Ver oferta',
  },
  pendientes_facturacion: {
    // "Pendientes de facturación" implicaba que nada había pasado todavía —
    // pero el card puede tener facturas ya OK e incluso cupones ya generados
    // dentro del mismo estado agrupado (aprobado/aprobado_parcial no cambia
    // hasta que TODO el lote termina en cupón → recién ahí pasa a "Comprada").
    // "Facturación" nombra la etapa sin afirmar en qué punto de ella está.
    label: 'Facturación',
    estados: ['aprobado', 'aprobado_parcial'],
    // Ya no es "Herramientas aprobadas" (redundante — todo aquí ya está
    // aprobado): el contador cuenta facturas subidas por país, no
    // herramientas — ver counterFor().
    herramientasLabel: 'Facturas subidas',
    showGestionadas: true,
    progressPendingLabel: 'Pendientes por subir',
    progressDoneLabel: 'Subidas',
    showValorTotal: true,
    // Fallback; el CTA real varía por sub-indicador — ver ctaLabelFor().
    ctaLabel: 'Revisar factura',
  },
  compradas: {
    label: 'Compradas',
    estados: ['comprado'],
    herramientasLabel: 'Herramientas compradas',
    showGestionadas: true,
    progressPendingLabel: 'Pendientes por comprar',
    progressDoneLabel: 'Compradas',
    showValorTotal: true,
    ctaLabel: 'Ver detalle',
  },
  vencidas: {
    label: 'Vencidas',
    estados: ['vencido'],
    herramientasLabel: 'Herramientas',
    showGestionadas: false,
    progressPendingLabel: '',
    progressDoneLabel: '',
    showValorTotal: true,
    ctaLabel: 'Ver detalle',
  },
}

// TODO (handoff §1, decisión abierta 1): "Rechazado" (cliente rechazó todo)
// no tiene tab asignada en ningún documento fuente. No se agrega tab propia
// ni se mete dentro de "Vencidas" por ahora — sin definición, no adivinar.
// Los buybacks con estado `rechazado` no aparecen en ningún tab hasta que
// se resuelva con Camila/Martín.

// TODO (decisión abierta, sin resolver con Camila/Martín): "pendiente_aprobacion"
// y "aprobado"/"aprobado_parcial" siguen siendo pasos secuenciales en el mock
// (primero se resuelve el 100% de la aprobación, después arranca la
// facturación) — la nota original sigue abierta: la factura debería poder
// subirse por herramienta/país a medida que el cliente va aprobando, no como
// paso separado que arranca solo cuando el lote completo ya quedó resuelto.

// §3 — para "Pendientes de facturación", el contador de progreso no es
// herramientas.gestionadas sino cuántos países del lote ya tienen factura
// subida (cualquier estado != "pendiente" cuenta como "ya subida", esté o
// no revisada). El resto de tabs sigue usando el conteo de herramientas.
export function counterFor(bb: Buyback, tab: TabKey): { total: number; done: number } {
  if (tab === 'pendientes_facturacion' && bb.facturacion) {
    const { porPais } = bb.facturacion
    return { total: porPais.length, done: porPais.filter((p) => p.factura !== 'pendiente').length }
  }
  return { total: bb.herramientas.total, done: bb.herramientas.gestionadas }
}

// §6 CTA depende del estado real del buyback y, dentro de "Pendientes de
// facturación", de qué tan avanzado está el sub-indicador de facturación.
export function ctaLabelFor(bb: Buyback, tab: TabKey): string {
  if ((bb.estado === 'aprobado' || bb.estado === 'aprobado_parcial') && bb.facturacion) {
    return bb.facturacion.subIndicador === 'ok_cupon_pendiente' || bb.facturacion.subIndicador === 'cupon_parcial'
      ? 'Generar cupón'
      : 'Revisar factura'
  }
  return TAB_CONFIG[tab].ctaLabel
}

// --- Mock data --------------------------------------------------------------
// One BuybackTable dataset per tab. Reuses the same 4 avatar images and 5
// flag assets already in the project (quote-module) — no new imagery.

function bb(partial: Buyback): Buyback {
  return partial
}

// Orden "por avance" dentro de "Pendientes de facturación": lo menos
// avanzado (factura ni siquiera subida) primero, lo más cerca de terminar
// (cupón parcial) al final — no por fecha ni alfabético.
const FACTURACION_PROGRESO: Record<FacturacionSubIndicador, number> = {
  factura_pendiente: 1,
  factura_en_revision: 2,
  ok_cupon_pendiente: 3,
  cupon_parcial: 4,
}

function progresoFacturacion(buyback: Buyback): number {
  return buyback.facturacion ? FACTURACION_PROGRESO[buyback.facturacion.subIndicador] : 0
}

export const BUYBACKS_BY_TAB: Record<TabKey, Buyback[]> = {
  por_cotizar: [
    bb({
      bbId: 'BB° 9817',
      estado: 'por_cotizar',
      vencidoSubtipo: null,
      paises: ['colombia', 'mexico', 'argentina'],
      cliente: { nombre: 'Zeplin, Inc.', avatarUrl: avatarClient },
      solicitadoPor: 'Carlos Méndez',
      herramientas: { total: 46, gestionadas: 12 },
      valorTotalUsd: null,
      creacion: '12/03/2026',
      tiempoTranscurrido: { valor: 2, unidad: 'hrs', semaforo: 'ok' },
      responsables: [avatarAssignee1, avatarAssignee2, avatarAssignee3],
      ofertaEnviadaAt: null,
      vencimientoCliente: null,
    }),
    bb({
      bbId: 'BB° 9818',
      estado: 'por_cotizar',
      vencidoSubtipo: null,
      paises: ['mexico'],
      cliente: { nombre: 'Zeplin, Inc.', avatarUrl: avatarClient },
      solicitadoPor: 'Ana García',
      herramientas: { total: 7, gestionadas: 4 },
      valorTotalUsd: null,
      creacion: '12/03/2026',
      tiempoTranscurrido: { valor: 2, unidad: 'hrs', semaforo: 'ok' },
      responsables: [avatarAssignee1, avatarAssignee2, avatarAssignee3],
      ofertaEnviadaAt: null,
      vencimientoCliente: null,
    }),
    bb({
      bbId: 'BB° 9819',
      estado: 'por_cotizar',
      vencidoSubtipo: null,
      paises: ['turkey', 'venezuela'],
      cliente: { nombre: 'Zeplin, Inc.', avatarUrl: avatarClient },
      solicitadoPor: 'Roberto Silva',
      herramientas: { total: 20, gestionadas: 10 },
      valorTotalUsd: null,
      creacion: '12/03/2026',
      tiempoTranscurrido: { valor: 20, unidad: 'hrs', semaforo: 'warning' },
      responsables: [avatarAssignee1, avatarAssignee2, avatarAssignee3],
      ofertaEnviadaAt: null,
      vencimientoCliente: null,
    }),
  ],
  aprobadas: [
    bb({
      bbId: 'BB° 9801',
      estado: 'pendiente_aprobacion',
      vencidoSubtipo: null,
      paises: ['mexico', 'colombia'],
      cliente: { nombre: 'Zeplin, Inc.', avatarUrl: avatarClient },
      solicitadoPor: 'María López',
      herramientas: { total: 26, gestionadas: 24 },
      valorTotalUsd: 12450,
      valorPorPais: [
        { pais: 'mexico', montoUsd: 7450 },
        { pais: 'colombia', montoUsd: 5000 },
      ],
      creacion: '10/03/2026',
      tiempoTranscurrido: { valor: 10, unidad: 'hrs', semaforo: 'ok' },
      responsables: [avatarAssignee1, avatarAssignee2],
      ofertaEnviadaAt: '10/03/2026 - 09:15',
      vencimientoCliente: { fecha: '17/03/2026', semaforo: 'ok' },
    }),
    bb({
      bbId: 'BB° 9802',
      estado: 'pendiente_aprobacion',
      vencidoSubtipo: null,
      paises: ['argentina'],
      cliente: { nombre: 'Playtoy', avatarUrl: avatarClient },
      solicitadoPor: 'Lucía Fernández',
      herramientas: { total: 12, gestionadas: 11 },
      valorTotalUsd: 5320,
      creacion: '09/03/2026',
      tiempoTranscurrido: { valor: 18, unidad: 'hrs', semaforo: 'warning' },
      responsables: [avatarAssignee3],
      ofertaEnviadaAt: '09/03/2026 - 16:40',
      vencimientoCliente: { fecha: '12/03/2026', semaforo: 'warning' },
    }),
  ],
  pendientes_facturacion: [
    bb({
      bbId: 'BB° 9770',
      estado: 'aprobado',
      vencidoSubtipo: null,
      paises: ['mexico'],
      cliente: { nombre: 'Zeplin, Inc.', avatarUrl: avatarClient },
      solicitadoPor: 'Carlos Méndez',
      herramientas: { total: 18, gestionadas: 18 },
      valorTotalUsd: 8900,
      creacion: '02/03/2026',
      tiempoTranscurrido: null,
      responsables: [avatarAssignee1],
      // Ningún país con factura subida todavía.
      // Colombia ya está "en_revision" (cargada, esperando decisión) — caso de
      // prueba para ver factura + aceptar/rechazar → habilita "Generar cupón".
      facturacion: {
        subIndicador: 'factura_pendiente',
        porPais: [
          { pais: 'mexico', factura: 'pendiente' },
          { pais: 'colombia', factura: 'en_revision' },
        ],
      },
      cuponesPorPais: [
        { pais: 'mexico', estado: 'pendiente' },
        { pais: 'colombia', estado: 'pendiente' },
      ],
      aprobadoClienteAt: '28/02/2026 - 10:00',
      ofertaEnviadaAt: '01/03/2026 - 11:20',
      vencimientoCliente: null,
    }),
    bb({
      bbId: 'BB° 9772',
      estado: 'aprobado',
      vencidoSubtipo: null,
      paises: ['venezuela'],
      cliente: { nombre: 'Zeplin, Inc.', avatarUrl: avatarClient },
      solicitadoPor: 'Roberto Silva',
      herramientas: { total: 9, gestionadas: 9 },
      valorTotalUsd: 4100,
      creacion: '25/02/2026',
      tiempoTranscurrido: null,
      responsables: [avatarAssignee1, avatarAssignee2],
      // Factura rechazada por Finanzas — caso de prueba para "Por facturar".
      facturacion: {
        subIndicador: 'factura_en_revision',
        porPais: [{ pais: 'venezuela', factura: 'rechazada', comentarioFinanzas: 'Falta RFC del emisor en el PDF cargado' }],
      },
      cuponesPorPais: [{ pais: 'venezuela', estado: 'pendiente' }],
      aprobadoClienteAt: '23/02/2026 - 09:30',
      ofertaEnviadaAt: '24/02/2026 - 08:05',
      vencimientoCliente: null,
    }),
    bb({
      bbId: 'BB° 9771',
      estado: 'aprobado_parcial',
      vencidoSubtipo: null,
      paises: ['colombia', 'mexico'],
      cliente: { nombre: 'Playtoy', avatarUrl: avatarClient },
      solicitadoPor: 'Ana García',
      herramientas: { total: 30, gestionadas: 22 },
      valorTotalUsd: 15200,
      valorPorPais: [
        { pais: 'colombia', montoUsd: 9200 },
        { pais: 'mexico', montoUsd: 6000 },
      ],
      creacion: '28/02/2026',
      tiempoTranscurrido: null,
      responsables: [avatarAssignee2, avatarAssignee3],
      // Las 2 facturas del lote ya están OK — falta generar el cupón. Este es
      // el caso "listo para generar" que ejercita InvoiceCountryPanel de punta
      // a punta (bloqueo de saldo incluido).
      facturacion: {
        subIndicador: 'ok_cupon_pendiente',
        porPais: [
          { pais: 'colombia', factura: 'ok' },
          { pais: 'mexico', factura: 'ok' },
        ],
      },
      cuponesPorPais: [
        { pais: 'colombia', estado: 'pendiente' },
        { pais: 'mexico', estado: 'pendiente' },
      ],
      aprobadoClienteAt: '26/02/2026 - 17:00',
      ofertaEnviadaAt: '27/02/2026 - 14:50',
      vencimientoCliente: null,
      historialEstados: [
        { fecha: '27/02/2026 - 14:50', usuario: 'Martín Ríos', estadoAnterior: 'Por cotizar', estadoNuevo: 'Pendiente de aprobación', motivo: 'Oferta enviada al cliente' },
        { fecha: '26/02/2026 - 17:00', usuario: 'Sistema (Dash)', estadoAnterior: 'Pendiente de aprobación', estadoNuevo: 'Aprobado parcial', motivo: 'Cliente aprobó parcialmente el lote' },
        { fecha: '28/02/2026 - 09:15', usuario: 'Finanzas', estadoAnterior: 'Factura en revisión', estadoNuevo: 'Factura OK', motivo: 'Colombia y México validadas' },
      ],
    }),
  ].sort((a, b) => progresoFacturacion(a) - progresoFacturacion(b)),
  compradas: [
    bb({
      bbId: 'BB° 9700',
      estado: 'comprado',
      vencidoSubtipo: null,
      paises: ['mexico', 'colombia', 'argentina'],
      cliente: { nombre: 'Zeplin, Inc.', avatarUrl: avatarClient },
      solicitadoPor: 'Carlos Méndez',
      herramientas: { total: 46, gestionadas: 46 },
      valorTotalUsd: 22100,
      valorPorPais: [
        { pais: 'mexico', montoUsd: 10100 },
        { pais: 'colombia', montoUsd: 7000 },
        { pais: 'argentina', montoUsd: 5000 },
      ],
      creacion: '15/02/2026',
      tiempoTranscurrido: null,
      responsables: [avatarAssignee1, avatarAssignee2, avatarAssignee3],
      ofertaEnviadaAt: '15/02/2026 - 10:00',
      vencimientoCliente: null,
      // Las 3 facturas ya están OK y con cupón generado — "Comprada" reutiliza
      // InvoiceCountryPanel en modo totalmente resuelto (sin acción pendiente).
      facturacion: {
        subIndicador: 'ok_cupon_pendiente',
        porPais: [
          { pais: 'mexico', factura: 'ok' },
          { pais: 'colombia', factura: 'ok' },
          { pais: 'argentina', factura: 'ok' },
        ],
      },
      cuponesPorPais: [
        { pais: 'mexico', estado: 'generado', consecutivo: 'BBC-9700-01', montoUsd: 10100, fecha: '20/02/2026 - 11:00' },
        { pais: 'colombia', estado: 'generado', consecutivo: 'BBC-9700-02', montoUsd: 7000, fecha: '20/02/2026 - 11:05' },
        { pais: 'argentina', estado: 'generado', consecutivo: 'BBC-9700-03', montoUsd: 5000, fecha: '20/02/2026 - 11:10' },
      ],
      cuponesGenerados: [
        { consecutivo: 'BBC-9700-01', montoUsd: 10100, pais: 'mexico', entidadEmisora: 'Somos Nudos SAPI de CV', fecha: '20/02/2026 - 11:00' },
        { consecutivo: 'BBC-9700-02', montoUsd: 7000, pais: 'colombia', entidadEmisora: 'Nudos SAS', fecha: '20/02/2026 - 11:05' },
        { consecutivo: 'BBC-9700-03', montoUsd: 5000, pais: 'argentina', entidadEmisora: 'Mobidoc SAS', fecha: '20/02/2026 - 11:10' },
      ],
      historialEstados: [
        { fecha: '20/02/2026 - 11:10', usuario: 'Martín Ríos', estadoAnterior: 'Aprobado', estadoNuevo: 'Comprado', motivo: 'Últimos cupones generados (Argentina)' },
      ],
    }),
    bb({
      bbId: 'BB° 9701',
      estado: 'comprado',
      vencidoSubtipo: null,
      paises: ['turkey'],
      cliente: { nombre: 'Playtoy', avatarUrl: avatarClient },
      solicitadoPor: 'María López',
      herramientas: { total: 14, gestionadas: 14 },
      valorTotalUsd: 6700,
      creacion: '10/02/2026',
      tiempoTranscurrido: null,
      responsables: [avatarAssignee3],
      ofertaEnviadaAt: '10/02/2026 - 13:30',
      vencimientoCliente: null,
      // Turkey no está en la tabla de entidades del prompt — cae al catch-all
      // "Otros países" (Bord Operating LLC), tal como esa tabla ya lo define.
      cuponesGenerados: [{ consecutivo: 'BBC-9701-01', montoUsd: 6700, pais: 'turkey', entidadEmisora: 'Bord Operating LLC', fecha: '05/02/2026 - 09:40' }],
    }),
  ],
  vencidas: [
    bb({
      bbId: 'BB° 9650',
      estado: 'vencido',
      vencidoSubtipo: 'sin_respuesta',
      paises: ['venezuela'],
      cliente: { nombre: 'Zeplin, Inc.', avatarUrl: avatarClient },
      solicitadoPor: 'Ana García',
      herramientas: { total: 8, gestionadas: 0 },
      valorTotalUsd: 3200,
      creacion: '01/02/2026',
      tiempoTranscurrido: null,
      responsables: [avatarAssignee1],
      ofertaEnviadaAt: '01/02/2026 - 09:00',
      vencimientoCliente: { fecha: '02/02/2026', semaforo: 'vencido' },
      vencidoAt: '03/02/2026 - 00:00',
    }),
    bb({
      bbId: 'BB° 9651',
      estado: 'vencido',
      vencidoSubtipo: 'no_concretado',
      paises: ['mexico', 'colombia'],
      cliente: { nombre: 'Playtoy', avatarUrl: avatarClient },
      solicitadoPor: 'Lucía Fernández',
      herramientas: { total: 15, gestionadas: 6 },
      valorTotalUsd: 5400,
      valorPorPais: [
        { pais: 'mexico', montoUsd: 3200 },
        { pais: 'colombia', montoUsd: 2200 },
      ],
      creacion: '28/01/2026',
      tiempoTranscurrido: null,
      responsables: [avatarAssignee2],
      ofertaEnviadaAt: '28/01/2026 - 15:10',
      vencimientoCliente: { fecha: '30/01/2026', semaforo: 'vencido' },
      vencidoAt: '31/01/2026 - 00:00',
      historialEstados: [
        { fecha: '28/01/2026 - 15:10', usuario: 'Martín Ríos', estadoAnterior: 'Por cotizar', estadoNuevo: 'Pendiente de aprobación', motivo: 'Oferta enviada al cliente' },
        { fecha: '30/01/2026 - 20:00', usuario: 'Sistema (Dash)', estadoAnterior: 'Pendiente de aprobación', estadoNuevo: 'Aprobado parcial', motivo: 'Cliente aprobó 6 de 15 herramientas' },
        { fecha: '31/01/2026 - 00:00', usuario: 'Sistema', estadoAnterior: 'Aprobado parcial', estadoNuevo: 'Vencido', motivo: 'No se concretó la facturación dentro del plazo (subtipo: no_concretado)' },
      ],
    }),
  ],
}

// Looks up a buyback (+ which tab it lives in) by bbId, across every tab's
// dataset — used by the detail page so it reflects the real card that was
// clicked instead of always showing the same static mock.
export function findBuyback(bbId: string): { buyback: Buyback; tab: TabKey } | null {
  for (const tab of Object.keys(BUYBACKS_BY_TAB) as TabKey[]) {
    const buyback = BUYBACKS_BY_TAB[tab].find((b) => b.bbId === bbId)
    if (buyback) return { buyback, tab }
  }
  return null
}

// Every mock buyback, flattened — same underlying records Soga's list reads
// via BUYBACKS_BY_TAB (one model, per the brief: "no dupliques el modelo de
// estados ni el de ítems"), regrouped below by Dash's own tab vocabulary
// instead of Soga's.
export const ALL_BUYBACKS: Buyback[] = Object.values(BUYBACKS_BY_TAB).flat()

// --- Dash's own list tabs (src/pages/DashBbxList.tsx) ----------------------
// Dash groups the SAME `BuybackEstado`s differently from Soga's TAB_CONFIG
// above — per "BBX · Dash (cliente) — proceso por tab" (mapeo tab→estados,
// referencia a Reglas V2.0 §7.1). Reemplaza el mapeo PROPUESTA que este
// archivo tenía antes (inferido sólo de los labels de un frame de Figma,
// que no distinguía "Recibido" de "Factura" como tabs separadas — ese
// frame quedaba desalineado con este doc, que es la fuente de verdad):
//   Recibido      → por_cotizar + pendiente_aprobacion (dos momentos de
//                    carga opuesta dentro del MISMO tab — ver
//                    dashRecibidoSubestado más abajo, decisión abierta 2).
//   Factura       → aprobado + aprobado_parcial.
//   Vendido       → comprado.
//   Vencido       → vencido.
//   Cancelado     → rechazado (el cliente rechazó todo el lote).
export type DashTabKey = 'recibido' | 'factura' | 'vendido' | 'vencido' | 'cancelado'

export const DASH_TAB_CONFIG: Record<DashTabKey, { label: string; estados: BuybackEstado[] }> = {
  recibido: { label: 'Recibido', estados: ['por_cotizar', 'pendiente_aprobacion'] },
  factura: { label: 'Factura', estados: ['aprobado', 'aprobado_parcial'] },
  vendido: { label: 'Vendido', estados: ['comprado'] },
  vencido: { label: 'Vencido', estados: ['vencido'] },
  cancelado: { label: 'Cancelado', estados: ['rechazado'] },
}

export function dashBuybacksForTab(tab: DashTabKey): Buyback[] {
  return ALL_BUYBACKS.filter((b) => DASH_TAB_CONFIG[tab].estados.includes(b.estado))
}

// DECISIÓN ABIERTA 2 (doc "BBX · Dash", discrepancia #2): "Recibido" mezcla
// dos cargas opuestas — `por_cotizar` (sin acción del cliente) y
// `pendiente_aprobacion` (requiere su decisión). El doc propone un status
// por fila para distinguirlos pero no cierra si eso basta o si conviene
// separar en dos tabs. Se implementa la propuesta (status por fila) porque
// es la única de las dos opciones que no requiere adivinar una división de
// tabs no confirmada.
export function dashRecibidoSubestado(estado: BuybackEstado): { label: string; tone: 'warning' | 'informative' } | null {
  if (estado === 'por_cotizar') return { label: 'Esperando oferta', tone: 'warning' }
  if (estado === 'pendiente_aprobacion') return { label: 'Requiere tu revisión', tone: 'informative' }
  return null
}
