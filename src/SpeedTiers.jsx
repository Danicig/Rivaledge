import { useState, useEffect } from 'react'
import TypeBadge from './TypeBadge'
import { POKEDEX, getSpriteUrl } from './data'
import { useLang } from './lang'

// Cálculo de velocidad a nivel 50 con 31 IVs
function calcSpeed(base, evs = 0, natureMult = 1) {
  return Math.floor(Math.floor((2 * base + 31 + Math.floor(evs / 4)) * 50 / 100) * natureMult) + 5
}

function PokemonSprite({ pokemon, size = 40 }) {
  const url = getSpriteUrl(pokemon.spriteId)
  if (!url) return null
  return (
    <img src={url} alt={pokemon.name} width={size} height={size}
      style={{ imageRendering: 'pixelated', flexShrink: 0 }}
      onError={e => { e.target.style.display = 'none' }} />
  )
}

// Pokémon prioritarios del meta — los cargamos primero
const META_POKEMON = [
  'Incineroar','Sneasler','Garchomp','Sinistcha','Kingambit','Floette-Eternal',
  'Rotom-Wash','Whimsicott','Pelipper','Froslass','Tyranitar','Excadrill',
  'Charizard','Farigiraf','Archaludon','Dragonite','Dragapult','Aerodactyl',
  'Talonflame','Corviknight','Gardevoir','Primarina','Milotic','Basculegion',
  'Hatterene','Torkoal','Azumarill','Gengar','Meowscarada','Miraidon',
]

const NATURE_OPTIONS = [
  { label: '+Spe (Jolly/Timid)', mult: 1.1 },
  { label: 'Neutral',            mult: 1.0 },
  { label: '-Spe (Brave/Quiet)', mult: 0.9 },
]

const EV_OPTIONS = [
  { label: '252 EVs', evs: 252 },
  { label: '0 EVs',   evs: 0 },
]

