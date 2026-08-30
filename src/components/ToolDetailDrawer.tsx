import iconModalClose from '../assets/quote-detail/icon-modal-close.svg'
import iconInfo from '../assets/quote-detail/icon-info.svg'
import iconBrandApple from '../assets/quote-detail/icon-brand-apple.svg'
import iconQr from '../assets/quote-detail/icon-qr.svg'
import iconDownload from '../assets/quote-detail/icon-download.svg'
import statusDotSuccess from '../assets/quote-detail/status-dot-success.svg'
import iconEditPencil from '../assets/quote-detail/icon-edit-pencil.svg'
import iconLocationPin from '../assets/quote-detail/icon-location-pin.svg'
import dividerThin from '../assets/quote-detail/divider-thin.svg'
import toolCoverPhoto from '../assets/quote-detail/tool-cover-photo.png'
import avatarClientTool from '../assets/quote-detail/avatar-client-tool.png'

// "Interna de la herramienta" right-side drawer — Figma node 30357:43720
// ("Se abre el modal con el detalle de la herramienta"), triggered only from
// "Ver detalle" — the DSN link is a separate action, not wired to this drawer.
// The reference renders on a white/#fafafa surface already, so this is a
// close 1:1 port onto this project's tokens.
function Row({ label, value, editable }: { label: string; value: React.ReactNode; editable?: boolean }) {
  return (
    <div className="flex w-full items-center justify-between rounded-[12px] bg-layout-level-1 p-[12px]">
      <p className="text-[14px] leading-normal text-content-secondary">{label}</p>
      <div className="flex items-center gap-[6px]">
        <div className="text-[14px] leading-normal text-content-default">{value}</div>
        {editable && (
          <button type="button" disabled aria-label="Editar (deshabilitado)" className="cursor-not-allowed opacity-40">
            <img src={iconEditPencil} alt="" className="size-[12px]" />
          </button>
        )}
      </div>
    </div>
  )
}

function formatUSD(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
}

