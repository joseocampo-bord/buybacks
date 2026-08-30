import iconCalendar from '../../assets/quote-module/icon-calendar.svg'

// Same pattern as Soga's InfoBanner.tsx, Dash's own copy per the Figma
// reference: "Tiempo estimado de cotización" (client-facing framing) instead
// of Soga's internal "SLA de la cotización".
export default function DashInfoBanner() {
  return (
    <div className="flex items-center gap-[8px]">
      <div className="flex items-center gap-[4px]">
        <img src={iconCalendar} alt="" className="size-[12px] shrink-0 opacity-60" />
        <p className="whitespace-nowrap text-[12px] leading-normal text-content-secondary">Tiempo estimado de cotización</p>
      </div>
      <p className="whitespace-nowrap text-[12px] font-bold leading-normal text-content-secondary">24 horas</p>
    </div>
  )
}
