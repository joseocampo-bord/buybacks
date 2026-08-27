import iconFilter from '../assets/quote-module/icon-filter.svg'
import iconChevron from '../assets/quote-module/icon-chevron.svg'
import iconSort from '../assets/quote-module/icon-sort.svg'

const FILTERS = ['Empresa', 'País', 'Responsable', 'SLA y ETA', 'Marca', 'Tipo']

function FilterButton({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-[8px] rounded-[8px] border border-solid border-stroke-default bg-layout-level-1 p-[8px]">
      <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-content-secondary">
        {label}
      </p>
      <img src={iconChevron} alt="" className="size-[12px] shrink-0 opacity-60" />
    </div>
  )
}

export default function FilterBar() {
  return (
    <div className="flex w-full items-center gap-[12px]">
      <div className="flex items-center gap-[8px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-2 px-[8px] py-[4px]">
        <img src={iconFilter} alt="" className="size-[14px] shrink-0 opacity-60" />
        <div className="flex items-center gap-[8px]">
          {FILTERS.map((label) => (
            <FilterButton key={label} label={label} />
          ))}
        </div>
      </div>

      <button type="button" className="flex shrink-0 items-center gap-[4px]">
        <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">Ordenar</p>
        <img src={iconSort} alt="" className="size-[18px] shrink-0" />
      </button>
    </div>
  )
}
