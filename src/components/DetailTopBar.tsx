import { useNavigate } from 'react-router-dom'

import iconChevronLeft from '../assets/quote-detail/icon-chevron-left.svg'
import iconNotification from '../assets/quote-detail/icon-notification.svg'

export default function DetailTopBar({ breadcrumbId }: { breadcrumbId: string }) {
  const navigate = useNavigate()

  return (
    <div className="flex h-[52px] w-full shrink-0 items-center justify-between border-b border-solid border-stroke-default bg-layout-level-1 px-[20px]">
      <div className="flex items-center gap-[8px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-[4px] text-[12px] leading-normal text-content-secondary hover:text-content-default"
        >
          <img src={iconChevronLeft} alt="" className="size-[12px] rotate-180" />
          Volver
        </button>
        <p className="whitespace-nowrap text-[14px] leading-normal text-content-secondary">
          Buybacks / <span className="font-bold text-content-default">{breadcrumbId}</span>
        </p>
      </div>

      <button type="button" className="relative flex size-[20px] shrink-0 items-center justify-center">
        <img src={iconNotification} alt="Notificaciones" className="size-[20px]" />
        <span className="absolute right-0 top-0 size-[6px] rounded-full bg-danger-fg" />
      </button>
    </div>
  )
}
