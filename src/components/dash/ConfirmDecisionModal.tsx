import ModalShell from '../ModalShell'
import { formatUSD } from '../../lib/format'

// Complemento del lado cliente de OrderSummaryModal.tsx (Soga): Martín revisa
// un resumen antes de darle "Enviar buyback" (el paso que manda el BBX a
// `pendiente_aprobacion`); acá el cliente revisa un resumen simétrico antes
// de darle "Confirmar decisión" (el paso que manda el BBX a
// `aprobado`/`aprobado-parcial`/`rechazado` y a la pantalla de Factura) — es
// el mismo tipo de paso, del otro lado del mismo flujo, no uno nuevo
// inventado sin relación. Mismo shell (ModalShell) y mismo patrón de filas
// resumen que OrderSummaryModal, en vez de un banner+botón sin repaso.
export default function ConfirmDecisionModal({
  buybackId,
  approvedCount,
  rejectedCount,
  approvedAmount,
  onCancel,
  onConfirm,
}: {
  buybackId: string
  approvedCount: number
  rejectedCount: number
  approvedAmount: number
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <ModalShell
      title="Confirmar tu decisión"
      subtitle="Revisa el resumen antes de confirmar tu decisión sobre la oferta."
      onClose={onCancel}
      widthClass="w-[480px]"
      footer={
        <>
          <button
            type="button"
            onClick={onConfirm}
            className="flex w-full items-center justify-center gap-[8px] rounded-[8px] bg-primary-default px-[8px] py-[12px] text-primary-fg"
          >
            <p className="text-[14px] font-medium leading-normal">Confirmar decisión</p>
          </button>
          <button type="button" onClick={onCancel} className="text-[12px] leading-normal text-primary-hover">
            Cancelar
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-[16px]">
        <div className="flex items-center justify-between text-[12px] leading-normal">
          <p className="text-content-secondary">N° de buyback</p>
          <p className="text-content-default">{buybackId}</p>
        </div>
        <div className="flex items-center justify-between text-[12px] leading-normal">
          <p className="text-content-secondary">Herramientas aprobadas</p>
          <p className="text-content-default">{approvedCount}</p>
        </div>
        <div className="flex items-center justify-between text-[12px] leading-normal">
          <p className="text-content-secondary">Herramientas rechazadas</p>
          <p className="text-content-default">{rejectedCount}</p>
        </div>
        <div className="flex items-center justify-between text-[12px] leading-normal">
          <p className="text-content-secondary">Total aprobado</p>
          <p className="font-medium text-content-default">{formatUSD(approvedAmount)}</p>
        </div>
      </div>
      <p className="mt-[16px] text-[10px] leading-normal text-content-secondary">
        Después de confirmar, este BBX pasa a facturación — ya no vas a poder cambiar tu decisión sobre estas herramientas.
      </p>
    </ModalShell>
  )
}
