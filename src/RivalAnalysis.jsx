import { useState } from 'react'
import PokemonSearch from './PokemonSearch'
import TypeBadge from './TypeBadge'
import { getEff, TIPOS, getSpriteUrl } from './data'
import { useLang } from './lang'
import { useTeam } from './TeamContext'

function PokemonSprite({ pokemon, size = 48 }) {
  const url = getSpriteUrl(pokemon.spriteId)
  if (!url) return null
  return (
    <img src={url} alt={pokemon.name} width={size} height={size}
      style={{ imageRendering: 'pixelated', flexShrink: 0 }}
      onError={e => { e.target.style.display = 'none' }} />
  )
}

export default function RivalAnalysis() {
  const { t } = useLang()
  const { myTeam, addPokemon, removePokemon, clearTeam } = useTeam()
  const [format, setFormat] = useState('doubles')
  const [rival, setRival] = useState([])
  const [analyzed, setAnalyzed] = useState(false)
  const [scores, setScores] = useState([])
  const [bestLead, setBestLead] = useState(null)
  const [copied, setCopied] = useState(false)

  const bringCount = format === 'doubles' ? 4 : 3

  function addToRival(p)  { if (rival.length >= 6 || rival.find(x => x.name === p.name)) return; setRival([...rival, p]); setAnalyzed(false) }
  function removeRival(name) { setRival(rival.filter(p => p.name !== name)); setAnalyzed(false) }
  function clearRival()      { setRival([]); setAnalyzed(false) }

  function getTeamWeaknesses() {
    const counts = {}
    TIPOS.forEach(type => {
      const total = myTeam.reduce((sum, p) => sum + (getEff(type, p.types) >= 2 ? 1 : 0), 0)
      if (total > 0) counts[type] = total
    })
    return counts
  }
  function getTeamResistances() {
    const counts = {}
    TIPOS.forEach(type => {
      const total = myTeam.reduce((sum, p) => { const e = getEff(type, p.types); return sum + (e <= 0.5 && e > 0 ? 1 : 0) }, 0)
      if (total > 0) counts[type] = total
    })
    return counts
  }
  function getTeamImmunities() {
    const counts = {}
    TIPOS.forEach(type => {
      const total = myTeam.reduce((sum, p) => sum + (getEff(type, p.types) === 0 ? 1 : 0), 0)
      if (total > 0) counts[type] = total
    })
    return counts
  }

  function scorePair(p1, p2, rivalTeam) {
    let score = 0
    rivalTeam.forEach(rp => {
      const best1 = Math.max(...p1.types.map(t => getEff(t, rp.types)))
      const best2 = Math.max(...p2.types.map(t => getEff(t, rp.types)))
      score += Math.max(best1, best2) >= 4 ? 40 : Math.max(best1, best2) >= 2 ? 20 : 5
      const def1 = Math.max(...rp.types.map(t => getEff(t, p1.types)))
      const def2 = Math.max(...rp.types.map(t => getEff(t, p2.types)))
      if (def1 >= 4) score -= 30; else if (def1 >= 2) score -= 10
      if (def2 >= 4) score -= 30; else if (def2 >= 2) score -= 10
      if (def1 >= 2 && def2 <= 0.5) score += 15
      if (def2 >= 2 && def1 <= 0.5) score += 15
    })
    return Math.max(0, score)
  }

  function analyze() {
    if (myTeam.length === 0 || rival.length === 0) return
    const scored = myTeam.map(mp => {
      let score = 0
      const offensiveWins = [], dangers = []
      rival.forEach(rp => {
        const bestOff = Math.max(...mp.types.map(mt => getEff(mt, rp.types)))
        if (bestOff >= 4) { score += 40; offensiveWins.push({ name: rp.name, mult: 4 }) }
        else if (bestOff >= 2) { score += 20; offensiveWins.push({ name: rp.name, mult: 2 }) }
        else if (bestOff === 1) score += 5
        else score -= 5
        const worstDef = Math.max(...rp.types.map(rt => getEff(rt, mp.types)))
        if (worstDef >= 4) { score -= 35; dangers.push({ name: rp.name, mult: 4 }) }
        else if (worstDef >= 2) { score -= 12; dangers.push({ name: rp.name, mult: 2 }) }
        else if (worstDef <= 0) score += 15
        else if (worstDef <= 0.5) score += 8
      })
      return { pokemon: mp, score: Math.max(0, score), offensiveWins, dangers }
    })
    const sorted = [...scored].sort((a, b) => b.score - a.score)
    setScores(sorted)
    if (format === 'doubles') {
      const topN = sorted.slice(0, bringCount)
      let bestPair = null, bestPairScore = -1
      for (let i = 0; i < topN.length; i++) {
        for (let j = i + 1; j < topN.length; j++) {
          const s = scorePair(topN[i].pokemon, topN[j].pokemon, rival)
          if (s > bestPairScore) { bestPairScore = s; bestPair = { p1: topN[i].pokemon, p2: topN[j].pokemon } }
        }
      }
      setBestLead(bestPair)
    }
    setAnalyzed(true)
  }

  function copyResults() {
    if (!analyzed || scores.length === 0) return
    const top = scores.slice(0, bringCount)
    let text = `RivalEdge — ${format === 'doubles' ? 'Doubles' : 'Singles'}\nBring: ${top.map(s => s.pokemon.name).join(', ')}\n`
    if (bestLead && format === 'doubles') text += `Lead: ${bestLead.p1.name} + ${bestLead.p2.name}\n`
    text += `\nrivaledge.net`
    navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const weaknesses  = getTeamWeaknesses()
  const resistances = getTeamResistances()
  const immunities  = getTeamImmunities()
  const maxScore    = scores[0]?.score || 1

  return (
    <div>
      {/* Format selector */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => { setFormat('doubles'); setAnalyzed(false) }}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${format === 'doubles' ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'}`}>
          {t('ra.doubles')}</button>
        <button onClick={() => { setFormat('singles'); setAnalyzed(false) }}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${format === 'singles' ? 'bg-blue-400/10 border-blue-400/40 text-blue-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'}`}>
          {t('ra.singles')}</button>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* My Team — usa contexto global */}
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-visible">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] rounded-t-xl flex items-center justify-between">
            <div>
              <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-white">{t('ra.my_team')}</h2>
              <p className="font-mono-tech text-xs text-yellow-400/60 mt-0.5">Equipo compartido entre herramientas</p>
            </div>
            <div className="flex items-center gap-2">
              {myTeam.length > 0 && <button onClick={() => { clearTeam(); setAnalyzed(false) }} className="font-mono-tech text-xs text-[#4a6070] hover:text-red-400 transition-colors">{t('global.clear')}</button>}
              <span className="font-mono-tech text-xs text-[#4a6070] bg-[#0c1015] border border-[#1c2830] px-2.5 py-1 rounded">{myTeam.length} / 6</span>
            </div>
          </div>
          <div className="p-4 overflow-visible">
            <PokemonSearch onAdd={p => { addPokemon(p); setAnalyzed(false) }} maxReached={myTeam.length >= 6} placeholder={t('ra.placeholder_my')} />
            <div className="mt-3 flex flex-col gap-2">
              {myTeam.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tech text-xs text-[#4a6070] w-4">{i + 1}</span>
                    <PokemonSprite pokemon={p} size={40} />
                    <span className="font-bold text-white">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                    <button onClick={() => { removePokemon(p.name); setAnalyzed(false) }} className="text-[#4a6070] hover:text-red-400 transition-colors ml-1 text-xl leading-none">×</button>
                  </div>
                </div>
              ))}
              {myTeam.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-[#4a6070] text-sm italic mb-1">{t('ra.empty_my')}</p>
                  <p className="text-[#2a3840] text-xs font-mono-tech">{t('ra.empty_my_sub')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rival Team */}
        <div className="bg-[#0c1015] border border-red-400/20 rounded-xl overflow-visible">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-red-400/20 rounded-t-xl flex items-center justify-between">
            <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-red-400">{t('ra.rival_team')}</h2>
            <div className="flex items-center gap-2">
              {rival.length > 0 && <button onClick={clearRival} className="font-mono-tech text-xs text-[#4a6070] hover:text-red-400 transition-colors">{t('global.clear')}</button>}
              <span className="font-mono-tech text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded">{rival.length} / 6</span>
            </div>
          </div>
          <div className="p-4 overflow-visible">
            <PokemonSearch onAdd={addToRival} maxReached={rival.length >= 6} placeholder={t('ra.placeholder_rival')} />
            <div className="mt-3 flex flex-col gap-2">
              {rival.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tech text-xs text-[#4a6070] w-4">{i + 1}</span>
                    <PokemonSprite pokemon={p} size={40} />
                    <span className="font-bold text-white">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                    <button onClick={() => removeRival(p.name)} className="text-[#4a6070] hover:text-red-400 transition-colors ml-1 text-xl leading-none">×</button>
                  </div>
                </div>
              ))}
              {rival.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-[#4a6070] text-sm italic mb-1">{t('ra.empty_rival')}</p>
                  <p className="text-[#2a3840] text-xs font-mono-tech">{t('ra.empty_rival_sub')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coverage */}
      {myTeam.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { labelKey: 'ra.weaknesses',  colorClass: 'text-red-400',   data: weaknesses },
            { labelKey: 'ra.resistances', colorClass: 'text-green-400', data: resistances },
            { labelKey: 'ra.immunities',  colorClass: 'text-blue-400',  data: immunities },
          ].map(({ labelKey, colorClass, data }) => (
            <div key={labelKey} className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
              <div className="bg-[#111820] px-5 py-3 border-b border-[#1c2830]">
                <h3 className={`font-orbitron text-xs font-bold tracking-widest uppercase ${colorClass}`}>{t(labelKey)}</h3>
              </div>
              <div className="p-4">
                {Object.keys(data).length === 0
                  ? <p className="text-[#4a6070] text-xs italic">{t('ra.none')}</p>
                  : <div className="flex flex-wrap gap-2">
                      {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([type, c]) => (
                        <div key={type} className="flex items-center gap-1 bg-[#111820] rounded-lg px-2 py-1">
                          <TypeBadge type={type} />
                          <span className={`font-mono-tech text-xs ${colorClass}`}>×{c}</span>
                        </div>
                      ))}
                    </div>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analyze button */}
      {myTeam.length > 0 && rival.length > 0 && (
        <button onClick={analyze}
          className={`w-full py-4 rounded-xl font-orbitron font-bold tracking-widest uppercase transition-all mb-6 border ${
            format === 'doubles' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 hover:border-yellow-400/50' : 'bg-blue-400/10 border-blue-400/30 text-blue-400 hover:bg-blue-400/20 hover:border-blue-400/50'
          }`}
          style={{ boxShadow: format === 'doubles' ? '0 0 20px rgba(240,192,64,0.1)' : '0 0 20px rgba(51,170,255,0.1)' }}>
          {format === 'doubles' ? t('ra.analyze_doubles') : t('ra.analyze_singles')}
        </button>
      )}

      {/* Results */}
      {analyzed && (
        <div className="flex flex-col gap-4">
          {bestLead && format === 'doubles' && (
            <div className="bg-yellow-400/5 border border-yellow-400/30 rounded-xl p-5">
              <p className="font-mono-tech text-xs text-yellow-400 tracking-widest mb-3">{t('ra.lead_title')}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <PokemonSprite pokemon={bestLead.p1} size={52} />
                  <div>
                    <span className="font-orbitron text-xl font-black text-white">{bestLead.p1.name}</span>
                    <div className="flex gap-1 mt-1">{bestLead.p1.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                  </div>
                </div>
                <span className="font-orbitron text-yellow-400 text-lg">+</span>
                <div className="flex items-center gap-2">
                  <PokemonSprite pokemon={bestLead.p2} size={52} />
                  <div>
                    <span className="font-orbitron text-xl font-black text-white">{bestLead.p2.name}</span>
                    <div className="flex gap-1 mt-1">{bestLead.p2.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#4a6070] mt-3 font-mono-tech">{t('ra.lead_sub')} {bringCount}</p>
            </div>
          )}

          <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
            <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] flex items-center justify-between">
              <h2 className={`font-orbitron text-sm font-bold tracking-widest uppercase ${format === 'doubles' ? 'text-yellow-400' : 'text-blue-400'}`}>
                {format === 'doubles' ? t('ra.best_doubles') : t('ra.best_singles')}
              </h2>
              <button onClick={copyResults} className="font-mono-tech text-xs text-[#4a6070] hover:text-white transition-colors border border-[#1c2830] hover:border-[#2a3840] px-3 py-1.5 rounded-lg">
                {copied ? t('global.copied') : t('ra.copy')}
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scores.map((s, i) => {
                const pct = maxScore > 0 ? Math.round((s.score / maxScore) * 100) : 0
                const isTop = i < bringCount
                const rankEmoji = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'][i]
                const accentColor = format === 'doubles' ? '#f0c040' : '#60a5fa'
                const isLead = bestLead && (s.pokemon.name === bestLead.p1.name || s.pokemon.name === bestLead.p2.name)
                return (
                  <div key={s.pokemon.name} className={`rounded-xl border p-4 ${isTop ? (format === 'doubles' ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-blue-400/30 bg-blue-400/5') : 'border-[#1c2830] bg-[#111820] opacity-40'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{rankEmoji}</span>
                        <PokemonSprite pokemon={s.pokemon} size={44} />
                        <span className="font-bold text-white">{s.pokemon.name}</span>
                        {isLead && isTop && format === 'doubles' && (
                          <span className="text-xs bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded font-mono-tech">{t('ra.lead_badge')}</span>
                        )}
                      </div>
                      <div className="flex gap-1">{s.pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 bg-[#1c2830] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: isTop ? accentColor : '#3a5060' }} />
                      </div>
                      <span className="font-mono-tech text-xs text-[#4a6070] w-8 text-right">{pct}%</span>
                    </div>
                    {s.offensiveWins.length > 0 && (
                      <div className="mb-2">
                        <p className="font-mono-tech text-xs text-green-400 mb-1">{t('ra.super_eff')}</p>
                        <div className="flex flex-wrap gap-1">
                          {s.offensiveWins.map(w => <span key={w.name} className="text-xs bg-green-900/20 text-green-300 border border-green-900/30 px-2 py-0.5 rounded">{w.name} ×{w.mult}</span>)}
                        </div>
                      </div>
                    )}
                    {s.dangers.length > 0 && (
                      <div>
                        <p className="font-mono-tech text-xs text-red-400 mb-1">{t('ra.threatened')}</p>
                        <div className="flex flex-wrap gap-1">
                          {s.dangers.map(d => <span key={d.name} className="text-xs bg-red-900/20 text-red-300 border border-red-900/30 px-2 py-0.5 rounded">{d.name} ×{d.mult}</span>)}
                        </div>
                      </div>
                    )}
                    {s.offensiveWins.length === 0 && s.dangers.length === 0 && (
                      <p className="font-mono-tech text-xs text-[#4a6070]">{t('ra.neutral')}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}