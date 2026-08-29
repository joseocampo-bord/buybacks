import { useState } from 'react'

import flagMexico from '../assets/quote-module/flag-mexico.svg'
import flagColombia from '../assets/quote-module/flag-colombia.svg'
import flagArgentina from '../assets/quote-module/flag-argentina.svg'
import flagTurkey from '../assets/quote-module/flag-turkey.svg'
import flagVenezuela from '../assets/quote-module/flag-venezuela.svg'
import iconTime from '../assets/quote-module/icon-time.svg'
import iconCheckCircle from '../assets/quote-module/icon-check-circle.svg'
import statusDot from '../assets/quote-module/status-dot.svg'

import { TAB_CONFIG, ctaLabelFor, counterFor, type Buyback, type CountryFlag, type TabKey } from '../data/buybacks'

const FLAGS: Record<CountryFlag, string> = {
  mexico: flagMexico,
  colombia: flagColombia,
  argentina: flagArgentina,
  turkey: flagTurkey,
  venezuela: flagVenezuela,
}

// §4 (PROPUESTA) — short label per facturación sub-indicador, only rendered
// on the "Por facturar" tab. No copy was specified anywhere; kept terse to
// match the rest of the card's field labels — revisit with Camila/Martín.
const FACTURACION_LABEL: Record<NonNullable<Buyback['facturacion']>['subIndicador'], string> = {
  factura_pendiente: 'Factura pendiente',
  factura_en_revision: 'Factura en revisión',
  ok_cupon_pendiente: 'OK · cupón pendiente',
  cupon_parcial: 'Cupón parcial',
}

function Field({
  title,
  children,
  widthClass = 'w-[120px]',
}: {
  title: string
  children: React.ReactNode
  widthClass?: string
}) {
  return (
    <div className={`flex ${widthClass} shrink-0 flex-col items-start gap-[6px]`}>
      <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-normal text-content-secondary">
        {title}
      </p>
      {children}
    </div>
  )
}

// Striped progress bar — green (done) segment sized by gestionadas/total,
// gray (pending) segment fills the rest. Diagonal stripes drawn with CSS
// gradients, not an image asset.
function ProgressBar({ total, done }: { total: number; done: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  return (
    <div className="flex h-[8px] w-[88px] shrink-0 overflow-hidden rounded-full bg-stroke-default">
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          backgroundImage:
            'repeating-linear-gradient(-45deg, var(--color-success-fg), var(--color-success-fg) 2.5px, color-mix(in srgb, var(--color-success-fg) 45%, white) 2.5px, color-mix(in srgb, var(--color-success-fg) 45%, white) 5px)',
        }}
      />
    </div>
  )
}

// Herramientas field: progress bar + "{gestionadas}/{total}", with a hover
// tooltip breaking down the two numbers using the tab's own vocabulary
// (§3 — "cotizadas" vs. "ofertadas" vs. "aprobadas" vs. "vendidas"). Copy is
// PROPUESTA, see progressPendingLabel/progressDoneLabel in data/buybacks.ts.
function ProgressField({
  title,
  total,
  done,
  showProgress,
  pendingLabel,
  doneLabel,
}: {
  title: string
  total: number
  done: number
  showProgress: boolean
  pendingLabel: string
  doneLabel: string
}) {
  const [open, setOpen] = useState(false)

  if (!showProgress) {
    // §3 — "Vencidas" has no relevant progress, only the total.
    return (
      <Field title={title} widthClass="w-[150px]">
        <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">{total}</p>
      </Field>
    )
  }

  return (
    <Field title={title} widthClass="w-[150px]">
      <div className="relative flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <div className="flex items-center gap-[8px]">
          <ProgressBar total={total} done={done} />
          <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">
            {done}/{total}
          </p>
        </div>
        {open && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-30 flex w-max min-w-[170px] flex-col gap-[6px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 p-[10px] shadow-[0px_8px_24px_rgba(7,15,33,0.16)]">
            <div className="flex items-center justify-between gap-[16px]">
              <div className="flex items-center gap-[6px]">
                <img src={iconTime} alt="" className="size-[12px] shrink-0" />
                <span className="whitespace-nowrap text-[11px] normal-case leading-normal text-content-default">{pendingLabel}</span>
              </div>
              <span className="text-[11px] font-medium leading-normal text-content-default">{total - done}</span>
            </div>
            <div className="flex items-center justify-between gap-[16px]">
              <div className="flex items-center gap-[6px]">
                <img src={iconCheckCircle} alt="" className="size-[12px] shrink-0" />
                <span className="whitespace-nowrap text-[11px] normal-case leading-normal text-content-default">{doneLabel}</span>
              </div>
              <span className="text-[11px] font-medium leading-normal text-content-default">{done}</span>
            </div>
          </div>
        )}
      </div>
    </Field>
  )
}