export default function SpeedTiers() {
  const { lang } = useLang()
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(0)
  const [search, setSearch] = useState('')
  const [natureMult, setNatureMult] = useState(1.0)
  const [evs, setEvs] = useState(252)
  const [showAll, setShowAll] = useState(false)

  const total = POKEDEX.length

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoaded(0)
    setTiers([])

    async function fetchAll() {
      // Primero los del meta, luego el resto
      const ordered = [
        ...META_POKEMON.filter(n => POKEDEX.find(p => p.name === n)),
        ...POKEDEX.filter(p => !META_POKEMON.includes(p.name)).map(p => p.name)
      ]

      const results = []
      let count = 0

      for (const name of ordered) {
        if (cancelled) return
        const entry = POKEDEX.find(p => p.name === name)
        if (!entry) continue

        try {
          const apiName = name.toLowerCase()
            .replace(/\s+/g, '-').replace(/['.]/g, '')
            .replace('-alola', '-alolan').replace('-galar', '-galarian')
            .replace('-hisui', '-hisuian').replace('-paldea', '-paldean')
          // Intentamos con nombre simple primero
          const simpleName = name.toLowerCase().replace(/\s+/g, '-').replace(/['.]/g, '').split('-')[0]
          let data = null

          // Mapa de nombres especiales para la API
          const API_MAP = {
            'Rotom-Wash': 'rotom-wash', 'Rotom-Heat': 'rotom-heat', 'Rotom-Frost': 'rotom-frost',
            'Rotom-Fan': 'rotom-fan', 'Rotom-Mow': 'rotom-mow', 'Rotom': 'rotom',
            'Floette-Eternal': 'floette-eternal', 'Floette': 'floette',
            'Raichu-Alola': 'raichu-alola', 'Ninetales-Alola': 'ninetales-alola',
            'Arcanine-Hisui': 'arcanine-hisui', 'Slowbro-Galarian': 'slowbro-galar',
            'Slowking-Galarian': 'slowking-galar', 'Typhlosion-Hisui': 'typhlosion-hisui',
            'Samurott-Hisui': 'samurott-hisui', 'Zoroark-Hisui': 'zoroark-hisui',
            'Decidueye-Hisui': 'decidueye-hisui', 'Goodra-Hisui': 'goodra-hisui',
            'Avalugg-Hisui': 'avalugg-hisui', 'Stunfisk-Galarian': 'stunfisk-galar',
            'Lycanroc-Midnight': 'lycanroc-midnight', 'Lycanroc-Dusk': 'lycanroc-dusk',
            'Basculegion-F': 'basculegion-f', 'Meowstic-F': 'meowstic-f',
            'Meowstic-M': 'meowstic', 'Mr. Rime': 'mr-rime',
            'Tauros-Paldea-Combat': 'tauros-paldea-combat-breed',
            'Tauros-Paldea-Blaze': 'tauros-paldea-blaze-breed',
            'Tauros-Paldea-Aqua': 'tauros-paldea-aqua-breed',
          }

          const fetchName = API_MAP[name] || name.toLowerCase().replace(/\s+/g, '-').replace(/['.]/g, '')

          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${fetchName}`)
          if (res.ok) {
            data = await res.json()
          } else {
            // Fallback al nombre base
            const baseRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${simpleName}`)
            if (baseRes.ok) data = await baseRes.json()
          }

          if (data) {
            const baseSpe = data.stats.find(s => s.stat.name === 'speed')?.base_stat || 0
            results.push({ ...entry, baseSpe })
          }
        } catch {
          // Skip silently
        }

        count++
        if (!cancelled) setLoaded(count)

        // Actualizar tiers en tiempo real cada 10 Pokémon
        if (count % 10 === 0 && !cancelled) {
          setTiers([...results].sort((a, b) => b.baseSpe - a.baseSpe))
        }
      }

      if (!cancelled) {
        setTiers([...results].sort((a, b) => b.baseSpe - a.baseSpe))
        setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  const filtered = tiers
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => showAll || META_POKEMON.includes(p.name) || !loading)

  const displayed = showAll ? filtered : filtered.slice(0, 60)

  // Agrupar por velocidad calculada
  function getCalcSpe(p) {
    return calcSpeed(p.baseSpe, evs, natureMult)
  }

  // Velocidades destacadas del meta
  const BENCHMARK_SPEEDS = [
    { spe: calcSpeed(135, 252, 1.1), label: lang === 'es' ? 'Max Sneasler (+Spe 252)' : 'Max Sneasler (+Spe 252)', color: '#ff4422' },
    { spe: calcSpeed(102, 252, 1.1), label: lang === 'es' ? 'Max Garchomp (+Spe 252)' : 'Max Garchomp (+Spe 252)', color: '#f0c040' },
    { spe: calcSpeed(102, 0, 1.0),   label: lang === 'es' ? 'Garchomp neutro 0EVs' : 'Garchomp neutral 0EVs', color: '#aa8800' },
    { spe: calcSpeed(60, 0, 1.0),    label: 'Incineroar 0EVs', color: '#ff8844' },
  ]

  const pct = Math.round((loaded / total) * 100)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 bg-[#0c1015] border border-[#1c2830] rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-orbitron text-yellow-400 text-sm font-bold tracking-widest mb-1">
              {lang === 'es' ? 'SPEED TIERS · NIVEL 50' : 'SPEED TIERS · LEVEL 50'}
            </p>
            <p className="text-sm text-[#8899aa]">
              {lang === 'es'
                ? 'Velocidades reales calculadas desde PokeAPI. Se actualizan automáticamente.'
                : 'Real speed values calculated from PokeAPI. Auto-updated.'}
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-[#1c2830] rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-mono-tech text-xs text-[#4a6070]">{pct}%</span>
            </div>
          )}
          {!loading && (
            <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="font-mono-tech text-xs text-green-400">
                {tiers.length} {lang === 'es' ? 'Pokémon cargados' : 'Pokémon loaded'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'es' ? 'Buscar Pokémon...' : 'Search Pokémon...'}
          className="flex-1 bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-2.5 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech text-sm" />
        <div className="flex gap-2">
          {NATURE_OPTIONS.map(n => (
            <button key={n.label} onClick={() => setNatureMult(n.mult)}
              className="px-3 py-2 rounded-xl font-mono-tech text-xs border transition-all flex-shrink-0"
              style={natureMult === n.mult
                ? { borderColor: 'rgba(240,192,64,0.4)', color: '#f0c040', background: 'rgba(240,192,64,0.1)' }
                : { borderColor: '#1c2830', color: '#4a6070', background: '#0c1015' }}>
              {n.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {EV_OPTIONS.map(e => (
            <button key={e.label} onClick={() => setEvs(e.evs)}
              className="px-3 py-2 rounded-xl font-mono-tech text-xs border transition-all flex-shrink-0"
              style={evs === e.evs
                ? { borderColor: 'rgba(51,170,255,0.4)', color: '#33aaff', background: 'rgba(51,170,255,0.1)' }
                : { borderColor: '#1c2830', color: '#4a6070', background: '#0c1015' }}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmarks */}
      <div className="mb-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
        <p className="font-orbitron text-xs text-[#4a6070] tracking-widest uppercase mb-3">
          {lang === 'es' ? 'Referencias del meta' : 'Meta benchmarks'}
        </p>
        <div className="flex flex-wrap gap-2">
          {BENCHMARK_SPEEDS.map(b => (
            <div key={b.label} className="flex items-center gap-2 bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-1.5">
              <span className="font-orbitron text-sm font-black" style={{ color: b.color }}>{b.spe}</span>
              <span className="font-mono-tech text-xs text-[#4a6070]">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
        <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] grid grid-cols-12 gap-2">
          <div className="col-span-1 font-mono-tech text-xs text-[#4a6070]">#</div>
          <div className="col-span-5 font-mono-tech text-xs text-[#4a6070]">
            {lang === 'es' ? 'Pokémon' : 'Pokémon'}
          </div>
          <div className="col-span-2 font-mono-tech text-xs text-[#4a6070] text-center">
            {lang === 'es' ? 'Base' : 'Base'}
          </div>
          <div className="col-span-2 font-mono-tech text-xs text-yellow-400 text-center">
            {lang === 'es' ? 'Calculada' : 'Calculated'}
          </div>
          <div className="col-span-2 font-mono-tech text-xs text-[#4a6070] text-center hidden sm:block">
            {lang === 'es' ? 'Tipos' : 'Types'}
          </div>
        </div>

        {displayed.length === 0 && loading && (
          <div className="p-8 text-center">
            <p className="font-mono-tech text-xs text-[#4a6070] animate-pulse">
              {lang === 'es' ? 'Cargando velocidades desde PokeAPI...' : 'Loading speeds from PokeAPI...'}
            </p>
          </div>
        )}

        <div className="divide-y divide-[#111820]">
          {displayed.map((p, i) => {
            const calcSpe = getCalcSpe(p)
            const isMeta = META_POKEMON.includes(p.name)
            const maxBase = tiers[0]?.baseSpe || 1
            const barPct = Math.round((p.baseSpe / maxBase) * 100)

            return (
              <div key={p.name}
                className={`grid grid-cols-12 gap-2 px-5 py-3 items-center transition-colors hover:bg-[#111820] ${isMeta ? '' : 'opacity-70'}`}>
                <div className="col-span-1 font-mono-tech text-xs text-[#4a6070]">{i + 1}</div>
                <div className="col-span-5 flex items-center gap-2">
                  <PokemonSprite pokemon={p} size={36} />
                  <div>
                    <p className={`font-bold text-sm ${isMeta ? 'text-white' : 'text-[#6a7a8a]'}`}>{p.name}</p>
                    <div className="w-16 h-1 bg-[#1c2830] rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: calcSpe >= 120 ? '#ff4422' : calcSpe >= 90 ? '#f0c040' : '#33aaff' }} />
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-center font-mono-tech text-sm text-[#8899aa]">{p.baseSpe}</div>
                <div className="col-span-2 text-center">
                  <span className="font-orbitron text-sm font-black"
                    style={{ color: calcSpe >= 150 ? '#ff4422' : calcSpe >= 120 ? '#ff8844' : calcSpe >= 90 ? '#f0c040' : calcSpe >= 60 ? '#33aaff' : '#4a6070' }}>
                    {calcSpe}
                  </span>
                </div>
                <div className="col-span-2 hidden sm:flex gap-1 justify-center flex-wrap">
                  {p.types.map(type => <TypeBadge key={type} type={type} />)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Ver más */}
        {!showAll && filtered.length > 60 && (
          <div className="border-t border-[#1c2830] p-4 text-center">
            <button onClick={() => setShowAll(true)}
              className="font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors tracking-widest uppercase">
              {lang === 'es' ? `Ver todos (${filtered.length})` : `Show all (${filtered.length})`}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
        <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">
          {lang === 'es'
            ? '📊 Velocidades calculadas con 31 IVs a nivel 50. Datos de stats de PokeAPI. La velocidad calculada varía según la naturaleza y EVs seleccionados arriba.'
            : '📊 Speeds calculated with 31 IVs at level 50. Stats data from PokeAPI. Calculated speed varies based on the nature and EVs selected above.'}
        </p>
      </div>
    </div>
  )
}