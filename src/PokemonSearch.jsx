import { useState, useRef, useEffect } from 'react'
import { POKEDEX, TIPOS, TIPO_COLORS } from './data'
import TypeBadge from './TypeBadge'

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

export default function PokemonSearch({ onAdd, maxReached, placeholder = 'Search Pokémon...' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showManual, setShowManual] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualTypes, setManualTypes] = useState([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const ref = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setResults([])
        setShowManual(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    setShowManual(false)
    setActiveIdx(-1)
    if (!val.trim()) { setResults([]); return }
    const filtered = POKEDEX.filter(p =>
      p.name.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 20)
    setResults(filtered)
  }

  function handleKeyDown(e) {
    if (!results.length && !showManual) return
    if (e.key === 'Escape') {
      setResults([])
      setShowManual(false)
      setActiveIdx(-1)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && results[activeIdx]) {
        handleAdd(results[activeIdx])
      }
    }
  }

  function handleAdd(pokemon) {
    onAdd(pokemon)
    setQuery('')
    setResults([])
    setShowManual(false)
    setActiveIdx(-1)
    inputRef.current?.focus()
  }

  function clearInput() {
    setQuery('')
    setResults([])
    setShowManual(false)
    setActiveIdx(-1)
    inputRef.current?.focus()
  }

  function toggleManualType(t) {
    setManualTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : prev.length < 2 ? [...prev, t] : prev
    )
  }

  function confirmManual() {
    if (!manualName.trim() || manualTypes.length === 0) return
    const p = { name: manualName.trim(), types: manualTypes }
    POKEDEX.push(p)
    onAdd(p)
    setShowManual(false)
    setManualName('')
    setManualTypes([])
    setQuery('')
    setResults([])
  }

  const showDropdown = results.length > 0
  const showNotFound = !results.length && query.trim() && !showManual

  return (
    <div ref={ref} className="relative">

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={maxReached}
          placeholder={maxReached ? 'Team is full' : placeholder}
          className="w-full bg-[#111820] border border-[#1c2830] rounded-lg px-4 py-2.5 pr-10 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors disabled:opacity-40"
        />
        {query && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6070] hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showDropdown && (
        <div
          ref={listRef}
          className="absolute z-[999] top-full mt-1 left-0 right-0 bg-[#111820] border border-[#243040] rounded-lg shadow-2xl overflow-y-auto max-h-64"
        >
          {results.map((p, i) => (
            <div
              key={p.name}
              onClick={() => handleAdd(p)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer border-b border-[#1c2830] last:border-0 transition-colors ${
                activeIdx === i ? 'bg-yellow-400/10' : 'hover:bg-[#161e28]'
              }`}
            >
              <span className="text-white font-semibold">
                <HighlightMatch text={p.name} query={query} />
              </span>
              <div className="flex gap-1">{p.types.map(t => <TypeBadge key={t} type={t} />)}</div>
            </div>
          ))}
          <div
            onClick={() => { setShowManual(true); setManualName(query); setResults([]) }}
            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#161e28] border-t border-[#243040] sticky bottom-0 bg-[#111820] transition-colors"
          >
            <span className="text-yellow-400 text-sm font-mono-tech">Not found? Add manually</span>
            <span className="text-xs text-[#4a6070]">Choose types →</span>
          </div>
        </div>
      )}

      {/* Not found shortcut */}
      {showNotFound && (
        <div className="absolute z-[999] top-full mt-1 left-0 right-0 bg-[#111820] border border-[#243040] rounded-lg shadow-2xl overflow-hidden">
          <div
            onClick={() => { setShowManual(true); setManualName(query) }}
            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#161e28] transition-colors"
          >
            <span className="text-yellow-400 text-sm font-mono-tech">No results — Add manually</span>
            <span className="text-xs text-[#4a6070]">Choose types →</span>
          </div>
        </div>
      )}

      {/* Manual entry */}
      {showManual && (
        <div className="absolute z-[999] top-full mt-1 left-0 right-0 bg-[#111820] border border-[#243040] rounded-lg shadow-2xl p-4">
          <p className="text-xs text-yellow-400 font-mono-tech tracking-widest mb-3">ADD MANUALLY</p>
          <input
            value={manualName}
            onChange={e => setManualName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmManual(); if (e.key === 'Escape') setShowManual(false) }}
            placeholder="Pokémon name"
            autoFocus
            className="w-full bg-[#0c1015] border border-[#1c2830] rounded-lg px-3 py-2 text-white mb-3 outline-none focus:border-yellow-400/50 transition-colors"
          />
          <p className="text-xs text-[#4a6070] font-mono-tech tracking-widest mb-2">SELECT TYPES (max 2):</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TIPOS.map(t => {
              const active = manualTypes.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => toggleManualType(t)}
                  style={{
                    background: TIPO_COLORS[t],
                    color: darkText.includes(t) ? '#111' : '#fff',
                    opacity: active ? 1 : 0.35,
                    outline: active ? '2px solid white' : 'none',
                    outlineOffset: 1,
                  }}
                  className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wide transition-all"
                >
                  {t}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={confirmManual}
              disabled={!manualName.trim() || manualTypes.length === 0}
              className="flex-1 bg-green-900/50 border border-green-700/50 text-green-400 font-bold py-2 rounded-lg hover:bg-green-900 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Pokémon
            </button>
            <button
              onClick={() => { setShowManual(false); setManualName(''); setManualTypes([]) }}
              className="px-4 border border-[#243040] text-[#4a6070] rounded-lg hover:text-red-400 hover:border-red-400/40 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}