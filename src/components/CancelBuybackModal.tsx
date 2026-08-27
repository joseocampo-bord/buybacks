import { useState } from 'react'

import iconDropdownChevron from '../assets/quote-detail/icon-dropdown-chevron.svg'
import iconAlertTriangle from '../assets/quote-detail/icon-alert-triangle.svg'
import iconModalClose from '../assets/quote-detail/icon-modal-close.svg'

const CANCEL_REASONS = [
  'El cliente ya no está interesado',
  'Todas las herramientas fueron rechazadas',
  'Error al crear el buyback',
  'Otro motivo',
]

// "Cancelar buyback" — Figma node 31786:109543. Renders on a light surface
// already in the reference (unlike its sibling modals), so this is close to
// a 1:1 port onto this project's tokens.
export default function CancelBuybackModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070f21]/40 p-[24px]" onClick={onCancel}>
      <div
        className="relative flex w-[560px] flex-col items-center gap-[32px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 px-[40px] py-[40px] shadow-[0px_16px_40px_rgba(7,15,33,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" onClick={onCancel} aria-label="Cerrar" className="absolute right-[23px] top-[23px]">
          <img src={iconModalClose} alt="" className="size-[18px]" />
        </button>

        <img src={iconAlertTriangle} alt="" className="size-[65px]" />

        <div className="flex flex-col items-center gap-[8px] text-center">
          <p className="text-[20px] font-bold leading-normal text-content-default">Cancelar buyback</p>
          <p className="max-w-[380px] text-[12px] leading-normal text-content-secondary">
            Esta acción no se puede deshacer. El cliente recibirá un correo con la razón de cancelación.
          </p>
        </div>

        <div className="relative flex w-full flex-col items-start gap-[4px]">
          <p className="text-[12px] leading-normal text-content-default">Razón de cancelación*</p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-[40px] w-full items-center justify-between rounded-[6px] border border-solid border-stroke-interactive bg-layout-level-2 px-[16px]"
          >
            <span className={`text-[14px] leading-normal ${reason ? 'text-content-default' : 'text-content-secondary'}`}>
              {reason || 'Selecciona un motivo'}
            </span>
            <img src={iconDropdownChevron} alt="" className={`size-[14px] transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute top-[64px] z-10 flex w-full flex-col overflow-hidden rounded-[6px] border border-solid border-stroke-default bg-layout-level-1 shadow-[0px_8px_24px_rgba(7,15,33,0.12)]">
              {CANCEL_REASONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setReason(option)
                    setOpen(false)
                  }}
                  className="px-[16px] py-[10px] text-left text-[14px] leading-normal text-content-default hover:bg-layout-level-2"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-[12px]">
          <button
            type="button"
            disabled={!reason}
            onClick={() => reason && onConfirm(reason)}
            className={`flex w-[380px] items-center justify-center rounded-[8px] px-[8px] py-[12px] ${
              reason ? 'bg-danger-fg text-white' : 'bg-stroke-interactive text-layout-level-2'
            }`}
          >
            <p className="text-[14px] font-medium leading-normal">Confirmar cancelación</p>
          </button>
          <button type="button" onClick={onCancel} className="text-[12px] leading-normal text-primary-hover">
            Volver y mantener cotización
          </button>
        </div>
      </div>
    </div>
  )
}
