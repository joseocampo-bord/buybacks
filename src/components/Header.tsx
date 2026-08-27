import headerSearch from '../assets/layout/header-search.svg'

export default function Header() {
  return (
    <div className="relative flex h-[64px] shrink-0 items-center border-b border-solid border-stroke-default bg-layout-level-1 px-[20px]">
      <p className="w-[144px] shrink-0 text-[16px] font-medium leading-normal text-content-default">
        Buybacks
      </p>

      <div className="mx-auto flex h-[40px] w-[448px] items-center">
        <div className="flex h-[40px] w-full items-center gap-[8px] rounded-[6px] border border-solid border-stroke-default px-[16px]">
          <img src={headerSearch} alt="" className="size-[14px] shrink-0 opacity-60" />
          <input
            type="text"
            placeholder="Busca por ID, cliente, modelo, serial..."
            className="w-full min-w-0 flex-1 bg-transparent text-[14px] text-content-default placeholder:text-content-secondary focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
