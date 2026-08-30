import { useNavigate } from 'react-router-dom'

import iconNotification from '../../assets/quote-detail/icon-notification.svg'

// Dash's detail-page top bar — per the Figma reference (fileKey
// 1EUxZtg23ladPT9arKzHrA, node 36380:140405/143015): plain breadcrumb
// ("Buybacks / **{id}**", no back-chevron) + a support icon + org badge on
// the right, no search bar (that's DashHeader.tsx, the list page's own top
// bar). "Buybacks" is clickable — same "go back to the list" affordance the
// missing back-chevron would have given, just via the breadcrumb itself.
export default function DashTopBar({ breadcrumbId }: { breadcrumbId: string }) {
  const navigate = useNavigate()

  return (
    <div className="flex h-[64px] w-full shrink-0 items-center justify-between border-b border-solid border-stroke-default bg-layout-level-1 px-[20px]">
      <p className="whitespace-nowrap text-[14px] leading-normal text-content-secondary">
        <button type="button" onClick={() => navigate('/dash')} className="hover:text-content-default">
          Buybacks
        </button>{' '}
        / <span className="font-bold text-content-default">{breadcrumbId}</span>
      </p>

      <div className="flex shrink-0 items-center gap-[16px]">
        <button type="button" className="relative flex size-[20px] shrink-0 items-center justify-center" aria-label="Soporte">
          <img src={iconNotification} alt="" className="size-[20px]" />
        </button>
        <div className="flex shrink-0 items-center gap-[8px] rounded-[24px] border border-solid border-primary-default bg-[#052143] px-[8px] py-[4px]">
          <p className="whitespace-nowrap text-[14px] leading-normal text-content-secondary">ProducTech</p>
          <span className="whitespace-nowrap rounded-[24px] border border-solid border-primary-default bg-[#1c323b] px-[8px] py-[2px] text-[10px] leading-normal text-content-default">
            Platinum
          </span>
        </div>
      </div>
    </div>
  )
}
