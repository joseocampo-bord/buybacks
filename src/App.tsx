import { BrowserRouter, Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import QuoteList from './pages/QuoteList'
import QuoteDetail from './pages/QuoteDetail'
import BbxDashDetail from './pages/BbxDashDetail'
import DashBbxList from './pages/DashBbxList'

// Each page owns its own top bar (QuoteList uses the global search Header,
// QuoteDetail uses its own lightweight breadcrumb bar per Figma) — only the
// Sidebar is shared chrome across routes.
function Layout() {
  return (
    <div className="flex h-screen w-screen bg-layout-background">
      <Sidebar />
      <div className="flex flex-1 min-w-0 flex-col">
        <main className="flex-1 min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Historical alias — anything still linking to /quotes/:id lands on the Soga
// (interna) view, same as before this route split.
function RedirectToSogaBbx() {
  const { id } = useParams()
  return <Navigate to={`/soga/bbx/${encodeURIComponent(id ?? '')}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<QuoteList />} />
          <Route path="/soga/bbx/:id" element={<QuoteDetail />} />
          {/* /quotes/:id se conserva como alias histórico (enlaces ya
              existentes) apuntando a la vista Soga. */}
          <Route path="/quotes/:id" element={<RedirectToSogaBbx />} />
        </Route>

        {/* Dash (cliente) — su propia superficie, own sidebar/topbar oscuro
            (DashSidebar/DashHeader/DashTopBar), pensada para abrirse en otra
            pestaña del navegador, NO nested bajo <Layout> (eso es chrome de
            Soga). /dash es el listado ("Mis buybacks"); /dash/bbx/:id el
            detalle — misma fuente de verdad que /soga/bbx/:id (mismo store,
            ver src/store/bbxStore.ts, sincronizado entre pestañas vía
            localStorage + BroadcastChannel). */}
        <Route path="/dash" element={<DashBbxList />} />
        <Route path="/dash/bbx/:id" element={<BbxDashDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
