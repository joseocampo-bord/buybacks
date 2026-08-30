import { useNavigate } from 'react-router-dom'

import logoBord from '../../assets/layout/logo-bord.svg'
import divider from '../../assets/layout/divider.svg'
import iconMenuSquare from '../../assets/layout/icon-menu-square.svg'
import iconHierarchy from '../../assets/layout/icon-hierarchy.svg'
import iconBuilding from '../../assets/layout/icon-building.svg'
import iconShoppingCart from '../../assets/layout/icon-shopping-cart.svg'
import iconTrackingTruck from '../../assets/layout/icon-tracking-truck.svg'
import iconComputer from '../../assets/layout/icon-computer.svg'
import iconBookEdit from '../../assets/layout/icon-book-edit.svg'
import iconInvoice from '../../assets/layout/icon-invoice.svg'
import avatarClient from '../../assets/quote-detail/avatar-client.png'

// Dash's own sidebar — per the reference screenshot (dark chrome, flat nav
// list, "Cotizaciones" as the active/highlighted item since a BBX lives
// there, "Facturación" with a "Nuevo" badge). NOT Soga's Sidebar.tsx: that
// one has its own different item set (Home/Operaciones/Catálogo groups) for
// Bord's ops team — this is the client-facing nav, a separate component on
// purpose so a change to one never leaks into the other.
//
// Same fidelity level as Soga's Sidebar.tsx: items are decorative (no
// routing wired) except for the one visual "active" state — this app has no
// other Dash screens to link to yet, so wiring fake routes would be
// inventing navigation that doesn't go anywhere.
//
// All these icon assets already ship with a #C6C7CB stroke/fill — literally
// docs/design-system.md's dark-mode `content/secondary` — so they read
// correctly here with zero recoloring (Soga's light Sidebar.tsx reuses the
// same files, which is why they look faint/gray there).
function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: string
  label: string
  active?: boolean
  badge?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex h-[40px] w-full shrink-0 items-center gap-[10px] rounded-[8px] px-[12px] text-left ${
        active ? 'bg-primary-default' : ''
      }`}
    >
      <img src={icon} alt="" className={`size-[18px] shrink-0 ${active ? 'brightness-0' : ''}`} />
      <p className={`flex-1 whitespace-nowrap text-[14px] leading-normal ${active ? 'font-medium text-primary-fg' : 'text-content-secondary'}`}>
        {label}
      </p>
      {badge && (
        <span className="whitespace-nowrap rounded-[24px] bg-informative-fg px-[6px] py-[1px] text-[10px] font-medium leading-normal text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

// Icon-only rail, same 8 items/order/mapping as the expanded sidebar, no
// labels/badges (per the Figma reference on the BBX detail screen — node
// 36380:140404, "sidebar/Dash" width=64 — the detail screen collapses the
// sidebar; the list screen (36380:414357, width=200) keeps it expanded).
// Reimplemented rather than shrinking NavItem conditionally: the collapsed
// items are centered icon buttons with no text flow at all, different
// enough from NavItem's label-first layout that branching inside it would
// make that component harder to read for both cases.
function CollapsedNavItem({ icon, active, onClick }: { icon: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex size-[36px] shrink-0 items-center justify-center rounded-[8px] ${active ? 'bg-primary-default' : ''}`}
    >
      <img src={icon} alt="" className={`size-[20px] shrink-0 ${active ? 'brightness-0' : ''}`} />
    </button>
  )
}

export default function DashSidebar({ collapsed }: { collapsed?: boolean }) {
  const navigate = useNavigate()
  const items = [
    { icon: iconMenuSquare, label: 'Home' },
    { icon: iconHierarchy, label: 'Empleados' },
    { icon: iconBuilding, label: 'Inventario' },
    { icon: iconShoppingCart, label: 'Órdenes' },
    { icon: iconTrackingTruck, label: 'Servicios logísticos' },
    { icon: iconComputer, label: 'Servicios TI' },
    { icon: iconBookEdit, label: 'Cotizaciones', active: true, onClick: () => navigate('/dash') },
    { icon: iconInvoice, label: 'Facturación', badge: 'Nuevo' },
  ]

  if (collapsed) {
    return (
      <div className="flex h-full w-[64px] shrink-0 flex-col items-center border-r border-solid border-stroke-default bg-layout-level-1">
        {/* Compact roundel instead of the full wordmark (no room at 64px) —
            cropped/scaled from the same logo-bord.svg used elsewhere rather
            than a dedicated mark asset (none ships in this project). */}
        <div className="mt-[20px] flex size-[24px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-content-default">
          <img src={logoBord} alt="bord" className="h-[24px] w-[76px] max-w-none shrink-0 brightness-0 invert" style={{ marginLeft: -4 }} />
        </div>
        <img src={divider} alt="" className="mt-[20px] h-px w-[52px] opacity-20" />
        <div className="mt-[16px] flex flex-col items-center gap-[4px]">
          {items.map((item) => (
            <CollapsedNavItem key={item.label} icon={item.icon} active={item.active} onClick={item.onClick} />
          ))}
        </div>
        <div className="mt-auto flex flex-col items-center gap-[16px] pb-[24px]">
          <img src={divider} alt="" className="h-px w-[52px] opacity-20" />
          <img src={avatarClient} alt="" className="size-[32px] shrink-0 rounded-full border border-solid border-stroke-interactive object-cover" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col border-r border-solid border-stroke-default bg-layout-level-1">
      {/* logo-bord.svg is Soga's light-mode wordmark (#070F21 fill) — no
          separate dark asset ships in this project, so it's forced to white
          the same way the rest of the app already recolors icons placed on
          solid fills (brightness-0 invert, see e.g. QuoteDetail.tsx's
          confirm-price check icon). Loses the pink accent dot's color; a
          real dark-mode export would fix that — out of scope here. */}
      <img src={logoBord} alt="bord" className="mx-[20px] mt-[20px] h-[22px] w-[70px] shrink-0 brightness-0 invert" />
      <img src={divider} alt="" className="mx-[16px] mt-[20px] h-px opacity-20" />

      <div className="flex flex-col items-start gap-[4px] px-[12px] pt-[16px]">
        {items.map((item) => (
          <NavItem key={item.label} icon={item.icon} label={item.label} active={item.active} badge={item.badge} onClick={item.onClick} />
        ))}
      </div>

      <div className="mt-auto flex flex-col items-start gap-[16px] px-[12px] pb-[16px]">
        <img src={divider} alt="" className="h-px w-full opacity-20" />
        <div className="flex w-full items-center gap-[8px] rounded-[8px] p-[4px]">
          <img src={avatarClient} alt="" className="size-[32px] shrink-0 rounded-full border border-solid border-stroke-interactive object-cover" />
          <div className="flex h-[32px] flex-1 min-w-0 flex-col items-start justify-center">
            <p className="w-full truncate text-[14px] font-medium leading-normal text-content-default">Usuario</p>
            <p className="w-full truncate text-[12px] leading-normal text-content-secondary">Usuario</p>
          </div>
        </div>
      </div>
    </div>
  )
}
