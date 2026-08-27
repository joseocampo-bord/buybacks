import Header from '../components/Header'
import FilterBar from '../components/FilterBar'
import { PillTabs, UnderlineTabsWithCta } from '../components/TabsBar'
import InfoBanner from '../components/InfoBanner'
import BuybackTable from '../components/BuybackTable'

export default function QuoteList() {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="p-[20px]">
        <div className="flex w-full flex-col items-start gap-[28px]">
          <div className="flex w-full items-start justify-between gap-[20px]">
            <FilterBar />
            <PillTabs />
          </div>

          <div className="flex w-full flex-col items-start gap-[16px]">
            <UnderlineTabsWithCta />
            <InfoBanner />
            <BuybackTable />
          </div>
        </div>
      </div>
    </div>
  )
}
