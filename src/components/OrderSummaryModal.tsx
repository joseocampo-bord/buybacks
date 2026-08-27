import { useState } from 'react'

import ModalShell from './ModalShell'
import iconExternalLink from '../assets/quote-detail/icon-external-link.svg'
import iconCalendar from '../assets/quote-detail/icon-calendar.svg'
import iconSend from '../assets/quote-detail/icon-send.svg'
import flagMexico from '../assets/quote-module/flag-mexico.svg'
import flagColombia from '../assets/quote-module/flag-colombia.svg'
import flagArgentina from '../assets/quote-module/flag-argentina.svg'

// "Enviar gestión de buyback al cliente" — Figma node 31778:784946.
// Combines the order summary + due-date picker in a single modal (the
// design has no separate date-picker frame — the date field lives inside
// this modal, so DueDatePicker is folded in here rather than split out).
export default function OrderSummaryModal({
  buybackId,
  client,
  quotedCount,
  rejectedCount,
  totalAmount,
  onCancel,
  onConfirm,
}: {
  buybackId: string
  client: string
  quotedCount: number
  rejectedCount: number
  totalAmount: number
  onCancel: () => void
  onConfirm: (dueDate: string) => void
}) {
  const [dueDate, setDueDate] = useState('')

  return (
    <ModalShell
      title="Enviar gestión de buyback al cliente"
      subtitle="Revisa el resumen antes de confirmar el envío de la gestión."
      onClose={onCancel}
      widthClass="w-[480px]"
      footer={
        <>
          <button
            type="button"
            disabled={!dueDate}
            onClick={() => dueDate && onConfirm(dueDate)}
            className={`flex w-full items-center justify-center gap-[8px] rounded-[8px] px-[8px] py-[12px] ${
              dueDate ? 'bg-primary-default text-primary-fg' : 'bg-stroke-default text-content-secondary'
            }`}
          >
            <img src={iconSend} alt="" className={`size-[14px] ${dueDate ? '' : 'opacity-40'}`} />
            <p className="text-[14px] font-medium leading-normal">Enviar buyback</p>
          </button>
          <button type="button" onClick={onCancel} className="text-[12px] leading-normal text-primary-hover">
            Cancelar
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[16px]">
          <div className="flex items-center justify-between text-[12px] leading-normal">
            <p className="text-content-secondary">N° de buyback</p>
            <p className="text-content-default">{buybackId}</p>
          </div>
          <div className="flex items-center justify-between text-[12px] leading-normal">
            <p className="text-content-secondary">Cliente</p>
            <span className="flex items-center gap-[4px] text-content-default">
              {client}
              <img src={iconExternalLink} alt="" className="size-[12px] opacity-60" />
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] leading-normal">
            <p className="text-content-secondary">País</p>
            <span className="flex items-center text-content-default">
              Varios
              <span className="ml-[4px] flex items-center">
                <img src={flagArgentina} alt="" className="size-[12px] shrink-0 rounded-full" style={{ marginRight: -4 }} />
                <img src={flagColombia} alt="" className="size-[12px] shrink-0 rounded-full" style={{ marginRight: -4 }} />
                <img src={flagMexico} alt="" className="size-[12px] shrink-0 rounded-full" />
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] leading-normal">
            <p className="text-content-secondary">Herramientas cotizadas</p>
            <p className="text-content-default">{quotedCount}</p>
          </div>
          <div className="flex items-center justify-between text-[12px] leading-normal">
            <p className="text-content-secondary">Herramientas rechazadas</p>
            <p className="text-content-default">{rejectedCount}</p>
          </div>
          <div className="flex items-center justify-between text-[12px] leading-normal">
            <p className="text-content-secondary">Monto total</p>
            <p className="font-medium text-content-default">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-2 px-[20px] py-[12px]">
          <p className="text-[12px] font-bold leading-normal text-content-default">Tiempo para aprobación del cliente</p>
          <p className="text-[10px] leading-normal text-content-secondary">
            Si el cliente no aprueba en este plazo, la cotización del buyback se vencerá automáticamente y las
            herramientas no podrán ser compradas.
          </p>
          <div className="flex flex-col gap-[4px]">
            <p className="text-[12px] leading-normal text-content-default">Fecha de vencimiento*</p>
            <label className="flex h-[40px] w-full items-center justify-between rounded-[6px] border border-solid border-stroke-interactive bg-layout-level-1 px-[16px]">
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full bg-transparent text-[14px] text-content-default focus:outline-none [color-scheme:light]"
              />
              <img src={iconCalendar} alt="" className="size-[14px] shrink-0 opacity-70" />
            </label>
          </div>
          <p className="text-[10px] leading-normal text-content-secondary">
            La cotización se vencerá a las 23:59 del día seleccionado
          </p>
        </div>
      </div>
    </ModalShell>
  )
}
