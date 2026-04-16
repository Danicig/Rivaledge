import { TIPO_COLORS } from './data'
import { useLang } from './lang'

const darkText = ['electric','ice','flying','rock','steel','fairy','normal']

const TIPO_NAMES_ES = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', grass: 'Planta',
  electric: 'Eléctrico', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
  ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada',
}

export default function TypeBadge({ type, size = 'md' }) {
  const { lang } = useLang()
  const bg = TIPO_COLORS[type] || '#888'
  const color = darkText.includes(type) ? '#111' : '#fff'
  const label = lang === 'es' ? (TIPO_NAMES_ES[type] || type) : type

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-px'
    : 'text-xs px-2 py-0.5'

  return (
    <span style={{ background: bg, color }}
      className={`${sizeClass} font-bold rounded uppercase tracking-wide transition-opacity hover:opacity-80`}>
      {label}
    </span>
  )
}