import { useState } from 'react'

import ModalShell from '../ModalShell'
import iconDropdownChevron from '../../assets/quote-detail/icon-dropdown-chevron.svg'
import { CLIENT_REJECT_REASONS, CLIENT_REJECT_REASON_LABEL, type ClientRejectReason } from '../../store/bbxStore'

// Client-facing "Rechazar herramienta(s)" — Dash's own closed catalog
// (Precio / Tiempo estimado de respuesta / No aprobado internamente / Otro),
// distinct from RejectReasonModal.tsx (that one's Bord's own pre-oferta
// reasons). Visually the same shell/pattern as the rest of the app's reason
// pickers (ModalShell + dropdown). `model` singular vs `count` plural mirrors
// Soga's own RejectReasonModal (single-tool summary vs bulk, no summary) —
// bulk rechazo per doc "BBX · Dash" §1 ("aprobación/rechazo también masivo
// por selección").
export default function ClientRejectReasonModal({
  model,
  count = 1,
  onCancel,
  onConfirm,
}: {
  model?: string
  count?: number
  onCancel: () => void
  onConfirm: (reason: ClientRejectReason) => void
}) {
  const [reason, setReason] = useState<ClientRejectReason | null>(null)
  const [open, setOpen] = useState(false)
  const plural = count > 1
  const title = plural ? 'Rechazar herramientas' : 'Rechazar herramienta'

  return (
    <ModalShell
      title={title}
      subtitle={
        plural
          ? `No aprobarás la oferta de Bord para las ${count} herramientas seleccionadas.`
          : `No aprobarás la oferta de Bord para "${model}".`
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
            <p className="text-[14px] font-medium leading-normal">{title}</p>
          </button>
          <button type="button" onClick={onCancel} className="text-[12px] leading-normal text-primary-hover">
            Cancelar
          </button>
        </>
      }
    >
      <div className="flex flex-col items-start rounded-[12px] border border-solid border-stroke-default bg-layout-level-2 px-[20px] py-[12px]">
        <div className="relative flex w-full flex-col items-start gap-[4px]">
          <p className="text-[12px] leading-normal text-content-default">Motivo del rechazo</p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-[40px] w-full items-center justify-between rounded-[6px] border border-solid border-stroke-interactive bg-layout-level-1 px-[16px]"
          >
            <span className={`text-[14px] leading-normal ${reason ? 'text-content-default' : 'text-content-secondary'}`}>
              {reason ? CLIENT_REJECT_REASON_LABEL[reason] : 'Selecciona el motivo'}
            </span>
            <img src={iconDropdownChevron} alt="" className={`size-[14px] transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute top-[64px] z-10 flex w-full flex-col overflow-hidden rounded-[6px] border border-solid border-stroke-default bg-layout-level-1 shadow-[0px_8px_24px_rgba(7,15,33,0.12)]">
              {CLIENT_REJECT_REASONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setReason(option)
                    setOpen(false)
                  }}
                  className="px-[16px] py-[10px] text-left text-[14px] leading-normal text-content-default hover:bg-layout-level-2"
                >
                  {CLIENT_REJECT_REASON_LABEL[option]}
                </button>
              ))}
            </div>
          )}
          <p className="text-[10px] leading-normal text-content-secondary">
            Podrás cambiar esta decisión mientras la oferta siga vigente.
          </p>
        </div>
      </div>
    </ModalShell>
  )
}
