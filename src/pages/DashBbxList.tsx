import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashSidebar from '../components/dash/DashSidebar'
import DashHeader from '../components/dash/DashHeader'
import DashQuickButton from '../components/dash/DashQuickButton'
import DashFilterBar from '../components/dash/DashFilterBar'
import DashInfoBanner from '../components/dash/DashInfoBanner'
import DashTabsBar from '../components/dash/DashTabsBar'
import DashBbxCard from '../components/dash/DashBbxCard'
import { dashBuybacksForTab, type DashTabKey } from '../data/buybacks'

// Dash's own list screen ("Mis buybacks") — per the Figma reference (fileKey
// 1EUxZtg23ladPT9arKzHrA, node 36380:414356, "Quotes-module"). This is the
// natural in-app way to reach a BBX from Dash's side (click a card's
// "Consultar" → /dash/bbx/:id) instead of typing the detail URL by hand.
// Reads the SAME mock records as Soga's list (data/buybacks.ts's
// BUYBACKS_BY_TAB, via dashBuybacksForTab) — no separate Dash dataset, just
// Dash's own tab grouping over the same estados (see DASH_TAB_CONFIG).
export default function DashBbxList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DashTabKey>('recibido')
  const rows = dashBuybacksForTab(activeTab)

  return (
    <div className="dash-theme flex h-screen w-screen bg-layout-background">
      <DashSidebar />
      <div className="flex flex-1 min-w-0 flex-col">
        <DashHeader />
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="flex w-full flex-col items-start gap-[16px] p-[20px]">
            <DashQuickButton />

            <div className="flex w-full items-start justify-between gap-[20px]">
              <DashFilterBar />
            </div>

            <div className="flex w-full flex-col items-start gap-[16px]">
              <DashTabsBar activeTab={activeTab} onChange={setActiveTab} />
              <DashInfoBanner />

              {rows.length === 0 ? (
                <div className="flex w-full items-center justify-center rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 py-[48px]">
                  <p className="text-[14px] leading-normal text-content-secondary">No hay buybacks en este estado.</p>
                </div>
              ) : (
                <div className="flex w-full flex-col items-start gap-[12px]">
                  {rows.map((buyback) => (
                    <DashBbxCard
                      key={buyback.bbId}
                      buyback={buyback}
                      onConsultar={() => navigate(`/dash/bbx/${encodeURIComponent(buyback.bbId)}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
