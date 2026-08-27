import flagMexico from '../assets/quote-module/flag-mexico.svg'
import flagColombia from '../assets/quote-module/flag-colombia.svg'
import flagArgentina from '../assets/quote-module/flag-argentina.svg'
import flagTurkey from '../assets/quote-module/flag-turkey.svg'
import flagVenezuela from '../assets/quote-module/flag-venezuela.svg'
import iconTime from '../assets/quote-module/icon-time.svg'
import iconCheckCircle from '../assets/quote-module/icon-check-circle.svg'
import dividerVerticalSmall from '../assets/quote-module/divider-vertical-small.svg'
import statusDot from '../assets/quote-module/status-dot.svg'

export type CountryFlag = 'mexico' | 'colombia' | 'argentina' | 'turkey' | 'venezuela'

const FLAGS: Record<CountryFlag, string> = {
  mexico: flagMexico,
  colombia: flagColombia,
  argentina: flagArgentina,
  turkey: flagTurkey,
  venezuela: flagVenezuela,
}

export type BuybackCardProps = {
  flags: CountryFlag[]
  quoteCode: string
  client: string
  clientAvatar: string
  requestedBy: string
  toolsQuoted: number
  toolsChecked: number
  createdAt: string
  elapsedLabel: string
  assignees: string[]
  ctaLabel?: string
  /** Called when the row (or its CTA button) is activated — used to navigate to the detail view. */
  onRowClick?: () => void
}

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex w-[120px] shrink-0 flex-col items-start gap-[6px]">
      <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-normal text-content-secondary">
        {title}
      </p>
      {children}
    </div>
  )
}

export default function BuybackCard({
  flags,
  quoteCode,
  client,
  clientAvatar,
  requestedBy,
  toolsQuoted,
  toolsChecked,
  createdAt,
  elapsedLabel,
  assignees,
  ctaLabel = 'Ver detalle',
  onRowClick,
}: BuybackCardProps) {
  return (
    // `group` + hover styles implement the Figma hover state: border brightens to the
    // primary teal and the CTA button fills solid (see button below).
    <div
      role={onRowClick ? 'button' : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={onRowClick}
      onKeyDown={
        onRowClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onRowClick()
              }
            }
          : undefined
      }
      className={`group flex w-full items-center gap-[32px] rounded-[12px] border border-solid border-stroke-default bg-layout-level-1 py-[16px] transition-colors ${
        onRowClick ? 'cursor-pointer hover:border-primary-default' : ''
      }`}
    >
      <div className="flex w-[207px] shrink-0 flex-col items-start pl-[16px]">
        <div className="flex flex-col items-start gap-[4px]">
          <div className="flex items-center gap-[4px]">
            <div className="flex items-center">
              {flags.map((flag, i) => (
                <img
                  key={`${flag}-${i}`}
                  src={FLAGS[flag]}
                  alt={flag}
                  className="size-[12px] shrink-0 rounded-full"
                  style={{ marginRight: i === flags.length - 1 ? 0 : -4 }}
                />
              ))}
            </div>
            {flags.length > 1 && (
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-bold leading-normal text-content-default">
                +{flags.length - 1}
              </p>
            )}
            {flags.length === 1 && (
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-bold leading-normal text-content-default capitalize">
                {flags[0]}
              </p>
            )}
          </div>
          <p className="whitespace-nowrap text-[12px] leading-normal text-content-secondary">{quoteCode}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-between gap-y-[24px] pr-[16px]">
        <Field title="Cliente">
          <div className="flex w-full items-center gap-[4px]">
            <img
              src={clientAvatar}
              alt=""
              className="size-[18px] shrink-0 rounded-full border border-solid border-stroke-interactive object-cover"
            />
            <p className="flex-1 truncate text-[12px] leading-normal text-content-default">{client}</p>
          </div>
        </Field>

        <Field title="Solicitado por">
          <p className="truncate text-[12px] leading-normal text-content-default">{requestedBy}</p>
        </Field>

        <Field title="Herramientas cotizadas">
          <div className="flex items-start gap-[4px]">
            <div className="flex items-center gap-[4px]">
              <img src={iconTime} alt="" className="size-[12px] shrink-0 opacity-70" />
              <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">
                {toolsQuoted}
              </p>
            </div>
            <img src={dividerVerticalSmall} alt="" className="h-[12px] w-px shrink-0 opacity-50" />
            <div className="flex items-center gap-[4px]">
              <img src={iconCheckCircle} alt="" className="size-[12px] shrink-0 opacity-70" />
              <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">
                {toolsChecked}
              </p>
            </div>
          </div>
        </Field>

        <Field title="Creación">
          <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">{createdAt}</p>
        </Field>

        <Field title="Tiempo transcurrido">
          <div className="flex items-center gap-[4px] rounded-[24px] border border-solid border-informative-fg px-[6px] py-[2px]">
            <img src={statusDot} alt="" className="size-[8px] shrink-0" />
            <p className="whitespace-nowrap text-[12px] leading-normal text-content-default">
              {elapsedLabel}
            </p>
          </div>
        </Field>

        <div className="flex items-center">
          {assignees.map((avatar, i) => (
            <img
              key={i}
              src={avatar}
              alt=""
              className="size-[20px] shrink-0 rounded-full border border-solid border-stroke-interactive object-cover"
              style={{ marginRight: i === assignees.length - 1 ? 0 : -4 }}
            />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[8px] pr-[16px]">
        <button
          type="button"
          onClick={(e) => {
            // The row itself is also clickable (role="button"), so stop propagation to
            // avoid double-firing navigation from a button nested inside a clickable row.
            e.stopPropagation()
            onRowClick?.()
          }}
          // border/text use primary-default (#22cfab), matching the CTA outline-button
          // token from the design system. On row hover the button fills solid — the CTA
          // becomes more prominent, per the Figma hover reference.
          className="flex min-w-[32px] items-center justify-center gap-[8px] rounded-[8px] border border-solid border-primary-default p-[8px] transition-colors group-hover:bg-primary-default"
        >
          <p className="whitespace-nowrap text-[12px] font-medium leading-normal text-primary-default transition-colors group-hover:text-primary-fg">
            {ctaLabel}
          </p>
        </button>
      </div>
    </div>
  )
}
