import iconToastCheckCircle from '../assets/quote-detail/icon-toast-check-circle.svg'
import iconToastClose from '../assets/quote-detail/icon-toast-close.svg'

// Success toast — Figma node 26439:16757. Converted from the dark reference
// (bg #070f21 blur, white body text) to this project's light success tokens.
// Positioned top-right per explicit product direction — overrides the Figma
// component's own doc note ("se debe alinear siempre a la izquierda").
export default function Toast({
  title,
  message,
  onClose,
}: {
  title: string
  message: string
  onClose: () => void
}) {
  return (
    <div className="fixed right-[40px] top-[32px] z-[60] flex w-[480px] items-center gap-[16px] rounded-[8px] border border-solid border-success-fg bg-success-bg p-[16px] shadow-[0px_16px_40px_rgba(7,15,33,0.16)]">
      <img src={iconToastCheckCircle} alt="" className="size-[24px] shrink-0" />
      <div className="flex flex-1 flex-col items-start gap-[4px]">
        <p className="w-full text-[16px] font-bold leading-normal text-success-fg">{title}</p>
        <p className="w-full text-[14px] leading-normal text-content-default">{message}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Cerrar" className="shrink-0">
        <img src={iconToastClose} alt="" className="size-[18px]" />
      </button>
    </div>
  )
}
