// Formatters shared by both perspectives (Soga/QuoteDetail.tsx and
// Dash/BbxDashDetail.tsx) — moved out of QuoteDetail.tsx so neither page owns
// them; they're presentation-only, not tied to either side's model.

export function formatUSD(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
}

export function pluralizeTools(count: number) {
  return `${count} Herramienta${count === 1 ? '' : 's'}`
}

// "DD/MM/YYYY - HH:mm" — used for "Última actualización" timestamps whenever
// an action (either side) happens live in this session.
export function formatNowTimestamp() {
  const now = new Date()
  const date = now.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date} - ${time}`
}

// OrderSummaryModal's <input type="date"> emits "YYYY-MM-DD" — convert to the
// same "DD/MM/YYYY" format used elsewhere (see Buyback.creacion).
export function formatDueDate(dueDate: string) {
  const [year, month, day] = dueDate.split('-')
  return `${day}/${month}/${year}`
}

// Per-country subtotal, alphabetical — reused for "Total del lote" /
// "Total aprobado" breakdowns on both sides.
export function sumByCountry(items: { country: string; price: number | null }[]) {
  return Object.entries(
    items.reduce<Record<string, number>>((acc, t) => {
      acc[t.country] = (acc[t.country] ?? 0) + (t.price ?? 0)
      return acc
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([country, amount]) => ({ country, amount: formatUSD(amount) }))
}
