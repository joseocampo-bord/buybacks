import flagMexico from '../../assets/quote-module/flag-mexico.svg'
import flagColombia from '../../assets/quote-module/flag-colombia.svg'
import flagArgentina from '../../assets/quote-module/flag-argentina.svg'
import flagTurkey from '../../assets/quote-module/flag-turkey.svg'
import flagVenezuela from '../../assets/quote-module/flag-venezuela.svg'
import statusDotInformative from '../../assets/quote-detail/status-dot-informative.svg'
import statusDotWarning from '../../assets/quote-detail/status-dot-warning.svg'
import statusDotDanger from '../../assets/quote-detail/status-dot-danger.svg'

import { dashRecibidoSubestado, type Buyback, type ClienteVencimientoSemaforo, type CountryFlag } from '../../data/buybacks'

const FLAGS: Record<CountryFlag, string> = {
  mexico: flagMexico,
  colombia: flagColombia,
  argentina: flagArgentina,
  turkey: flagTurkey,
  venezuela: flagVenezuela,
}

const SEMAFORO_DOT: Record<ClienteVencimientoSemaforo, string> = {
  ok: statusDotInformative,
  warning: statusDotWarning,
  vencido: statusDotDanger,
}

// The client's own id label — the same underlying bbId used for routing/the
// store key (`/dash/bbx/:id`, `findBuyback`), just re-prefixed "Q°" instead
// of "BB°" for display, per the Figma reference ("Q°1234"). Cosmetic only:
// no second id scheme, no change to the data model.
function clientLabel(bbId: string) {
  return bbId.replace('BB°', 'Q°')
}

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex w-[180px] shrink-0 flex-col items-start gap-[8px]">
      <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-normal text-content-secondary">{title}</p>
      {children}
    </div>
  )
}

export default function DashBbxCard({ buyback, onConsultar }: { buyback: Buyback; onConsultar: () => void }) {
  const flags = buyback.paises
  const mainFlag = flags[0]
  // Sólo distingue algo dentro del tab "Recibido" (por_cotizar vs
  // pendiente_aprobacion) — null en cualquier otro tab, per doc "BBX · Dash"
  // decisión abierta 2.
  const subestado = dashRecibidoSubestado(buyback.estado)

  return (
    <div className="flex w-full items-center gap-[32px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 py-[16px]">
      <div className="flex flex-col items-start gap-[4px] pl-[16px]">
        <div className="flex items-center gap-[4px]">
          <img src={FLAGS[mainFlag]} alt="" className="size-[14px] shrink-0 rounded-full" />
          <p className="whitespace-nowrap text-[16px] font-bold capitalize leading-normal text-content-default">
            {flags.length > 1 ? 'Varios' : mainFlag}
          </p>
        </div>
        <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">{clientLabel(buyback.bbId)}</p>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-between gap-y-[24px] pr-[16px]">
        <Field title="Solicitado por">
          <p className="truncate text-[12px] leading-normal text-content-default">{buyback.solicitadoPor}</p>
        </Field>

        <Field title="N° de herramientas">
          <p className="text-[12px] leading-normal text-content-default">{buyback.herramientas.total}</p>
        </Field>

        {subestado && (
          <Field title="Estado">
            <div className="flex items-center gap-[4px]">
              <img src={subestado.tone === 'warning' ? statusDotWarning : statusDotInformative} alt="" className="size-[8px] shrink-0" />
              <p className="text-[12px] leading-normal text-content-default">{subestado.label}</p>
            </div>
          </Field>
        )}

        {buyback.vencimientoCliente ? (
          <Field title="Tienes hasta">
            <div className="flex items-center gap-[4px]">
              <img src={SEMAFORO_DOT[buyback.vencimientoCliente.semaforo]} alt="" className="size-[8px] shrink-0" />
              <p className="text-[12px] leading-normal text-content-default">{buyback.vencimientoCliente.fecha}</p>
            </div>
          </Field>
        ) : (
          buyback.tiempoTranscurrido && (
            <Field title="Solicitada hace">
              <div className="flex items-center gap-[4px]">
                <img src={SEMAFORO_DOT[buyback.tiempoTranscurrido.semaforo]} alt="" className="size-[8px] shrink-0" />
                <p className="text-[12px] leading-normal text-content-default">
                  {buyback.tiempoTranscurrido.valor} {buyback.tiempoTranscurrido.unidad}
                </p>
              </div>
            </Field>
          )
        )}
      </div>

      <div className="flex shrink-0 items-center pr-[16px]">
        <button
          type="button"
          onClick={onConsultar}
          className="group flex min-w-[32px] items-center justify-center gap-[8px] rounded-[8px] border border-solid border-primary-default p-[8px] transition-colors hover:bg-primary-default"
        >
          <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-primary-default transition-colors group-hover:text-primary-fg">
            Consultar
          </p>
        </button>
      </div>
    </div>
  )
}
