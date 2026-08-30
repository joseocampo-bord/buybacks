import ModalShell from './ModalShell'

export type HistorialEntry = {
  fecha: string
  usuario: string
  estadoAnterior: string
  estadoNuevo: string
  motivo?: string
}

// "Historial y auditoría siempre disponibles" — mismo componente reutilizado
// en las 6 vistas del BBX (por_cotizar → pendiente_aprobacion → por_facturar →
// comprada/vencida/cancelada), cableado desde el botón "Ver historial" que ya
// existía en la última-actualización card (antes sin onClick). Cada fila es un
// cambio de estado real: fecha/hora, usuario, estado anterior → nuevo, motivo.
export default function HistorialModal({ entries, onClose }: { entries: HistorialEntry[]; onClose: () => void }) {
  return (
    <ModalShell title="Historial del buyback" subtitle="Cambios de estado registrados, del más reciente al más antiguo." onClose={onClose} widthClass="w-[640px]">
      {entries.length === 0 ? (
        <p className="text-[12px] leading-normal text-content-secondary">Todavía no hay cambios de estado registrados.</p>
      ) : (
        <div className="flex max-h-[400px] flex-col gap-[8px] overflow-y-auto">
          {entries.map((entry, i) => (
            <div
              key={`${entry.fecha}-${i}`}
              className="flex flex-col gap-[6px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-2 p-[12px]"
            >
              <div className="flex items-center justify-between gap-[12px]">
                <p className="whitespace-nowrap text-[11px] leading-normal text-content-secondary">{entry.fecha}</p>
                <p className="whitespace-nowrap text-[11px] leading-normal text-content-secondary">{entry.usuario}</p>
              </div>
              <p className="text-[13px] leading-normal text-content-default">
                <span className="text-content-secondary">{entry.estadoAnterior}</span> → <span className="font-medium">{entry.estadoNuevo}</span>
              </p>
              {entry.motivo && <p className="text-[12px] leading-normal text-content-secondary">{entry.motivo}</p>}
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  )
}
