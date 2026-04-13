import { TIPO_COLORS } from './data'

const darkText = ['electric','ice','flying','rock','steel','fairy','normal']

export default function TypeBadge({ type, size = 'md' }) {
  const bg = TIPO_COLORS[type] || '#888'
  const color = darkText.includes(type) ? '#111' : '#fff'

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-px'
    : 'text-xs px-2 py-0.5'

  return (
    <span
      style={{ background: bg, color }}
      className={`${sizeClass} font-bold rounded uppercase tracking-wide transition-opacity hover:opacity-80`}
    >
      {type}
    </span>
  )
}