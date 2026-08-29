import { useNavigate } from 'react-router-dom'
import BuybackCard from './BuybackCard'
import { BUYBACKS_BY_TAB, type TabKey } from '../data/buybacks'

export default function BuybackTable({ tab }: { tab: TabKey }) {
  const navigate = useNavigate()
  const rows = BUYBACKS_BY_TAB[tab]

  if (rows.length === 0) {
    return (
      <div className="flex w-full items-center justify-center rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 py-[48px]">
        <p className="text-[14px] leading-normal text-content-secondary">No hay buybacks en este estado.</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-start gap-[12px]">
      {rows.map((buyback) => (
        <BuybackCard
          key={buyback.bbId}
          buyback={buyback}
          tab={tab}
          onRowClick={() => navigate(`/quotes/${encodeURIComponent(buyback.bbId)}`)}
        />
      ))}
    </div>
  )
}
