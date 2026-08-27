import avatarSebas from '../assets/layout/avatar-sebas.png'
import divider from '../assets/layout/divider.svg'
import divider2 from '../assets/layout/divider-2.svg'
import iconBookEdit from '../assets/layout/icon-book-edit.svg'
import iconBuilding from '../assets/layout/icon-building.svg'
import iconComputer from '../assets/layout/icon-computer.svg'
import iconDownload from '../assets/layout/icon-download.svg'
import iconGlobal from '../assets/layout/icon-global.svg'
import iconHierarchy from '../assets/layout/icon-hierarchy.svg'
import iconInvoice from '../assets/layout/icon-invoice.svg'
import iconMenuSquare from '../assets/layout/icon-menu-square.svg'
import iconShoppingCart from '../assets/layout/icon-shopping-cart.svg'
import iconStoreLocation from '../assets/layout/icon-store-location.svg'
import iconTicket from '../assets/layout/icon-ticket.svg'
import iconTrackingTruck from '../assets/layout/icon-tracking-truck.svg'
import listArrow from '../assets/layout/list-arrow.svg'
import listArrow2 from '../assets/layout/list-arrow-2.svg'
import listArrow3 from '../assets/layout/list-arrow-3.svg'
import logoBord from '../assets/layout/logo-bord.svg'

type NavItemProps = {
  icon: string
  label: string
  active?: boolean
  hasChevron?: boolean
}

function NavItem({ icon, label, active, hasChevron }: NavItemProps) {
  return (
    <div
      className={`relative flex h-[36px] w-full shrink-0 items-center gap-[8px] rounded-[8px] p-[8px] ${
        active ? 'bg-primary-hover/10' : ''
      }`}
    >
      <img src={icon} alt="" className="size-[20px] shrink-0" />
      <p
        className={`whitespace-nowrap text-[14px] leading-normal ${
          active ? 'text-primary-hover' : 'text-content-secondary'
        }`}
      >
        {label}
      </p>
      {hasChevron && (
        <img src={listArrow2} alt="" className="absolute right-[8px] top-1/2 size-[12px] -translate-y-1/2" />
      )}
    </div>
  )
}

function NavSubItem({ icon, label, active }: NavItemProps) {
  return (
    <div className="flex h-[36px] w-full shrink-0 items-center gap-[4px] pl-[16px]">
      {active ? (
        <img src={divider2} alt="" className="h-full w-px shrink-0" />
      ) : (
        <div className="h-full w-px shrink-0" />
      )}
      <div
        className={`flex h-[36px] flex-1 min-w-0 items-center gap-[8px] rounded-[8px] p-[8px] ${
          active ? 'bg-primary-hover/10' : ''
        }`}
      >
        <img src={icon} alt="" className="size-[20px] shrink-0" />
        <p
          className={`flex-1 min-w-0 truncate text-[14px] leading-normal ${
            active ? 'text-primary-hover' : 'text-content-secondary'
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <div className="relative flex h-full w-[200px] shrink-0 flex-col border-r border-t border-solid border-stroke-default bg-layout-level-1">
      <img src={logoBord} alt="bord" className="mx-auto mt-[15px] h-[25px] w-[80px]" />
      <img src={divider} alt="" className="mx-[16px] mt-[22px] h-px" />

      <div className="flex flex-col items-start gap-[4px] px-[16px] pt-[16px]">
        <NavItem icon={iconMenuSquare} label="Home" />
        <NavItem icon={iconHierarchy} label="Operaciones" hasChevron />

        <div className="flex w-full flex-col items-start">
          <NavSubItem icon={iconBookEdit} label="Cotizaciones" active />
          <NavSubItem icon={iconShoppingCart} label="Órdenes" />
          <NavSubItem icon={iconTrackingTruck} label="Servicios Logs." />
          <NavSubItem icon={iconStoreLocation} label="Stock propio" />
        </div>

        <NavItem icon={iconTicket} label="Catálogo" hasChevron />
        <NavItem icon={iconComputer} label="Herramientas" />
        <NavItem icon={iconInvoice} label="Facturación" />
        <NavItem icon={iconBuilding} label="Empresas" />
        <NavItem icon={iconGlobal} label="Países" />
        <NavItem icon={iconDownload} label="Cargue masivo" />
      </div>

      <div className="mt-auto flex flex-col items-start gap-[16px] px-[16px] pb-[16px]">
        <img src={divider} alt="" className="h-px w-[168px]" />
        <div className="flex w-[168px] items-start gap-[8px] rounded p-[8px]">
          <img
            src={avatarSebas}
            alt=""
            className="size-[32px] shrink-0 rounded-full border border-solid border-stroke-interactive object-cover"
          />
          <div className="flex h-[32px] flex-1 min-w-0 flex-col items-start justify-center">
            <p className="w-full truncate text-[14px] font-medium leading-normal text-content-secondary">
              Sebas Spinel
            </p>
            <p className="w-full truncate text-[12px] leading-normal text-content-secondary opacity-75">
              Procurement
            </p>
          </div>
          <img src={listArrow3} alt="" className="size-[14px] shrink-0 self-center" />
        </div>
      </div>
    </div>
  )
}
