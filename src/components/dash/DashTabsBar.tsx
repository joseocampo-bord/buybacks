import { DASH_TAB_CONFIG, dashBuybacksForTab, type DashTabKey } from '../../data/buybacks'

// Same underline-tab-bar construction as Soga's TabsBar.tsx
// (UnderlineTabsWithCta) — active border-bottom + tinted background + a
// colored count badge — reimplemented here for Dash's own tab set/colors
// instead of importing that file (it's typed against Soga's `TabKey`, and
// pulling it in would couple Dash to a component that's otherwise 100%
// Soga). Colors follow the same estado→tono convention data/buybacks.ts's
// STATUS_BADGE_CONFIG already uses (in-process=informative, done=success,
// danger=danger) — "Recibido" mixes both a not-yet-actionable estado
// (`por_cotizar`, warning en Soga) and an actionable one
// (`pendiente_aprobacion`, informative); se usa informative acá porque ese
// es el que de verdad le pide algo al cliente.
const DASH_TAB_BADGE_COLOR: Record<DashTabKey, string> = {
  recibido: 'var(--color-informative-fg)',
  factura: 'var(--color-warning-fg)',
  vendido: 'var(--color-success-fg)',
  vencido: 'var(--color-danger-fg)',
  cancelado: 'var(--color-danger-fg)',
}

function TabButton({
  tabKey,
  active,
  onClick,
}: {
  tabKey: DashTabKey
  active: boolean
  onClick: () => void
}) {
  const color = DASH_TAB_BADGE_COLOR[tabKey]
  const count = dashBuybacksForTab(tabKey).length
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[108px] flex-col items-center justify-center px-[24px] py-[8px]"
      style={
        active
          ? { borderBottom: `2px solid ${color}`, backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)` }
          : undefined
      }
    >
      <div className="flex items-center gap-[8px]">
        <p className="whitespace-nowrap text-[14px] leading-normal" style={{ color: active ? color : 'var(--color-content-secondary)' }}>
          {DASH_TAB_CONFIG[tabKey].label}
        </p>
        <div
          className="flex min-w-[16px] items-center justify-center rounded-[24px] p-[4px]"
          style={{
            backgroundColor: active ? color : `color-mix(in srgb, ${color} 10%, transparent)`,
            border: active ? 'none' : undefined,
          }}
        >
          <p className="w-full text-center text-[12px] leading-normal" style={{ color: active ? 'var(--color-primary-fg)' : color }}>
            {count}
          </p>
        </div>
      </div>
    </button>
  )
}

export default function DashTabsBar({ activeTab, onChange }: { activeTab: DashTabKey; onChange: (tab: DashTabKey) => void }) {
  const tabKeys = Object.keys(DASH_TAB_CONFIG) as DashTabKey[]
  return (
    <div className="relative flex items-center">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-stroke-default" />
      <div className="flex items-center">
        {tabKeys.map((key) => (
          <TabButton key={key} tabKey={key} active={activeTab === key} onClick={() => onChange(key)} />
        ))}
      </div>
    </div>
  )
}
