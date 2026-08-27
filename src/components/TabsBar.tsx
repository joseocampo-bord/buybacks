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

type UnderlineTab = {
  label: string
  count: number
  badgeColor: string
  active?: boolean
}

const UNDERLINE_TABS: UnderlineTab[] = [
  // 'Por cotizar' uses an amber (#e8a13f) that matches the Figma screenshot pixel-for-pixel
  // but has no corresponding token in docs/design-system.md (the doc's only warning value,
  // #DCC410, is a different yellow-olive hue) — unmapped, left as raw hex intentionally.
  { label: 'Por cotizar', count: 15, badgeColor: '#e8a13f', active: true },
  // informative/fg (status-badge "in-process")
  { label: 'Pendiente de aprobación', count: 20, badgeColor: 'var(--color-informative-fg)' },
  // BUG FIX: was '#22cfab' (primary teal, not a status-badge color) — Figma shows this pill
  // in the same blue as "Pendiente de aprobación" (informative/in-process).
  { label: 'Por facturar', count: 30, badgeColor: 'var(--color-informative-fg)' },
  // BUG FIX: was '#626c82' (status-badge "pending" gray) — Figma shows this pill in green
  // (status-badge "done"/success), not gray.
  { label: 'Compradas', count: 5, badgeColor: 'var(--color-success-fg)' },
  // danger/fg (status-badge "danger")
  { label: 'Vencidas', count: 2, badgeColor: 'var(--color-danger-fg)' },
]

function UnderlineTabButton({ label, count, badgeColor, active }: UnderlineTab) {
  return (
    <div
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
    </div>
  )
}

export function UnderlineTabsWithCta() {
  return (
    <div className="relative flex items-center">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-stroke-default" />
      <div className="flex items-center">
        {UNDERLINE_TABS.map((tab) => (
          <UnderlineTabButton key={tab.label} {...tab} />
        ))}
      </div>
    </div>
  )
}
