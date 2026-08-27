import iconCalendar from '../assets/quote-module/icon-calendar.svg'

export default function InfoBanner() {
  return (
    <div className="flex items-center gap-[8px]">
      <div className="flex items-center gap-[4px]">
        <img src={iconCalendar} alt="" className="size-[12px] shrink-0 opacity-60" />
        <p className="whitespace-nowrap text-[12px] leading-normal text-content-secondary">
          SLA de la cotización
        </p>
      </div>
      <p className="whitespace-nowrap text-[12px] font-bold leading-normal text-content-secondary">
        24hrs
      </p>
    </div>
  )
}
