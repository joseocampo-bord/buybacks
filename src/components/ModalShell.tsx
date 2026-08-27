import type { ReactNode } from 'react'

import iconModalClose from '../assets/quote-detail/icon-modal-close.svg'

// Generic centered-overlay modal shell shared by the buyback-management
// modals (reject reason, order summary, cancellation). Matches the Figma
// "Header modal" component: white header, bold 16px title + secondary 12px
// subtitle, close icon top-right — converted to this project's light tokens
// (the Figma reference renders this header in DASH dark chrome by default).
export default function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  widthClass = 'w-[480px]',
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  widthClass?: string
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#070f21]/40 p-[24px]"
      onClick={onClose}
    >
      <div
        className={`flex flex-col rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 shadow-[0px_16px_40px_rgba(7,15,33,0.2)] ${widthClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-[16px] rounded-t-[12px] border-b border-solid border-stroke-default bg-layout-level-1 px-[24px] py-[16px]">
          <div className="flex flex-1 flex-col items-start gap-[4px]">
            <p className="w-full text-[16px] font-bold leading-normal text-content-default">{title}</p>
            {subtitle && <p className="w-full text-[12px] leading-normal text-content-secondary">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="shrink-0" aria-label="Cerrar">
            <img src={iconModalClose} alt="" className="size-[24px]" />
          </button>
        </div>
        <div className="px-[24px] py-[20px]">{children}</div>
        {footer && <div className="flex flex-col items-center gap-[12px] rounded-b-[12px] px-[24px] pb-[24px] pt-[4px]">{footer}</div>}
      </div>
    </div>
  )
}