export default function ToolDetailDrawer({
  model,
  serial,
  specs,
  ofertaHistorial,
  onClose,
}: {
  model: string
  serial: string
  specs: string[]
  /** Ofertas previas enviadas a aprobación para este mismo SKU+país
      (pendiente_aprobacion, "Ver oferta" flow). Null/[] oculta el bloque de
      historial por completo — no se renderiza ni vacío. */
  ofertaHistorial?: { fecha: string; montoUsd: number }[] | null
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#070f21]/40" onClick={onClose}>
      <div
        className="flex h-full w-[480px] flex-col overflow-y-auto border-l border-solid border-stroke-default bg-layout-level-2"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center gap-[12px] border-b border-solid border-stroke-default bg-layout-level-1 p-[8px]">
          <p className="flex-1 text-center text-[14px] font-bold leading-normal text-content-default">
            Interna de la herramienta
          </p>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-[16px]">
            <img src={iconModalClose} alt="" className="size-[16px]" />
          </button>
        </div>

        <div className="flex flex-col gap-[16px] p-[16px]">
          <div className="flex items-center gap-[15px]">
            <div className="size-[74px] shrink-0 overflow-hidden rounded-[11px] border border-solid border-stroke-default">
              <img src={toolCoverPhoto} alt="" className="size-full object-cover" />
            </div>
            <div className="flex flex-col items-start gap-[8px]">
              <div className="flex h-[18px] items-center gap-[4px] rounded-[24px] bg-danger-bg px-[8px]">
                <p className="text-[10px] leading-normal text-danger-fg">No gestionable</p>
                <img src={iconInfo} alt="" className="size-[10px]" />
              </div>
              <div className="flex items-center gap-[8px]">
                <p className="text-[20px] font-bold leading-normal text-content-default">{model}</p>
                <img src={iconBrandApple} alt="" className="h-[16px] w-[12px]" />
              </div>
              <div className="flex items-center gap-[4px]">
                {specs.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-[6px] border border-solid border-stroke-default bg-layout-level-1 p-[4px] text-[10px] leading-normal text-content-default"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <button type="button" className="rounded-[6px] bg-content-default px-[16px] py-[12px] text-[12px] font-medium leading-normal text-white">
                General
              </button>
              <button type="button" className="rounded-[6px] border border-solid border-stroke-interactive px-[16px] py-[12px] text-[12px] leading-normal text-content-default">
                Info. de la herramienta
              </button>
              <button type="button" className="rounded-[6px] border border-solid border-stroke-interactive px-[16px] py-[12px] text-[12px] leading-normal text-content-default">
                Historial
              </button>
            </div>
            <div className="flex items-center gap-[8px]">
              {/* Última inspección de la herramienta — sólo descarga, no hay
                  affordance de edición (regla de "Pendiente de aprobación":
                  la inspección no se puede editar desde acá). Sin backend de
                  archivos en este mock, igual que "Descargar QR" al lado. */}
              <button type="button" className="flex items-center gap-[8px] rounded-[6px] bg-content-default px-[8px] py-[8px]">
                <img src={iconDownload} alt="" className="size-[12px] brightness-0 invert" />
                <p className="whitespace-nowrap text-[10px] leading-normal text-white">Descargar inspección</p>
              </button>
              <button type="button" className="flex items-center gap-[8px] rounded-[6px] bg-content-default px-[8px] py-[8px]">
                <img src={iconQr} alt="" className="size-[12px]" />
                <p className="whitespace-nowrap text-[10px] leading-normal text-white">Descargar QR</p>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <Row label="Cliente:" value={<span className="flex items-center gap-[6px]">
              <img src={avatarClientTool} alt="" className="size-[24px] rounded-full border border-solid border-stroke-interactive object-cover" />
              Zeplin
            </span>} />
            <Row
              label="Estado:"
              value={
                <span className="flex items-center gap-[4px] text-success-fg">
                  <img src={statusDotSuccess} alt="" className="size-[8px]" />
                  Disponible
                </span>
              }
              editable
            />
            <div className="flex flex-col gap-[24px] rounded-[12px] bg-layout-level-1 p-[12px]">
              <div className="flex items-center justify-between text-[14px] leading-normal">
                <p className="text-content-secondary">Serial:</p>
                <p className="text-content-default">{serial}</p>
              </div>
              <div className="flex items-center justify-between text-[14px] leading-normal">
                <p className="text-content-secondary">SKU:</p>
                <p className="text-content-default">LAPP-MACAIR-13-M4-16-512-0001</p>
              </div>
              <div className="flex items-center justify-between text-[14px] leading-normal">
                <p className="text-content-secondary">Tipo:</p>
                <p className="text-content-default">Herramienta Bord</p>
              </div>
              <div className="flex items-center justify-between text-[14px] leading-normal">
                <p className="text-content-secondary">Ubicación:</p>
                <span className="flex items-center gap-[4px]">
                  <img src={iconLocationPin} alt="" className="size-[16px]" />
                  <p className="text-[12px] text-content-default">Bodega Mexico</p>
                </span>
              </div>
            </div>
            <Row label="Condición:" value="Usado como nuevo" editable />
            <div className="flex flex-col gap-[12px] rounded-[12px] bg-layout-level-1 p-[12px]">
              <p className="text-[14px] leading-normal text-content-secondary">Estado del sistema:</p>
              <img src={dividerThin} alt="" className="h-px w-full" />
              <p className="text-[14px] leading-normal text-content-secondary">No se han aplicado servicios adicionales</p>
            </div>
            <div className="flex flex-col gap-[12px] rounded-[12px] bg-layout-level-1 p-[12px]">
              <p className="text-[14px] leading-normal text-content-secondary">Comentario:</p>
              <img src={dividerThin} alt="" className="h-px w-full" />
              <p className="text-[14px] leading-normal text-content-secondary">Esta herramienta no tiene comentario...</p>
            </div>

            {/* Historial de ofertas enviadas a aprobación para este mismo
                SKU+país — sólo se renderiza si hay algo que mostrar. Si
                `ofertaHistorial` viene null/vacío el bloque entero se oculta,
                no se muestra un estado vacío. */}
            {ofertaHistorial && ofertaHistorial.length > 0 && (
              <div className="flex flex-col gap-[12px] rounded-[12px] bg-layout-level-1 p-[12px]">
                <p className="text-[14px] leading-normal text-content-secondary">Historial de ofertas:</p>
                <img src={dividerThin} alt="" className="h-px w-full" />
                <div className="flex flex-col gap-[8px]">
                  {ofertaHistorial.map((entry) => (
                    <div key={entry.fecha} className="flex items-center justify-between text-[12px] leading-normal">
                      <span className="text-content-secondary">{entry.fecha}</span>
                      <span className="text-content-default">
                        <span className="font-medium">{formatUSD(entry.montoUsd)}</span> enviado a aprobación
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
