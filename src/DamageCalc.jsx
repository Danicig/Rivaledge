import { useState, useEffect } from 'react'
import PokemonSearch from './PokemonSearch'
import TypeBadge from './TypeBadge'
import { getEff, TIPO_COLORS } from './data'

const darkText = ['electric','ice','flying','rock','steel','fairy','normal']

const TYPE_MAP = {
  normal:'normal', fire:'fire', water:'water', grass:'grass', electric:'electric',
  ice:'ice', fighting:'fighting', poison:'poison', ground:'ground', flying:'flying',
  psychic:'psychic', bug:'bug', rock:'rock', ghost:'ghost', dragon:'dragon',
  dark:'dark', steel:'steel', fairy:'fairy'
}

const POKEAPI_NAME_MAP = {
  'Tauros-Paldea-Combat': 'tauros-paldea-combat-breed',
  'Tauros-Paldea-Blaze': 'tauros-paldea-blaze-breed',
  'Tauros-Paldea-Aqua': 'tauros-paldea-aqua-breed',
  'Raichu-Alola': 'raichu-alola',
  'Ninetales-Alola': 'ninetales-alola',
  'Arcanine-Hisui': 'arcanine-hisui',
  'Slowbro-Galarian': 'slowbro-galar',
  'Slowking-Galarian': 'slowking-galar',
  'Typhlosion-Hisui': 'typhlosion-hisui',
  'Samurott-Hisui': 'samurott-hisui',
  'Zoroark-Hisui': 'zoroark-hisui',
  'Decidueye-Hisui': 'decidueye-hisui',
  'Goodra-Hisui': 'goodra-hisui',
  'Avalugg-Hisui': 'avalugg-hisui',
  'Stunfisk-Galarian': 'stunfisk-galar',
  'Lycanroc-Midnight': 'lycanroc-midnight',
  'Lycanroc-Dusk': 'lycanroc-dusk',
  'Rotom-Heat': 'rotom-heat',
  'Rotom-Wash': 'rotom-wash',
  'Rotom-Frost': 'rotom-frost',
  'Rotom-Fan': 'rotom-fan',
  'Rotom-Mow': 'rotom-mow',
  'Basculegion-F': 'basculegion-f',
  'Meowstic-F': 'meowstic-f',
  'Meowstic-M': 'meowstic',
  'Ogerpon-Wellspring': 'ogerpon-wellspring-mask',
  'Ogerpon-Hearthflame': 'ogerpon-hearthflame-mask',
  'Ogerpon-Cornerstone': 'ogerpon-cornerstone-mask',
  'Mr. Rime': 'mr-rime',
  'Flutter Mane': 'flutter-mane',
  'Iron Hands': 'iron-hands',
  'Iron Bundle': 'iron-bundle',
  'Iron Jugulis': 'iron-jugulis',
  'Iron Moth': 'iron-moth',
  'Iron Thorns': 'iron-thorns',
  'Iron Valiant': 'iron-valiant',
  'Iron Boulder': 'iron-boulder',
  'Iron Crown': 'iron-crown',
  'Roaring Moon': 'roaring-moon',
  'Gouging Fire': 'gouging-fire',
  'Raging Bolt': 'raging-bolt',
  'Wo-Chien': 'wo-chien',
  'Chien-Pao': 'chien-pao',
  'Ting-Lu': 'ting-lu',
  'Chi-Yu': 'chi-yu',
}

