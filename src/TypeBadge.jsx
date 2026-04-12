import { TIPO_COLORS } from './data'

const darkText = ['electric','ice','flying','rock','steel','fairy','normal']

export default function TypeBadge({ type }) {
  const bg = TIPO_COLORS[type] || '#888'
  const color = darkText.includes(type) ? '#111' : '#fff'
  return (
    <span style={{ background: bg, color }} className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
      {type}
    </span>
  )
}