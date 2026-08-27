import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import QuoteList from './pages/QuoteList'
import QuoteDetail from './pages/QuoteDetail'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<QuoteList />} />
          <Route path="/quotes/:id" element={<QuoteDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
