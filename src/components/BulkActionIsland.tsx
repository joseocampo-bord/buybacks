import iconCheck from '../assets/quote-detail/icon-check.svg'
import iconX from '../assets/quote-detail/icon-x.svg'

// Floating bulk-action bar — Figma "Modo de cotización masiva (isla
// flotante abajo)" (30322:36195), seen anchored bottom-center in the
// 30357:75785 / 30357:82696 bulk-flow frames. The reference renders it as a
// dark #070f21 bar; converted to a light floating card (bg-layout-level-1 +
// shadow) to match this project's all-light surface convention — the same
// treatment already used for the metric-group card and header card.
export default function BulkActionIsland({
  count,
  price,
  onPriceChange,
  onConfirmPrice,
  onReject,
  onClose,
}: {
  count: number
  price: string
  onPriceChange: (value: string) => void
  onConfirmPrice: () => void
  onReject: () => void
  onClose: () => void
}) {
  const priceValue = Number.parseFloat(price)
  const canConfirm = price.trim() !== '' && !Number.isNaN(priceValue) && priceValue > 0

  return (
    <div className="fixed bottom-[24px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-[16px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 px-[16px] py-[10px] shadow-[0px_16px_40px_rgba(7,15,33,0.16)]">
      <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-default">
        {count} herramienta{count === 1 ? '' : 's'} seleccionada{count === 1 ? '' : 's'}
      </p>
      <div className="h-[24px] w-px bg-stroke-default" />
      <p className="whitespace-nowrap text-[12px] leading-normal text-content-secondary">Precio final con impuestos:</p>
      <div
        className={`flex h-[32px] w-[120px] items-center gap-[4px] rounded-[8px] border-2 border-solid bg-layout-level-1 px-[10px] ${
          canConfirm ? 'border-primary-default' : 'border-stroke-interactive'
        }`}
      >
        <span className="shrink-0 text-[11px] text-content-secondary opacity-70">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={price}
          onChange={(event) => onPriceChange(event.target.value)}
          placeholder="0.00"
          className="w-full min-w-0 bg-transparent text-[12px] text-content-default placeholder:text-content-secondary focus:outline-none"
        />
        <span className="shrink-0 text-[11px] text-content-secondary opacity-70">USD</span>
      </div>
      {/* Confirm = solid filled primary pill with a white check, reject = soft
          danger fill, borderless — matches the per-row price editor. */}
      <button
        type="button"
        aria-label="Confirmar precio para la selección"
        disabled={!canConfirm}
        onClick={onConfirmPrice}
        className={`flex size-[32px] shrink-0 items-center justify-center rounded-[10px] ${
          canConfirm ? 'bg-primary-default' : 'bg-stroke-default'
        }`}
      >
        <img src={iconCheck} alt="" className="size-[14px] brightness-0 invert" />
      </button>
      <button
        type="button"
        aria-label="Rechazar selección"
        onClick={onReject}
        className="flex size-[32px] shrink-0 items-center justify-center rounded-[10px] bg-danger-bg"
      >
        <img src={iconX} alt="" className="size-[14px]" />
      </button>
      <button type="button" onClick={onClose} className="whitespace-nowrap text-[12px] font-medium leading-normal text-primary-hover">
        Cerrar
      </button>
    </div>
  )
}
