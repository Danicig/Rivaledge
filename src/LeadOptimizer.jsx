import { useState } from 'react'
import PokemonSearch from './PokemonSearch'
import TypeBadge from './TypeBadge'
import { getEff } from './data'
import { useLang } from './lang'

export default function LeadOptimizer() {
  const { t } = useLang()
  const [myTeam, setMyTeam] = useState([])
  const [rival, setRival] = useState([])
  const [analyzed, setAnalyzed] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  function addToMyTeam(p) { if (myTeam.length >= 6 || myTeam.find(x => x.name === p.name)) return; setMyTeam([...myTeam, p]); setAnalyzed(false) }
  function addToRival(p)  { if (rival.length >= 6 || rival.find(x => x.name === p.name)) return; setRival([...rival, p]); setAnalyzed(false) }
  function removeMyTeam(name) { setMyTeam(myTeam.filter(p => p.name !== name)); setAnalyzed(false) }
  function removeRival(name)  { setRival(rival.filter(p => p.name !== name)); setAnalyzed(false) }
  function clearMyTeam()      { setMyTeam([]); setAnalyzed(false) }
  function clearRival()       { setRival([]); setAnalyzed(false) }

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
    if (myTeam.length < 2 || rival.length === 0) return
    const pairs = []
    for (let i = 0; i < myTeam.length; i++) {
      for (let j = i + 1; j < myTeam.length; j++) {
        const p1 = myTeam[i], p2 = myTeam[j]
        const score = scorePair(p1, p2, rival)
        const coverage = rival.map(rp => {
          const best1 = Math.max(...p1.types.map(t => getEff(t, rp.types)))
          const best2 = Math.max(...p2.types.map(t => getEff(t, rp.types)))
          return { name: rp.name, types: rp.types, mult: Math.max(best1, best2) }
        })
        const threats = rival.map(rp => {
          const def1 = Math.max(...rp.types.map(t => getEff(t, p1.types)))
          const def2 = Math.max(...rp.types.map(t => getEff(t, p2.types)))
          return { name: rp.name, types: rp.types, threatTo1: def1 >= 2, threatTo2: def2 >= 2 }
        }).filter(t => t.threatTo1 || t.threatTo2)
        pairs.push({ p1, p2, score: Math.max(0, score), coverage, threats })
      }
    }
    setResult(pairs.sort((a, b) => b.score - a.score))
    setAnalyzed(true)
  }

  function copyResult() {
    if (!result?.[0]) return
    const best = result[0]
    const text = `RivalEdge — Lead Optimizer\n${best.p1.name} + ${best.p2.name}\n\nrivaledge.net`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maxScore = result?.[0]?.score || 1

  return (
    <div>

      {/* Header */}
      <div className="mb-6 bg-[#0c1015] border border-[#1c2830] rounded-xl p-5">
        <p className="font-orbitron text-yellow-400 text-sm font-bold tracking-widest mb-1">{t('lo.title')}</p>
        <p className="text-sm text-[#8899aa]">{t('lo.desc')}</p>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* My Team */}
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-visible">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] rounded-t-xl flex items-center justify-between">
            <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-white">{t('lo.my_team')}</h2>
            <div className="flex items-center gap-2">
              {myTeam.length > 0 && <button onClick={clearMyTeam} className="font-mono-tech text-xs text-[#4a6070] hover:text-red-400 transition-colors">{t('global.clear')}</button>}
              <span className="font-mono-tech text-xs text-[#4a6070] bg-[#0c1015] border border-[#1c2830] px-2.5 py-1 rounded">{myTeam.length} / 6</span>
            </div>
          </div>
          <div className="p-4 overflow-visible">
            <PokemonSearch onAdd={addToMyTeam} maxReached={myTeam.length >= 6} placeholder={t('lo.placeholder_my')} />
            <div className="mt-3 flex flex-col gap-2">
              {myTeam.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between bg-[#111820] border border-[#1c2830] rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tech text-xs text-[#4a6070]">{i + 1}</span>
                    <span className="font-bold text-white">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                    <button onClick={() => removeMyTeam(p.name)} className="text-[#4a6070] hover:text-red-400 transition-colors ml-1 text-xl leading-none">×</button>
                  </div>
                </div>
              ))}
              {myTeam.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-[#4a6070] text-sm italic mb-1">{t('lo.empty_my')}</p>
                  <p className="text-[#2a3840] text-xs font-mono-tech">{t('lo.empty_my_sub')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rival */}
        <div className="bg-[#0c1015] border border-red-400/20 rounded-xl overflow-visible">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-red-400/20 rounded-t-xl flex items-center justify-between">
            <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-red-400">{t('lo.rival')}</h2>
            <div className="flex items-center gap-2">
              {rival.length > 0 && <button onClick={clearRival} className="font-mono-tech text-xs text-[#4a6070] hover:text-red-400 transition-colors">{t('global.clear')}</button>}
              <span className="font-mono-tech text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded">{rival.length} / 6</span>
            </div>
          </div>
          <div className="p-4 overflow-visible">
            <PokemonSearch onAdd={addToRival} maxReached={rival.length >= 6} placeholder={t('lo.placeholder_rival')} />
            <div className="mt-3 flex flex-col gap-2">
              {rival.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between bg-[#111820] border border-[#1c2830] rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tech text-xs text-[#4a6070]">{i + 1}</span>
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
                  <p className="text-[#4a6070] text-sm italic mb-1">{t('lo.empty_rival')}</p>
                  <p className="text-[#2a3840] text-xs font-mono-tech">{t('lo.empty_rival_sub')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analyze */}
      {myTeam.length >= 2 && rival.length > 0 && (
        <button onClick={analyze}
          className="w-full py-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl font-orbitron text-yellow-400 font-bold tracking-widest uppercase hover:bg-yellow-400/20 hover:border-yellow-400/50 transition-all mb-6"
          style={{ boxShadow: '0 0 20px rgba(240,192,64,0.1)' }}>
          {t('lo.analyze')}
        </button>
      )}

      {/* Results */}
      {analyzed && result && (
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] flex items-center justify-between">
            <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-yellow-400">{t('lo.results_title')}</h2>
            <button onClick={copyResult} className="font-mono-tech text-xs text-[#4a6070] hover:text-white transition-colors border border-[#1c2830] hover:border-[#2a3840] px-3 py-1.5 rounded-lg">
              {copied ? t('global.copied') : t('lo.copy')}
            </button>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {result.slice(0, 5).map((pair, i) => {
              const pct = Math.round((pair.score / maxScore) * 100)
              const rankEmoji = ['🥇','🥈','🥉','4️⃣','5️⃣'][i]
              const isTop = i === 0
              return (
                <div key={`${pair.p1.name}-${pair.p2.name}`}
                  className={`rounded-xl border p-4 ${isTop ? 'border-yellow-400/40 bg-yellow-400/5' : 'border-[#1c2830] bg-[#111820]'}`}>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{rankEmoji}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-lg">{pair.p1.name}</span>
                        <span className="text-yellow-400 font-orbitron">+</span>
                        <span className="font-bold text-white text-lg">{pair.p2.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {pair.p1.types.map(type => <TypeBadge key={type} type={type} />)}
                      <span className="text-[#4a6070] px-1">|</span>
                      {pair.p2.types.map(type => <TypeBadge key={`2-${type}`} type={type} />)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1.5 bg-[#1c2830] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: isTop ? '#f0c040' : '#3a5060' }} />
                    </div>
                    <span className="font-mono-tech text-xs text-[#4a6070] w-8 text-right">{pct}%</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="font-mono-tech text-xs text-green-400 mb-1">{t('lo.coverage')}</p>
                      <div className="flex flex-wrap gap-1">
                        {pair.coverage.map(c => (
                          <span key={c.name} className={`text-xs px-2 py-0.5 rounded border ${
                            c.mult >= 4 ? 'bg-red-900/20 text-red-300 border-red-900/30' :
                            c.mult >= 2 ? 'bg-green-900/20 text-green-300 border-green-900/30' :
                            'bg-[#1c2830] text-[#4a6070] border-[#243040]'
                          }`}>{c.name} {c.mult >= 2 ? `×${c.mult}` : '·'}</span>
                        ))}
                      </div>
                    </div>
                    {pair.threats.length > 0 && (
                      <div>
                        <p className="font-mono-tech text-xs text-red-400 mb-1">{t('lo.watch_out')}</p>
                        <div className="flex flex-wrap gap-1">
                          {pair.threats.map(threat => (
                            <span key={threat.name} className="text-xs bg-red-900/20 text-red-300 border border-red-900/30 px-2 py-0.5 rounded">
                              {threat.name} {threat.threatTo1 && threat.threatTo2 ? '(both)' : threat.threatTo1 ? `→ ${pair.p1.name}` : `→ ${pair.p2.name}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {isTop && (
                    <div className="mt-3 bg-yellow-400/5 border border-yellow-400/15 rounded-lg px-3 py-2">
                      <p className="font-mono-tech text-xs text-yellow-400">{t('lo.recommended')}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}