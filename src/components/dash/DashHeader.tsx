import headerSearch from '../../assets/layout/header-search.svg'

// Dash's list-page top bar — per the Figma reference (fileKey
// 1EUxZtg23ladPT9arKzHrA, node I36380:414358;7145:412532): "Buybacks" title +
// search input + org badge on the right. Trimmed vs. the reference (no
// support/headset button, no country selector, no live account data — this
// harness has no auth/org backing any of that) down to the structural chrome
// that actually matters for this screen. Separate component from
// DashTopBar.tsx (the detail page's breadcrumb bar) — same convention Soga
// already uses (Header.tsx for the list vs. DetailTopBar.tsx for the detail).
export default function DashHeader() {
  return (
    <div className="relative flex h-[64px] shrink-0 items-center justify-between border-b border-solid border-stroke-default bg-layout-level-1 px-[20px]">
      <p className="w-[144px] shrink-0 text-[16px] font-medium leading-normal text-content-secondary">Buybacks</p>

      <div className="mx-auto flex h-[40px] w-[580px] items-center">
        <div className="flex h-[40px] w-full items-center gap-[8px] rounded-[6px] border border-solid border-stroke-interactive bg-layout-background px-[16px]">
          <img src={headerSearch} alt="" className="size-[14px] shrink-0 opacity-70" />
          <input
            type="text"
            placeholder="Busca por número de buyback o número de referencia interna"
            className="w-full min-w-0 flex-1 bg-transparent text-[14px] text-content-default placeholder:text-content-secondary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[8px] rounded-[24px] border border-solid border-primary-default bg-[#052143] px-[8px] py-[4px]">
        <p className="whitespace-nowrap text-[14px] leading-normal text-content-secondary">ProducTech</p>
        <span className="whitespace-nowrap rounded-[24px] border border-solid border-primary-default bg-[#1c323b] px-[8px] py-[2px] text-[10px] leading-normal text-content-default">
          Platinum
        </span>
      </div>
    </div>
  )
}