function formatUSD(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
}

// "Valor total" field — when the buyback spans 2+ países, an "i" icon next
// to the label reveals a per-country breakdown on hover. Same pattern as the
// detail page's "Total del lote" (QuoteDetail.tsx's MetricCard). Doesn't
// reuse <Field> because its title is plain text — this one needs an
// interactive icon + absolutely-positioned tooltip next to the label.
function ValorTotalField({ total, breakdown }: { total: number; breakdown?: { pais: CountryFlag; montoUsd: number }[] }) {
  const [open, setOpen] = useState(false)
  const showBreakdown = breakdown && breakdown.length >= 2

  return (
    <div className="flex w-[120px] shrink-0 flex-col items-start gap-[6px]">
      <div className="flex items-center gap-[4px]">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-normal text-content-secondary">
          Valor total
        </p>
        {showBreakdown && (
          <div className="relative flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <span className="flex size-[12px] items-center justify-center rounded-full border border-solid border-stroke-interactive text-[8px] leading-none text-content-secondary">
              i
            </span>
            {open && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-30 flex w-max min-w-[170px] flex-col gap-[6px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 p-[10px] shadow-[0px_8px_24px_rgba(7,15,33,0.16)]">
                {breakdown.map((row) => (
                  <div key={row.pais} className="flex items-center justify-between gap-[16px]">
                    <div className="flex items-center gap-[6px]">
                      <img src={FLAGS[row.pais]} alt="" className="size-[12px] shrink-0 rounded-full" />
                      <span className="whitespace-nowrap text-[11px] normal-case capitalize leading-normal text-content-default">
                        {row.pais}
                      </span>
                    </div>
                    <span className="whitespace-nowrap text-[11px] font-medium leading-normal text-content-default">
                      {formatUSD(row.montoUsd)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">{formatUSD(total)}</p>
    </div>
  )
}

export type BuybackCardProps = {
  buyback: Buyback
  tab: TabKey
  /** Called when the row (or its CTA button) is activated — used to navigate to the detail view. */
  onRowClick?: () => void
}

export default function BuybackCard({ buyback, tab, onRowClick }: BuybackCardProps) {
  const tabConfig = TAB_CONFIG[tab]
  const ctaLabel = ctaLabelFor(buyback, tab)
  const counter = counterFor(buyback, tab)
  const flags = buyback.paises

  return (
    // `group` + hover styles implement the Figma hover state: border brightens to the
    // primary teal and the CTA button fills solid (see button below).
    <div
      role={onRowClick ? 'button' : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={onRowClick}
      onKeyDown={
        onRowClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onRowClick()
              }
            }
          : undefined
      }
      className={`group flex w-full items-center gap-[24px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 py-[16px] transition-colors ${
        onRowClick ? 'cursor-pointer hover:border-primary-default' : ''
      }`}
    >
      {/* No per-card status-badge — the active tab already conveys the
          state (§5's "single anchor" proposal is redundant with the tab
          itself, per explicit product direction). */}
      <div className="flex w-[190px] shrink-0 flex-col items-start gap-[4px] pl-[16px]">
        <div className="flex items-center gap-[4px]">
          <div className="flex items-center">
            {flags.map((flag, i) => (
              <img
                key={`${flag}-${i}`}
                src={FLAGS[flag]}
                alt={flag}
                className="size-[12px] shrink-0 rounded-full"
                style={{ marginRight: i === flags.length - 1 ? 0 : -4 }}
              />
            ))}
          </div>
          {flags.length > 1 && (
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-bold leading-normal text-content-default">
              +{flags.length - 1}
            </p>
          )}
          {flags.length === 1 && (
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-bold leading-normal text-content-default capitalize">
              {flags[0]}
            </p>
          )}
        </div>
        <p className="whitespace-nowrap text-[12px] leading-normal text-content-secondary">{buyback.bbId}</p>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-between gap-y-[24px] pr-[16px]">
        <Field title="Cliente">
          <div className="flex w-full items-center gap-[4px]">
            <img
              src={buyback.cliente.avatarUrl}
              alt=""
              className="size-[18px] shrink-0 rounded-full border border-solid border-stroke-interactive object-cover"
            />
            <p className="flex-1 truncate text-[12px] leading-normal text-content-default">{buyback.cliente.nombre}</p>
          </div>
        </Field>

        <Field title="Solicitado por">
          <p className="truncate text-[12px] leading-normal text-content-default">{buyback.solicitadoPor}</p>
        </Field>

        <ProgressField
          title={tabConfig.herramientasLabel}
          total={counter.total}
          done={counter.done}
          showProgress={tabConfig.showGestionadas}
          pendingLabel={tabConfig.progressPendingLabel}
          doneLabel={tabConfig.progressDoneLabel}
        />

        {/* §2 — valorTotal only appears from "Pendiente de aprobación" onward
            (no offer exists yet in "Por cotizar"). */}
        {tabConfig.showValorTotal && buyback.valorTotalUsd != null && (
          <ValorTotalField total={buyback.valorTotalUsd} breakdown={buyback.valorPorPais} />
        )}

        <Field title="Creación">
          <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">{buyback.creacion}</p>
        </Field>

        {buyback.tiempoTranscurrido && (
          <Field title="Tiempo transcurrido">
            <div className="flex items-center gap-[4px] rounded-[24px] border border-solid border-informative-fg px-[6px] py-[2px]">
              <img src={statusDot} alt="" className="size-[8px] shrink-0" />
              <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">
                {buyback.tiempoTranscurrido.valor} {buyback.tiempoTranscurrido.unidad}
              </p>
            </div>
          </Field>
        )}

        {/* §4 (PROPUESTA) — facturación sub-indicator. Only aprobado/aprobado_parcial
            buybacks carry a `facturacion` field, so this alone gates it correctly
            now that "Aprobación y facturación" also holds pendiente_aprobacion cards. */}
        {buyback.facturacion && (
          <Field title="Facturación">
            <p className="whitespace-nowrap text-[11px] font-medium leading-normal text-warning-fg">
              {FACTURACION_LABEL[buyback.facturacion.subIndicador]}
            </p>
          </Field>
        )}

        {/* Fixed width (room for the max of 3 overlapping avatars) so this
            block doesn't change size with the responsables count — it sits
            inside the same justify-between row as the other columns, and a
            variable-width sibling there was throwing off their alignment
            from card to card. */}
        <div className="flex w-[52px] shrink-0 items-center">
          {buyback.responsables.map((avatar, i) => (
            <img
              key={i}
              src={avatar}
              alt=""
              className="size-[20px] shrink-0 rounded-full border border-solid border-stroke-interactive object-cover"
              style={{ marginRight: i === buyback.responsables.length - 1 ? 0 : -4 }}
            />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[8px] pr-[16px]">
        <button
          type="button"
          onClick={(e) => {
            // The row itself is also clickable (role="button"), so stop propagation to
            // avoid double-firing navigation from a button nested inside a clickable row.
            e.stopPropagation()
            onRowClick?.()
          }}
          // border/text use primary-default (#22cfab), matching the CTA outline-button
          // token from the design system. On row hover the button fills solid — the CTA
          // becomes more prominent, per the Figma hover reference.
          className="flex min-w-[32px] items-center justify-center gap-[8px] rounded-[8px] border border-solid border-primary-default p-[8px] transition-colors group-hover:bg-primary-default"
        >
          <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-primary-default transition-colors group-hover:text-primary-fg">
            {ctaLabel}
          </p>
        </button>
      </div>
    </div>
  )
}