const NATURES = [
  { name: 'Neutral', atk: 1, spa: 1, def: 1, spd: 1, spe: 1 },
  { name: 'Adamant (+Atk -SpA)', atk: 1.1, spa: 0.9, def: 1, spd: 1, spe: 1 },
  { name: 'Modest (+SpA -Atk)', atk: 0.9, spa: 1.1, def: 1, spd: 1, spe: 1 },
  { name: 'Jolly (+Spe -SpA)', atk: 1, spa: 0.9, def: 1, spd: 1, spe: 1.1 },
  { name: 'Timid (+Spe -Atk)', atk: 0.9, spa: 1, def: 1, spd: 1, spe: 1.1 },
  { name: 'Brave (+Atk -Spe)', atk: 1.1, spa: 1, def: 1, spd: 1, spe: 0.9 },
  { name: 'Quiet (+SpA -Spe)', atk: 1, spa: 1.1, def: 1, spd: 1, spe: 0.9 },
  { name: 'Bold (+Def -Atk)', atk: 0.9, spa: 1, def: 1.1, spd: 1, spe: 1 },
  { name: 'Calm (+SpD -Atk)', atk: 0.9, spa: 1, def: 1, spd: 1.1, spe: 1 },
  { name: 'Impish (+Def -SpA)', atk: 1, spa: 0.9, def: 1.1, spd: 1, spe: 1 },
  { name: 'Careful (+SpD -SpA)', atk: 1, spa: 0.9, def: 1, spd: 1.1, spe: 1 },
  { name: 'Naive (+Spe -SpD)', atk: 1, spa: 1, def: 1, spd: 0.9, spe: 1.1 },
  { name: 'Hasty (+Spe -Def)', atk: 1, spa: 1, def: 0.9, spd: 1, spe: 1.1 },
]

const ITEMS = [
  { name: 'None', atkMult: 1, defMult: 1 },
  { name: 'Choice Band', atkMult: 1.5, defMult: 1, physical: true },
  { name: 'Choice Specs', atkMult: 1.5, defMult: 1, special: true },
  { name: 'Life Orb', atkMult: 1.3, defMult: 1 },
  { name: 'Assault Vest', atkMult: 1, defMult: 1.5, defSpecial: true },
  { name: 'Eviolite', atkMult: 1, defMult: 1.5 },
  { name: 'Leftovers', atkMult: 1, defMult: 1 },
  { name: 'Rocky Helmet', atkMult: 1, defMult: 1 },
  { name: 'Expert Belt', atkMult: 1.2, defMult: 1, superEffOnly: true },
]

const WEATHER_OPTIONS = [
  { id: 'none',  label: 'Clear',      icon: '☀️' },
  { id: 'sun',   label: 'Harsh Sun',  icon: '🌞' },
  { id: 'rain',  label: 'Rain',       icon: '🌧️' },
  { id: 'sand',  label: 'Sandstorm',  icon: '🏜️' },
  { id: 'snow',  label: 'Snow',       icon: '❄️' },
]

const WEATHER_BOOSTS = {
  none: { fire: 1, water: 1, ice: 1, rock: 1 },
  sun:  { fire: 1.5, water: 0.5, ice: 1, rock: 1 },
  rain: { fire: 0.5, water: 1.5, ice: 1, rock: 1 },
  sand: { fire: 1, water: 1, ice: 1, rock: 1 },
  snow: { fire: 1, water: 1, ice: 1, rock: 1 },
}

function MoveBadge({ type }) {
  const bg = TIPO_COLORS[type] || '#888'
  const color = darkText.includes(type) ? '#111' : '#fff'
  return (
    <span style={{ background: bg, color }}
      className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
      {type}
    </span>
  )
}

function calcDamage(movePower, attackStat, defenseStat, effectiveness, stab, weatherMult) {
  const base = Math.floor(Math.floor(Math.floor(2 * 50 / 5 + 2) * movePower * attackStat / defenseStat) / 50) + 2
  const withStab = stab ? Math.floor(base * 1.5) : base
  const withWeather = Math.floor(withStab * weatherMult)
  const final = Math.floor(withWeather * effectiveness)
  const minDmg = Math.floor(final * 0.85)
  return { min: minDmg, max: final }
}

function getStatAtLevel50(base, evs = 0, natureMult = 1) {
  return Math.floor(Math.floor((2 * base + 31 + Math.floor(evs / 4)) * 50 / 100) * natureMult) + 5
}

function getHPAtLevel50(base, evs = 0) {
  return Math.floor((2 * base + 31 + Math.floor(evs / 4)) * 50 / 100) + 50 + 10
}

function getEffLabel(eff) {
  if (eff === 0)    return { text: 'Immune — No damage',       color: 'text-[#4a6070]' }
  if (eff >= 4)     return { text: '×4 Super Effective!',      color: 'text-red-400' }
  if (eff >= 2)     return { text: '×2 Super Effective',       color: 'text-orange-400' }
  if (eff <= 0.25)  return { text: '×0.25 Not Very Effective', color: 'text-green-600' }
  if (eff <= 0.5)   return { text: '×0.5 Not Very Effective',  color: 'text-green-400' }
  return { text: '×1 Normal Damage', color: 'text-[#4a6070]' }
}

