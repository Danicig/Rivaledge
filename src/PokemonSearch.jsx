import { useState, useRef, useEffect } from 'react'
import { POKEDEX, TIPOS, TIPO_COLORS, getSpriteUrl } from './data'
import TypeBadge from './TypeBadge'
import { useLang } from './lang'

const darkText = ['electric','ice','flying','rock','steel','fairy','normal']

function HighlightMatch({ text, query }) {
  if (!query) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <span className="text-yellow-400">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </span>
  )
}

function PokemonSprite({ pokemon, size = 40 }) {
  const url = getSpriteUrl(pokemon.spriteId)
  if (!url) return null
  return (
    <img
      src={url}
      alt={pokemon.name}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', flexShrink: 0 }}
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}

export default function PokemonSearch({ onAdd, maxReached, placeholder }) {
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showManual, setShowManual] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualTypes, setManualTypes] = useState([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const ref = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setResults([]); setShowManual(false); setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(e) {
    const val = e.target.value
    setQuery(val); setShowManual(false); setActiveIdx(-1)
    if (!val.trim()) { setResults([]); return }
    setResults(POKEDEX.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).slice(0, 20))
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setResults([]); setShowManual(false); setActiveIdx(-1); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(prev => Math.min(prev + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(prev => Math.max(prev - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0 && results[activeIdx]) handleAdd(results[activeIdx]) }
  }

  function handleAdd(pokemon) {
    onAdd(pokemon); setQuery(''); setResults([]); setShowManual(false); setActiveIdx(-1)
    inputRef.current?.focus()
  }

  function clearInput() { setQuery(''); setResults([]); setShowManual(false); setActiveIdx(-1); inputRef.current?.focus() }

  function toggleManualType(type) {
    setManualTypes(prev => prev.includes(type) ? prev.filter(x => x !== type) : prev.length < 2 ? [...prev, type] : prev)
  }

  function confirmManual() {
    if (!manualName.trim() || manualTypes.length === 0) return
    const p = { name: manualName.trim(), types: manualTypes }
    POKEDEX.push(p); onAdd(p)
    setShowManual(false); setManualName(''); setManualTypes([]); setQuery(''); setResults([])
  }

  const ph = placeholder || t('ps.placeholder')
  const showDropdown = results.length > 0
  const showNotFound = !results.length && query.trim() && !showManual

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={maxReached}
          placeholder={maxReached ? t('ps.max_reached') : ph}
          className="w-full bg-[#111820] border border-[#1c2830] rounded-lg px-4 py-2.5 pr-10 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors disabled:opacity-40"
        />
        {query && (
          <button onClick={clearInput} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6070] hover:text-white transition-colors text-lg leading-none">×</button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-[999] top-full mt-1 left-0 right-0 bg-[#111820] border border-[#243040] rounded-lg shadow-2xl overflow-y-auto max-h-64">
          {results.map((p, i) => (
            <div key={p.name} onClick={() => handleAdd(p)} onMouseEnter={() => setActiveIdx(i)}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-[#1c2830] last:border-0 transition-colors ${activeIdx === i ? 'bg-yellow-400/10' : 'hover:bg-[#161e28]'}`}>
              <div className="flex items-center gap-2">
                <PokemonSprite pokemon={p} size={36} />
                <span className="text-white font-semibold"><HighlightMatch text={p.name} query={query} /></span>
              </div>
              <div className="flex gap-1">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
            </div>
          ))}
          <div onClick={() => { setShowManual(true); setManualName(query); setResults([]) }}
            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#161e28] border-t border-[#243040] sticky bottom-0 bg-[#111820] transition-colors">
            <span className="text-yellow-400 text-sm font-mono-tech">{t('ps.not_found')}</span>
            <span className="text-xs text-[#4a6070]">{t('ps.choose_types')}</span>
          </div>
        </div>
      )}

      {showNotFound && (
        <div className="absolute z-[999] top-full mt-1 left-0 right-0 bg-[#111820] border border-[#243040] rounded-lg shadow-2xl overflow-hidden">
          <div onClick={() => { setShowManual(true); setManualName(query) }}
            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#161e28] transition-colors">
            <span className="text-yellow-400 text-sm font-mono-tech">{t('ps.not_found_short')}</span>
            <span className="text-xs text-[#4a6070]">{t('ps.choose_types')}</span>
          </div>
        </div>
      )}

      {showManual && (
        <div className="absolute z-[999] top-full mt-1 left-0 right-0 bg-[#111820] border border-[#243040] rounded-lg shadow-2xl p-4">
          <p className="text-xs text-yellow-400 font-mono-tech tracking-widest mb-3">{t('ps.add_manually')}</p>
          <input value={manualName} onChange={e => setManualName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmManual(); if (e.key === 'Escape') setShowManual(false) }}
            placeholder={t('ps.name_placeholder')} autoFocus
            className="w-full bg-[#0c1015] border border-[#1c2830] rounded-lg px-3 py-2 text-white mb-3 outline-none focus:border-yellow-400/50 transition-colors" />
          <p className="text-xs text-[#4a6070] font-mono-tech tracking-widest mb-2">{t('ps.select_types')}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TIPOS.map(type => (
              <button key={type} onClick={() => toggleManualType(type)}
                style={{ background: TIPO_COLORS[type], color: darkText.includes(type) ? '#111' : '#fff', opacity: manualTypes.includes(type) ? 1 : 0.35, outline: manualTypes.includes(type) ? '2px solid white' : 'none', outlineOffset: 1 }}
                className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wide transition-all">
                {type}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={confirmManual} disabled={!manualName.trim() || manualTypes.length === 0}
              className="flex-1 bg-green-900/50 border border-green-700/50 text-green-400 font-bold py-2 rounded-lg hover:bg-green-900 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              {t('ps.add_button')}
            </button>
            <button onClick={() => { setShowManual(false); setManualName(''); setManualTypes([]) }}
              className="px-4 border border-[#243040] text-[#4a6070] rounded-lg hover:text-red-400 hover:border-red-400/40 transition-colors text-sm">
              {t('ps.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}