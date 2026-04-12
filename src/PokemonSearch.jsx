import { useState, useRef, useEffect } from 'react'
import { POKEDEX, TIPOS, TIPO_COLORS } from './data'
import TypeBadge from './TypeBadge'

const darkText = ['electric','ice','flying','rock','steel','fairy','normal']

export default function PokemonSearch({ onAdd, maxReached, placeholder = 'Search Pokemon...' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showManual, setShowManual] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualTypes, setManualTypes] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setResults([])
        setShowManual(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    setShowManual(false)
    if (!val.trim()) { setResults([]); return }
    const filtered = POKEDEX.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).slice(0, 20)
    setResults(filtered)
  }

  function handleAdd(pokemon) {
    onAdd(pokemon)
    setQuery('')
    setResults([])
    setShowManual(false)
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

  return (
    <div ref={ref} className="relative">
      <input
        value={query}
        onChange={handleInput}
        disabled={maxReached}
        placeholder={maxReached ? 'Maximum reached' : placeholder}
        className="w-full bg-[#111820] border border-[#1c2830] rounded-lg px-4 py-2.5 text-white placeholder-[#4a6070] outline-none focus:border-[#2288ff] transition-colors disabled:opacity-40"
      />

      {results.length > 0 && (
        <div className="absolute z-[999] top-full mt-1 left-0 right-0 bg-[#111820] border border-[#243040] rounded-lg shadow-2xl overflow-y-auto max-h-64">
          {results.map(p => (
            <div key={p.name} onClick={() => handleAdd(p)}
              className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#161e28] border-b border-[#1c2830] last:border-0">
              <span className="text-white font-semibold">{p.name}</span>
              <div className="flex gap-1">{p.types.map(t => <TypeBadge key={t} type={t} />)}</div>
            </div>
          ))}
          <div onClick={() => { setShowManual(true); setManualName(query); setResults([]) }}
            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#161e28] border-t border-[#243040] text-yellow-400 sticky bottom-0 bg-[#111820]">
            <span>Not found? Add manually</span>
            <span className="text-xs text-[#4a6070]">Choose types</span>
          </div>
        </div>
      )}

      {!results.length && query && !showManual && (
        <div className="absolute z-[999] top-full mt-1 left-0 right-0 bg-[#111820] border border-[#243040] rounded-lg shadow-2xl overflow-hidden">
          <div onClick={() => { setShowManual(true); setManualName(query) }}
            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#161e28] text-yellow-400">
            <span>Not found — Add manually</span>
            <span className="text-xs text-[#4a6070]">Choose types</span>
          </div>
        </div>
      )}

      {showManual && (
        <div className="absolute z-[999] top-full mt-1 left-0 right-0 bg-[#111820] border border-[#243040] rounded-lg shadow-2xl p-4">
          <p className="text-xs text-yellow-400 font-mono-tech tracking-widest mb-3">ADD MANUALLY</p>
          <input value={manualName} onChange={e => setManualName(e.target.value)}
            placeholder="Pokemon name"
            className="w-full bg-[#0c1015] border border-[#1c2830] rounded px-3 py-2 text-white mb-3 outline-none focus:border-[#2288ff]" />
          <p className="text-xs text-[#4a6070] font-mono-tech tracking-widest mb-2">SELECT TYPES (max 2):</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TIPOS.map(t => {
              const active = manualTypes.includes(t)
              const bg = TIPO_COLORS[t]
              const color = darkText.includes(t) ? '#111' : '#fff'
              return (
                <button key={t} onClick={() => toggleManualType(t)}
                  style={{ background: bg, color, opacity: active ? 1 : 0.4, outline: active ? '2px solid white' : 'none' }}
                  className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wide transition-all">
                  {t}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={confirmManual}
              className="flex-1 bg-green-900 border border-green-700 text-green-400 font-bold py-2 rounded hover:bg-green-800 transition-colors text-sm">
              ADD
            </button>
            <button onClick={() => { setShowManual(false); setManualName(''); setManualTypes([]) }}
              className="px-4 border border-[#243040] text-[#4a6070] rounded hover:text-red-400 hover:border-red-400 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}