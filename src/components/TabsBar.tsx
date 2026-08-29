import { BUYBACKS_BY_TAB, TAB_CONFIG, type TabKey } from '../data/buybacks'

type PillOption = {
  label: string
  active?: boolean
}

const PILL_OPTIONS: PillOption[] = [
  { label: 'Cotizaciones' },
  { label: 'Buybacks', active: true },
]

export function PillTabs() {
  return (
    <div className="flex shrink-0 items-center rounded-[12px] border border-solid border-stroke-default bg-layout-level-2 p-[4px]">
      {PILL_OPTIONS.map(({ label, active }) => (
        <div
          key={label}
          className={`flex items-center justify-center gap-[8px] rounded-[8px] px-[16px] py-[8px] ${
            active ? 'bg-white drop-shadow-[0px_5px_4px_rgba(0,0,0,0.08)]' : ''
          }`}
        >
          <p
            className={`whitespace-nowrap text-[14px] leading-normal ${
              active ? 'text-content-default' : 'text-content-secondary'
            }`}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}

// Per-tab underline color — pixel-matched against the Figma "Por cotizar"
// reference for the 2 tabs that were actually verified there; the other 3
// (Pendiente de aprobación / Por facturar / Compradas / Vencidas) reuse the
// closest status-badge family token. This is the TAB pill's own color, not
// the same thing as the per-card status-badge mapping in data/buybacks.ts
// §5 (a tab groups multiple `estado`s, e.g. "Por facturar" = aprobado +
// aprobado_parcial, so it can't just inherit one card's badge color 1:1).
const TAB_BADGE_COLOR: Record<TabKey, string> = {
  // 'Por cotizar' uses an amber (#e8a13f) that matches the Figma screenshot pixel-for-pixel
  // but has no corresponding token in docs/design-system.md (the doc's only warning value,
  // #DCC410, is a different yellow-olive hue) — unmapped, left as raw hex intentionally.
  por_cotizar: '#e8a13f',
  // informative/fg (status-badge "in-process")
  aprobadas: 'var(--color-informative-fg)',
  // Figma shows this pill in the same blue as "Aprobadas" — kept even though the per-card
  // status-badge for aprobado/aprobado_parcial is "warning" (yellow, §5); the tab pill's own
  // color was verified against Figma separately from the card badges.
  pendientes_facturacion: 'var(--color-informative-fg)',
  // status-badge "done"/success
  compradas: 'var(--color-success-fg)',
  // status-badge "danger"
  vencidas: 'var(--color-danger-fg)',
}

function UnderlineTabButton({
  tabKey,
  label,
  count,
  active,
  onClick,
}: {
  tabKey: TabKey
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  const badgeColor = TAB_BADGE_COLOR[tabKey]
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[108px] flex-col items-center justify-center px-[24px] py-[8px]"
      style={
        active
          ? {
              borderBottom: `2px solid ${badgeColor}`,
              // color-mix works for both raw hex and var(--color-*) refs, unlike the old
              // `${badgeColor}14` hex-alpha-suffix trick (which breaks on CSS var strings).
              backgroundColor: `color-mix(in srgb, ${badgeColor} 8%, transparent)`,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-[8px]">
        <p
          className="whitespace-nowrap text-[14px] leading-normal"
          style={{ color: active ? badgeColor : 'var(--color-content-secondary)' }}
        >
          {label}
        </p>
        <div
          className="flex min-w-[16px] items-center justify-center rounded-[24px] p-[4px]"
          style={{
            backgroundColor: active ? `color-mix(in srgb, ${badgeColor} 15%, transparent)` : 'transparent',
            border: active ? 'none' : '1px solid var(--color-stroke-default)',
          }}
        >
          <p className="w-full text-center text-[12px] leading-normal" style={{ color: badgeColor }}>
            {count}
          </p>
        </div>
      </div>
    </button>
  )
}

export function UnderlineTabsWithCta({
  activeTab,
  onChange,
}: {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
}) {
  const tabKeys = Object.keys(TAB_CONFIG) as TabKey[]

  return (
    <div className="relative flex items-center">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-stroke-default" />
      <div className="flex items-center">
        {tabKeys.map((key) => (
          <UnderlineTabButton
            key={key}
            tabKey={key}
            label={TAB_CONFIG[key].label}
            // §7 — "cada tab muestra el conteo de BBX en ese estado", derived from
            // the mock dataset length rather than a hardcoded number.
            count={BUYBACKS_BY_TAB[key].length}
            active={activeTab === key}
            onClick={() => onChange(key)}
          />
        ))}
      </div>
    </div>
  )
}
