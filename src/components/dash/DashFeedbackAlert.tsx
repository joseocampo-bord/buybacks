// "feedback-alert" per the Figma reference (node I36380:143016;12819:125388)
// — info icon + bold label + regular value, one line, informative tone by
// default (danger for expired/cancelled). Reused for every stage's
// contextual message instead of ad hoc banner markup per stage.
// The "i" glyph is a plain text circle, same pattern QuoteDetail.tsx's
// InfoTooltip already uses — every info-icon SVG asset in this project ships
// pre-colored danger-red (meant for warning triangles), so a neutral-tone
// icon has to be drawn, not reused.
const TONE_CLASSES: Record<'informative' | 'danger', string> = {
  informative: 'border-informative-fg bg-informative-bg text-informative-fg',
  danger: 'border-danger-fg bg-danger-bg text-danger-fg',
}

export default function DashFeedbackAlert({
  label,
  value,
  tone = 'informative',
}: {
  label: string
  value?: string
  tone?: 'informative' | 'danger'
}) {
  return (
    <div className={`flex w-full items-center gap-[12px] rounded-[8px] border border-solid p-[12px] ${TONE_CLASSES[tone]}`}>
      <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-solid border-current text-[11px] leading-none">
        i
      </span>
      <p className="text-[12px] leading-normal">
        <span className="font-medium">{label}</span>
        {value && <span className="text-content-default"> {value}</span>}
      </p>
    </div>
  )
}
