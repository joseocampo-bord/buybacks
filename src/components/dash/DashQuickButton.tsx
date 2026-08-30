// "Mis buybacks" quick-button card — per the Figma reference (node
// 36380:414360, "quick button"). Skips that node's decorative diagonal
// "Logo_Colores" watermark bleeding off the right edge (a brand illustration,
// not structural — out of scope to re-export/reproduce here) but keeps the
// title/subtitle + CTA, including the CTA's actual button color from the
// design: `tag/purple` (#885EF7), not `primary` teal — a real, if unusual,
// use of the existing tags/purple token, not an invented color.
export default function DashQuickButton() {
  return (
    <div className="flex w-full items-center gap-[16px] overflow-hidden rounded-[12px] border border-solid border-stroke-default px-[12px] py-[16px]">
      <div className="flex flex-1 flex-col gap-[4px]">
        <p className="text-[20px] font-bold leading-normal text-content-default">Mis buybacks</p>
        <p className="text-[12px] leading-normal text-content-default">
          ¿Tienes herramientas que deseas vender a Bord? Hazlo desde aquí
        </p>
      </div>
      <button
        type="button"
        className="flex shrink-0 items-center justify-center gap-[8px] rounded-[8px] bg-tag-purple-bg px-[8px] py-[12px] text-primary-fg"
      >
        <p className="whitespace-nowrap text-[14px] font-medium leading-normal">Vender herramientas a bord</p>
      </button>
    </div>
  )
}