function getKOLabel(minPct, maxPct) {
  if (maxPct >= 100 && minPct >= 100) return { text: 'Guaranteed KO!', color: 'text-red-400' }
  if (maxPct >= 100)                  return { text: 'Possible KO',    color: 'text-orange-400' }
  if (maxPct >= 50)                   return { text: '2HKO range',     color: 'text-yellow-400' }
  return { text: 'Survives',          color: 'text-green-400' }
}

export default function DamageCalc() {
  const [attacker, setAttacker] = useState(null)
  const [defender, setDefender] = useState(null)
  const [attackerData, setAttackerData] = useState(null)
  const [defenderData, setDefenderData] = useState(null)
  const [attackerError, setAttackerError] = useState(false)
  const [defenderError, setDefenderError] = useState(false)
  const [moves, setMoves] = useState([])
  const [selectedMove, setSelectedMove] = useState(null)
  const [moveSearch, setMoveSearch] = useState('')
  const [moveCategory, setMoveCategory] = useState('all')
  const [loadingAttacker, setLoadingAttacker] = useState(false)
  const [loadingDefender, setLoadingDefender] = useState(false)
  const [loadingMoves, setLoadingMoves] = useState(false)
  const [results, setResults] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)

  const [atkNature, setAtkNature] = useState(NATURES[0])
  const [defNature, setDefNature] = useState(NATURES[0])
  const [atkItem, setAtkItem] = useState(ITEMS[0])
  const [defItem, setDefItem] = useState(ITEMS[0])
  const [atkEVs, setAtkEVs] = useState(0)
  const [defEVs, setDefEVs] = useState(0)
  const [weather, setWeather] = useState('none')

  async function fetchPokemonData(name) {
    const apiName = POKEAPI_NAME_MAP[name] || name.toLowerCase()
      .replace(/\s+/g, '-').replace(/['.]/g, '').replace('♀', '-f').replace('♂', '-m')
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`)
    if (!res.ok) throw new Error('Not found')
    return res.json()
  }

  async function fetchMoveData(url) {
    const res = await fetch(url)
    const data = await res.json()
    if (!data.power || data.damage_class?.name === 'status') return null
    return {
      name: data.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: data.type.name,
      power: data.power,
      category: data.damage_class.name,
    }
  }

  useEffect(() => {
    if (!attacker) { setAttackerData(null); setMoves([]); setSelectedMove(null); setAttackerError(false); return }
    setLoadingAttacker(true); setLoadingMoves(true); setAttackerError(false)
    fetchPokemonData(attacker.name)
      .then(async data => {
        setAttackerData(data); setLoadingAttacker(false)
        const movesToFetch = data.moves
          .filter(m => m.version_group_details.some(v => ['level-up','machine'].includes(v.move_learn_method.name)))
          .slice(0, 60)
        const moveResults = await Promise.all(movesToFetch.map(m => fetchMoveData(m.move.url).catch(() => null)))
        const validMoves = moveResults.filter(Boolean).filter(m => TYPE_MAP[m.type]).sort((a, b) => b.power - a.power)
        setMoves(validMoves); setLoadingMoves(false)
      })
      .catch(() => { setLoadingAttacker(false); setLoadingMoves(false); setAttackerError(true) })
  }, [attacker])

  useEffect(() => {
    if (!defender) { setDefenderData(null); setDefenderError(false); return }
    setLoadingDefender(true); setDefenderError(false)
    fetchPokemonData(defender.name)
      .then(data => { setDefenderData(data); setLoadingDefender(false) })
      .catch(() => { setLoadingDefender(false); setDefenderError(true) })
  }, [defender])

  function calculate() {
    if (!attackerData || !defenderData || !selectedMove) return
    const atkStats = attackerData.stats
    const defStats = defenderData.stats
    const getStat = (stats, name) => stats.find(s => s.stat.name === name)?.base_stat || 100
    const isPhysical = selectedMove.category === 'physical'
    const atkNatureMult = isPhysical ? atkNature.atk : atkNature.spa
    const attackStat = getStatAtLevel50(isPhysical ? getStat(atkStats, 'attack') : getStat(atkStats, 'special-attack'), atkEVs, atkNatureMult)
    const defNatureMult = isPhysical ? defNature.def : defNature.spd
    const defenseStat = getStatAtLevel50(isPhysical ? getStat(defStats, 'defense') : getStat(defStats, 'special-defense'), defEVs, defNatureMult)
    const defenderHP = getHPAtLevel50(getStat(defStats, 'hp'))
    const effectiveness = getEff(selectedMove.type, defender.types)
    const stab = attacker.types.includes(selectedMove.type)
    let atkItemMult = atkItem.atkMult
    if (atkItem.physical && !isPhysical) atkItemMult = 1
    if (atkItem.special && isPhysical) atkItemMult = 1
    if (atkItem.superEffOnly && effectiveness < 2) atkItemMult = 1
    let defItemMult = defItem.defMult
    if (defItem.defSpecial && isPhysical) defItemMult = 1
    const finalAtkStat = Math.floor(attackStat * atkItemMult)
    const finalDefStat = Math.floor(defenseStat * defItemMult)
    const weatherMult = WEATHER_BOOSTS[weather]?.[selectedMove.type] || 1
    const { min, max } = calcDamage(selectedMove.power, finalAtkStat, finalDefStat, effectiveness, stab, weatherMult)
    const minPct = Math.round((min / defenderHP) * 100)
    const maxPct = Math.round((max / defenderHP) * 100)
    const newResult = { min, max, minPct, maxPct, effectiveness, stab, defenderHP,
      attackerName: attacker.name, defenderName: defender.name,
      moveName: selectedMove.name, moveType: selectedMove.type, weather }
    setResults(newResult)
    setHistory(prev => [newResult, ...prev].slice(0, 5))
  }

  function resetAll() {
    setAttacker(null); setDefender(null); setAttackerData(null); setDefenderData(null)
    setMoves([]); setSelectedMove(null); setResults(null); setMoveSearch('')
    setAtkNature(NATURES[0]); setDefNature(NATURES[0])
    setAtkItem(ITEMS[0]); setDefItem(ITEMS[0])
    setAtkEVs(0); setDefEVs(0); setWeather('none')
  }

  function copyResult() {
    if (!results) return
    const ko = getKOLabel(results.minPct, results.maxPct)
    const text = `${results.attackerName} → ${results.moveName} → ${results.defenderName}\n${results.minPct}–${results.maxPct}% HP (${results.min}–${results.max} dmg)\n${ko.text}\n\nrivaledge.net`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredMoves = moves.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(moveSearch.toLowerCase())
    const matchCat = moveCategory === 'all' || m.category === moveCategory
    return matchSearch && matchCat
  })

  const statNames = { hp:'HP', attack:'Atk', defense:'Def', 'special-attack':'SpA', 'special-defense':'SpD', speed:'Spe' }

  return (
    <div>
      {/* Header bar */}
      <div className="mb-6 bg-[#0c1015] border border-[#1c2830] rounded-xl px-5 py-3.5 flex items-center justify-between">
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest">
          DAMAGE CALC · PokéAPI movepools · Level 50
        </p>
        <button
          onClick={resetAll}
          className="font-mono-tech text-xs text-[#4a6070] hover:text-red-400 transition-colors tracking-widest"
        >
          Reset all
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* ATTACKER */}
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-visible">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] rounded-t-xl">
            <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-white">Attacker</h2>
          </div>
          <div className="p-4 overflow-visible">
            <PokemonSearch onAdd={p => { setAttacker(p); setSelectedMove(null); setResults(null) }} maxReached={false} placeholder="Search attacker..." />
            {loadingAttacker && <p className="text-center text-[#4a6070] text-sm mt-4 font-mono-tech animate-pulse">Loading data...</p>}
            {attackerError && (
              <div className="mt-3 bg-red-950/30 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-xs font-mono-tech">⚠️ Not found in PokéAPI. Try the base English name.</p>
                <button onClick={() => { setAttacker(null); setAttackerError(false) }} className="mt-2 text-xs text-[#4a6070] hover:text-red-400 transition-colors">× Remove</button>
              </div>
            )}
            {attackerData && !loadingAttacker && !attackerError && (
              <div className="mt-3 bg-[#111820] border border-[#1c2830] rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white">{attacker.name}</span>
                  <div className="flex gap-1">{attacker.types.map(t => <TypeBadge key={t} type={t} />)}</div>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {attackerData.stats.map(s => (
                    <div key={s.stat.name} className="text-center bg-[#0c1015] rounded-lg py-1.5">
                      <div className="font-mono-tech text-xs text-[#4a6070]">{statNames[s.stat.name] || s.stat.name}</div>
                      <div className="font-mono-tech text-sm text-white font-bold">{s.base_stat}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setAttacker(null); setSelectedMove(null); setResults(null) }}
                  className="text-xs text-[#4a6070] hover:text-red-400 transition-colors">× Remove</button>
              </div>
            )}
          </div>
        </div>

        {/* MOVE */}
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-visible">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] rounded-t-xl flex items-center justify-between">
            <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-white">Move</h2>
            {attacker && !loadingMoves && !attackerError && (
              <span className="font-mono-tech text-xs text-[#4a6070]">{filteredMoves.length} moves</span>
            )}
          </div>
          <div className="p-4">
            {!attacker && <p className="text-[#4a6070] text-sm italic text-center py-4">Select an attacker first</p>}
            {attackerError && <p className="text-red-400 text-sm italic text-center py-4">Attacker not found</p>}
            {loadingMoves && <p className="text-center text-[#4a6070] text-sm font-mono-tech animate-pulse">Loading moves...</p>}
            {attacker && !loadingMoves && !attackerError && (
              <>
                <input
                  value={moveSearch}
                  onChange={e => setMoveSearch(e.target.value)}
                  placeholder="Filter moves..."
                  className="w-full bg-[#111820] border border-[#1c2830] rounded-lg px-4 py-2.5 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors mb-2"
                />
                {/* Category filter */}
                <div className="flex gap-2 mb-3">
                  {['all', 'physical', 'special'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMoveCategory(cat)}
                      className={`flex-1 py-1.5 rounded-lg font-mono-tech text-xs tracking-widest uppercase transition-all border ${
                        moveCategory === cat
                          ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                          : 'bg-[#111820] border-[#1c2830] text-[#4a6070] hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-56">
                  {filteredMoves.map(m => (
                    <button key={m.name} onClick={() => { setSelectedMove(m); setResults(null) }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all border ${
                        selectedMove?.name === m.name
                          ? 'bg-yellow-400/10 border-yellow-400/30'
                          : 'bg-[#111820] border-[#1c2830] hover:border-[#2a3840]'
                      }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-semibold">{m.name}</span>
                        <span className={`font-mono-tech text-xs px-1.5 py-0.5 rounded ${
                          m.category === 'physical' ? 'bg-orange-900/40 text-orange-400' : 'bg-blue-900/40 text-blue-400'
                        }`}>
                          {m.category === 'physical' ? 'PHY' : 'SPC'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono-tech text-xs text-[#4a6070]">{m.power}</span>
                        <MoveBadge type={m.type} />
                      </div>
                    </button>
                  ))}
                  {filteredMoves.length === 0 && <p className="text-center text-[#4a6070] text-sm italic py-4">No moves found</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* DEFENDER */}
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-visible">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] rounded-t-xl">
            <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-white">Defender</h2>
          </div>
          <div className="p-4 overflow-visible">
            <PokemonSearch onAdd={p => { setDefender(p); setResults(null) }} maxReached={false} placeholder="Search defender..." />
            {loadingDefender && <p className="text-center text-[#4a6070] text-sm mt-4 font-mono-tech animate-pulse">Loading data...</p>}
            {defenderError && (
              <div className="mt-3 bg-red-950/30 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-xs font-mono-tech">⚠️ Not found in PokéAPI. Try the base English name.</p>
                <button onClick={() => { setDefender(null); setDefenderError(false) }} className="mt-2 text-xs text-[#4a6070] hover:text-red-400 transition-colors">× Remove</button>
              </div>
            )}
            {defenderData && !loadingDefender && !defenderError && (
              <div className="mt-3 bg-[#111820] border border-[#1c2830] rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white">{defender.name}</span>
                  <div className="flex gap-1">{defender.types.map(t => <TypeBadge key={t} type={t} />)}</div>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {defenderData.stats.map(s => (
                    <div key={s.stat.name} className="text-center bg-[#0c1015] rounded-lg py-1.5">
                      <div className="font-mono-tech text-xs text-[#4a6070]">{statNames[s.stat.name] || s.stat.name}</div>
                      <div className="font-mono-tech text-sm text-white font-bold">{s.base_stat}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setDefender(null); setResults(null) }}
                  className="text-xs text-[#4a6070] hover:text-red-400 transition-colors">× Remove</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADVANCED OPTIONS */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between bg-[#0c1015] border border-[#1c2830] rounded-xl px-5 py-3.5 hover:border-[#243040] transition-colors"
        >
          <span className="font-orbitron text-xs font-bold tracking-widest uppercase text-[#4a6070]">
            ⚙️ Advanced Options — Natures, Items & Weather
          </span>
          <span className="text-[#4a6070] text-lg">{showAdvanced ? '▲' : '▼'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-2 bg-[#0c1015] border border-[#1c2830] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Attacker options */}
            <div>
              <p className="font-orbitron text-xs text-yellow-400 tracking-widest mb-3">ATTACKER</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="font-mono-tech text-xs text-[#4a6070] mb-1 block">Nature</label>
                  <select value={atkNature.name} onChange={e => setAtkNature(NATURES.find(n => n.name === e.target.value))}
                    className="w-full bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-yellow-400">
                    {NATURES.map(n => <option key={n.name}>{n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-mono-tech text-xs text-[#4a6070] mb-1 block">Held Item</label>
                  <select value={atkItem.name} onChange={e => setAtkItem(ITEMS.find(i => i.name === e.target.value))}
                    className="w-full bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-yellow-400">
                    {ITEMS.map(i => <option key={i.name}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-mono-tech text-xs text-[#4a6070] mb-1 block">Attack EVs: {atkEVs}</label>
                  <input type="range" min="0" max="252" step="4" value={atkEVs}
                    onChange={e => setAtkEVs(Number(e.target.value))}
                    className="w-full accent-yellow-400" />
                </div>
              </div>
            </div>

            {/* Weather */}
            <div>
              <p className="font-orbitron text-xs text-yellow-400 tracking-widest mb-3">WEATHER</p>
              <div className="flex flex-col gap-2">
                {WEATHER_OPTIONS.map(w => (
                  <button key={w.id} onClick={() => setWeather(w.id)}
                    className={`px-3 py-2 rounded-lg text-left text-sm font-semibold transition-all border ${
                      weather === w.id
                        ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                        : 'bg-[#111820] border-[#1c2830] text-[#4a6070] hover:text-white'
                    }`}>
                    {w.icon} {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Defender options */}
            <div>
              <p className="font-orbitron text-xs text-red-400 tracking-widest mb-3">DEFENDER</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="font-mono-tech text-xs text-[#4a6070] mb-1 block">Nature</label>
                  <select value={defNature.name} onChange={e => setDefNature(NATURES.find(n => n.name === e.target.value))}
                    className="w-full bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-red-400">
                    {NATURES.map(n => <option key={n.name}>{n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-mono-tech text-xs text-[#4a6070] mb-1 block">Held Item</label>
                  <select value={defItem.name} onChange={e => setDefItem(ITEMS.find(i => i.name === e.target.value))}
                    className="w-full bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-red-400">
                    {ITEMS.map(i => <option key={i.name}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-mono-tech text-xs text-[#4a6070] mb-1 block">Defense EVs: {defEVs}</label>
                  <input type="range" min="0" max="252" step="4" value={defEVs}
                    onChange={e => setDefEVs(Number(e.target.value))}
                    className="w-full accent-red-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CALCULATE BUTTON */}
      {attackerData && defenderData && selectedMove && (
        <button
          onClick={calculate}
          className="w-full py-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl font-orbitron text-yellow-400 font-bold tracking-widest uppercase hover:bg-yellow-400/20 hover:border-yellow-400/50 transition-all mb-6"
          style={{ boxShadow: '0 0 20px rgba(240,192,64,0.1)' }}
        >
          ⚡ CALCULATE DAMAGE
        </button>
      )}

      {/* RESULT */}
      {results && (
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden mb-6">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] flex items-center justify-between">
            <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-yellow-400">Result</h2>
            <button
              onClick={copyResult}
              className="font-mono-tech text-xs text-[#4a6070] hover:text-white transition-colors border border-[#1c2830] hover:border-[#2a3840] px-3 py-1.5 rounded-lg"
            >
              {copied ? '✓ Copied' : 'Copy result'}
            </button>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="font-mono-tech text-xs text-[#4a6070] mb-2 tracking-widest">
                {attacker.name} → {selectedMove.name} → {defender.name}
                {weather !== 'none' && <span className="ml-2 text-yellow-400">· {WEATHER_OPTIONS.find(w => w.id === weather)?.label}</span>}
              </p>
              <p className={`font-orbitron text-lg font-bold mb-1 ${getEffLabel(results.effectiveness).color}`}>
                {getEffLabel(results.effectiveness).text}
                {results.stab && <span className="ml-2 text-yellow-400 text-sm">(STAB)</span>}
              </p>
            </div>

            {results.effectiveness > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#111820] border border-[#1c2830] rounded-xl p-4 text-center">
                    <p className="font-mono-tech text-xs text-[#4a6070] mb-1 tracking-widest">MIN DAMAGE</p>
                    <p className="font-orbitron text-3xl font-black text-white">{results.min}</p>
                    <p className="font-mono-tech text-sm text-yellow-400 mt-1">{results.minPct}% HP</p>
                  </div>
                  <div className="bg-[#111820] border border-[#1c2830] rounded-xl p-4 text-center">
                    <p className="font-mono-tech text-xs text-[#4a6070] mb-1 tracking-widest">MAX DAMAGE</p>
                    <p className="font-orbitron text-3xl font-black text-white">{results.max}</p>
                    <p className="font-mono-tech text-sm text-yellow-400 mt-1">{results.maxPct}% HP</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between font-mono-tech text-xs text-[#4a6070] mb-2">
                    <span>Damage range</span>
                    <span>{results.minPct}% – {results.maxPct}%</span>
                  </div>
                  <div className="h-4 bg-[#1c2830] rounded-full overflow-hidden relative">
                    <div className="h-full bg-yellow-400/30 rounded-full absolute transition-all duration-500"
                      style={{ width: `${Math.min(results.maxPct, 100)}%` }} />
                    <div className="h-full bg-yellow-400 rounded-full absolute transition-all duration-500"
                      style={{ width: `${Math.min(results.minPct, 100)}%` }} />
                  </div>
                </div>

                <div className="bg-[#111820] border border-[#1c2830] rounded-lg p-3 text-center">
                  <p className="font-mono-tech text-xs text-[#4a6070]">
                    Defender HP: <span className="text-white font-bold">{results.defenderHP}</span>
                    <span className={`ml-2 font-bold ${getKOLabel(results.minPct, results.maxPct).color}`}>
                      — {getKOLabel(results.minPct, results.maxPct).text}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HISTORY */}
      {history.length > 1 && (
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] flex items-center justify-between">
            <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-[#4a6070]">Recent Calculations</h2>
            <button onClick={() => setHistory([])} className="font-mono-tech text-xs text-[#4a6070] hover:text-red-400 transition-colors">Clear</button>
          </div>
          <div className="divide-y divide-[#1c2830]">
            {history.slice(1).map((h, i) => {
              const ko = getKOLabel(h.minPct, h.maxPct)
              return (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono-tech text-xs text-white">
                      {h.attackerName} → <span className="text-yellow-400">{h.moveName}</span> → {h.defenderName}
                    </p>
                    <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">{h.minPct}–{h.maxPct}% HP</p>
                  </div>
                  <span className={`font-mono-tech text-xs font-bold ${ko.color}`}>{ko.text}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}