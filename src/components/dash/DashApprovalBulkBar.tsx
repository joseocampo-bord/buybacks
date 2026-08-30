import iconCheck from '../../assets/quote-detail/icon-check.svg'
import iconX from '../../assets/quote-detail/icon-x.svg'

// Floating bulk-action bar for Dash's "Requiere tu revisión" — mismo patrón
// visual que Soga's BulkActionIsland.tsx ("aprobación/rechazo también masivo
// por selección... mismo patrón de 'ofertar precio' en Soga, en dark", doc
// "BBX · Dash"), sólo que aprueba/rechaza en vez de fijar un precio (Dash no
// pone precios, sólo decide sobre los que Bord ya ofertó).
export default function DashApprovalBulkBar({
  count,
  onApprove,
  onReject,
  onClose,
}: {
  count: number
  onApprove: () => void
  onReject: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed bottom-[24px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-[16px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 px-[16px] py-[10px] shadow-[0px_16px_40px_rgba(7,15,33,0.16)]">
      <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">
        {count} herramienta{count === 1 ? '' : 's'} seleccionada{count === 1 ? '' : 's'}
      </p>
      <div className="h-[24px] w-px bg-stroke-default" />
      <button
        type="button"
        onClick={onApprove}
        className="flex h-[32px] items-center gap-[6px] rounded-[8px] bg-success-fg px-[12px] text-white"
      >
        <img src={iconCheck} alt="" className="size-[12px] brightness-0 invert" />
        <p className="whitespace-nowrap text-[12px] font-medium leading-normal">Aprobar seleccionadas</p>
      </button>
      <button
        type="button"
        onClick={onReject}
        className="flex h-[32px] items-center gap-[6px] rounded-[8px] bg-danger-bg px-[12px] text-danger-fg"
      >
        <img src={iconX} alt="" className="size-[12px]" />
        <p className="whitespace-nowrap text-[12px] font-medium leading-normal">Rechazar seleccionadas</p>
      </button>
      <button type="button" onClick={onClose} className="whitespace-nowrap text-[12px] font-medium leading-normal text-primary-hover">
        Cerrar
      </button>
    </div>
  )
}
