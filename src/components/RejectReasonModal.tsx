import { useState } from 'react'

import ModalShell from './ModalShell'
import iconDropdownChevron from '../assets/quote-detail/icon-dropdown-chevron.svg'

export const REJECT_REASONS = [
  'Mal estado',
  'No enciende',
  'Pantalla dañada',
  'Faltan accesorios',
  'No coincide con la descripción',
  'Otro motivo',
]

// "Rechazar herramienta(s)" — Figma nodes 30357:85644 (single, with a
// tool-summary block) and 30357:89550 / 31432:126793 (bulk, motive-only).
// `toolSummary` is only passed for the single-tool flow.
export default function RejectReasonModal({
  count,
  toolSummary,
  onCancel,
  onConfirm,
}: {
  count: number
  toolSummary?: { model: string; serial: string; specs: string[]; grade: string; country: string } | null
  onCancel: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const [open, setOpen] = useState(false)
  const plural = count > 1
  const buttonLabel = plural ? 'Rechazar herramientas' : 'Rechazar herramienta'

  return (
    <ModalShell
      title={plural ? 'Rechazar herramientas' : 'Rechazar herramienta'}
      subtitle={
        plural
          ? 'Estas herramientas no se incluirán en la oferta enviada al cliente.'
          : 'Esta herramienta no se incluirá en la oferta enviada al cliente.'
      }
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            disabled={!reason}
            onClick={() => reason && onConfirm(reason)}
            className={`flex w-full items-center justify-center gap-[8px] rounded-[8px] border border-solid px-[8px] py-[12px] ${
              reason ? 'border-danger-fg text-danger-fg' : 'border-stroke-default text-content-secondary'
            }`}
          >
            <p className="text-[14px] font-medium leading-normal">{buttonLabel}</p>
          </button>
          <button type="button" onClick={onCancel} className="text-[12px] leading-normal text-primary-hover">
            Cancelar
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-[20px]">
        {toolSummary && (
          <div className="flex flex-col gap-[12px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-2 p-[16px]">
            <div className="flex items-center justify-between text-[12px] leading-normal">
              <p className="text-content-secondary">Modelo</p>
              <p className="text-content-default">{toolSummary.model}</p>
            </div>
            <div className="flex items-center justify-between text-[12px] leading-normal">
              <p className="text-content-secondary">Serial</p>
              <p className="text-content-default">{toolSummary.serial}</p>
            </div>
            <div className="flex items-center justify-between text-[12px] leading-normal">
              <p className="text-content-secondary">Specs</p>
              <div className="flex gap-[4px]">
                {toolSummary.specs.map((spec) => (
                  <span key={spec} className="rounded-[24px] border border-solid border-stroke-default px-[8px] py-[2px] text-content-default">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-[12px] leading-normal">
              <p className="text-content-secondary">Condición</p>
              <p className="text-content-default">{toolSummary.grade}</p>
            </div>
            <div className="flex items-center justify-between text-[12px] leading-normal">
              <p className="text-content-secondary">País</p>
              <p className="text-content-default">{toolSummary.country}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-start rounded-[12px] border border-solid border-stroke-default bg-layout-level-2 px-[20px] py-[12px]">
          <div className="relative flex w-full flex-col items-start gap-[4px]">
            <p className="text-[12px] leading-normal text-content-default">Motivo del rechazo</p>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-[40px] w-full items-center justify-between rounded-[6px] border border-solid border-stroke-interactive bg-layout-level-1 px-[16px]"
            >
              <span className={`text-[14px] leading-normal ${reason ? 'text-content-default' : 'text-content-secondary'}`}>
                {reason || 'Selecciona el motivo'}
              </span>
              <img src={iconDropdownChevron} alt="" className={`size-[14px] transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="absolute top-[64px] z-10 flex w-full flex-col overflow-hidden rounded-[6px] border border-solid border-stroke-default bg-layout-level-1 shadow-[0px_8px_24px_rgba(7,15,33,0.12)]">
                {REJECT_REASONS.map((option) => (
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
            <p className="text-[10px] leading-normal text-content-secondary">
              Podrás revertir este rechazo en cualquier momento desde la tabla.
            </p>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
