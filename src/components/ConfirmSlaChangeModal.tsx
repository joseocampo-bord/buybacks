// Confirms an SLA change in either direction — extending to CTO or reverting
// to Regular both notify the client, so both need explicit confirmation
// (double-confirmation, not just the dropdown selection). No exact Figma
// frame was fetched for this (new SLA-extension flow, outside the buyback-
// management flow already built) — built from a user-provided reference
// screenshot for the CTO direction, mirrored for Regular. The warning glyph
// is drawn with CSS (a bordered circle + text "!"), not a fabricated vector
// icon, since no matching asset was available to download.
const COPY = {
  cto: {
    title: 'Marcar como CTO',
    description: 'Al marcar como CTO, se ampliará el tiempo del SLA y se informará al cliente sobre esta modificación.',
    confirmLabel: 'Marcar como CTO',
  },
  regular: {
    title: 'Volver a SLA regular',
    description: 'Al volver a SLA regular, se reducirá el tiempo del SLA y se informará al cliente sobre esta modificación.',
    confirmLabel: 'Volver a Regular',
  },
} as const

export default function ConfirmSlaChangeModal({
  target,
  onCancel,
  onConfirm,
}: {
  target: 'cto' | 'regular'
  onCancel: () => void
  onConfirm: () => void
}) {
  const copy = COPY[target]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070f21]/40 p-[24px]" onClick={onCancel}>
      <div
        className="flex w-[480px] flex-col items-center gap-[24px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 px-[40px] py-[40px] shadow-[0px_16px_40px_rgba(7,15,33,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex size-[64px] shrink-0 items-center justify-center rounded-full bg-danger-bg">
          <div className="flex size-[40px] items-center justify-center rounded-full border-[3px] border-solid border-danger-fg">
            <span className="text-[20px] font-bold leading-none text-danger-fg">!</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-[8px] text-center">
          <p className="text-[20px] font-bold leading-normal text-content-default">{copy.title}</p>
          <p className="max-w-[360px] text-[13px] leading-normal text-content-secondary">{copy.description}</p>
        </div>

        <div className="flex w-full items-center gap-[12px]">
          <button
            type="button"
            onClick={onCancel}
            className="flex flex-1 items-center justify-center rounded-[8px] border border-solid border-primary-default px-[8px] py-[12px]"
          >
            <p className="text-[14px] font-medium leading-normal text-primary-default">Cancelar</p>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center rounded-[8px] bg-primary-default px-[8px] py-[12px]"
          >
            <p className="text-[14px] font-medium leading-normal text-primary-fg">{copy.confirmLabel}</p>
          </button>
        </div>
      </div>
    </div>
  )
}
