import { useState } from 'react'
import PokemonSearch from './PokemonSearch'
import TypeBadge from './TypeBadge'
import { getEff, getSpriteUrl } from './data'
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

function getMatchupScore(myP, rivalLeads) {
  let offScore = 0, defScore = 0
  rivalLeads.forEach(rp => {
    const bestOff = Math.max(...myP.types.map(t => getEff(t, rp.types)))
    if (bestOff >= 4) offScore += 40
    else if (bestOff >= 2) offScore += 20
    else if (bestOff === 1) offScore += 5
    else offScore -= 5
    const worstDef = Math.max(...rp.types.map(t => getEff(t, myP.types)))
    if (worstDef >= 4) defScore -= 35
    else if (worstDef >= 2) defScore -= 15
    else if (worstDef <= 0) defScore += 20
    else if (worstDef <= 0.5) defScore += 10
  })
  return { offScore, defScore, total: offScore + defScore }
}

function getVerdict(total) {
  if (total >= 60)  return { label: '✅ Ventaja clara',      labelEN: '✅ Clear advantage',     color: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-500/30' }
  if (total >= 20)  return { label: '🟡 Ligera ventaja',    labelEN: '🟡 Slight advantage',    color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30' }
  if (total >= -20) return { label: '⚖️ Matchup neutro',    labelEN: '⚖️ Neutral matchup',     color: 'text-[#8899aa]',  bg: 'bg-[#111820]',     border: 'border-[#1c2830]' }
  if (total >= -50) return { label: '🟠 Ligera desventaja', labelEN: '🟠 Slight disadvantage', color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-500/30' }
  return             { label: '❌ Desventaja clara',         labelEN: '❌ Clear disadvantage',  color: 'text-red-400',    bg: 'bg-red-900/20',    border: 'border-red-500/30' }
}

export default function InGame() {
  const { lang } = useLang()
  const { myTeam, rivalTeam, addRivalPokemon, removeRivalPokemon, clearRivalTeam } = useTeam()

  const [myLead, setMyLead] = useState([])
  const [rivalLead, setRivalLead] = useState([])

  function toggleMyLead(p) {
    if (myLead.find(x => x.name === p.name)) {
      setMyLead(myLead.filter(x => x.name !== p.name))
    } else {
      if (myLead.length >= 2) return
      setMyLead([...myLead, p])
    }
  }

  // El lead rival se selecciona de rivalTeam (si hay) o se busca manualmente
  function toggleRivalLead(p) {
    if (rivalLead.find(x => x.name === p.name)) {
      setRivalLead(rivalLead.filter(x => x.name !== p.name))
    } else {
      if (rivalLead.length >= 2) return
      setRivalLead([...rivalLead, p])
    }
  }

  function addManualRival(p) {
    addRivalPokemon(p)
    if (rivalLead.length < 2) setRivalLead(prev => [...prev, p])
  }

  function reset() { setMyLead([]); setRivalLead([]) }

  const myLeadScores   = myLead.map(p => ({ pokemon: p, ...getMatchupScore(p, rivalLead) }))
  const benchScores    = myTeam.filter(p => !myLead.find(l => l.name === p.name)).map(p => ({ pokemon: p, ...getMatchupScore(p, rivalLead) })).sort((a, b) => b.total - a.total)
  const totalLeadScore = myLeadScores.reduce((sum, s) => sum + s.total, 0)
  const verdict        = rivalLead.length > 0 && myLead.length > 0 ? getVerdict(totalLeadScore) : null
  const bestSwitch     = benchScores[0]
  const shouldSwitch   = verdict && totalLeadScore < -20 && bestSwitch && bestSwitch.total > totalLeadScore
  const canAnalyze     = myLead.length === 2 && rivalLead.length === 2

  return (
    <div>

      {/* Header */}
      <div className="mb-6 bg-[#0c1015] border border-red-500/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <p className="font-orbitron text-red-400 text-sm font-bold tracking-widest">IN-GAME ADVISOR</p>
        </div>
        <p className="text-sm text-[#8899aa]">
          {lang === 'es'
            ? 'Selecciona tus 2 leads y los 2 del rival. Te decimos si tienes ventaja o deberías cambiar.'
            : 'Select your 2 leads and the rival\'s 2. We tell you if you have an advantage or should switch.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* MI LEAD */}
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] flex items-center justify-between">
            <div>
              <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-white">
                {lang === 'es' ? 'Mi Lead' : 'My Lead'}
              </h2>
              <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">
                {lang === 'es' ? 'Selecciona los 2 que pusiste' : 'Select the 2 you sent out'}
              </p>
            </div>
            <span className={`font-mono-tech text-xs px-2.5 py-1 rounded border ${myLead.length === 2 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-[#4a6070] bg-[#0c1015] border-[#1c2830]'}`}>
              {myLead.length} / 2
            </span>
          </div>
          <div className="p-4">
            {myTeam.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#4a6070] text-sm italic mb-1">
                  {lang === 'es' ? 'Tu equipo está vacío' : 'Your team is empty'}
                </p>
                <p className="text-[#2a3840] text-xs font-mono-tech">
                  {lang === 'es' ? 'Añade tu equipo en Rival Analysis primero' : 'Add your team in Rival Analysis first'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {myTeam.map(p => {
                  const isSelected = !!myLead.find(x => x.name === p.name)
                  const isDisabled = !isSelected && myLead.length >= 2
                  return (
                    <button key={p.name} onClick={() => toggleMyLead(p)} disabled={isDisabled}
                      className={`rounded-xl border p-3 text-center transition-all duration-200 ${
                        isSelected ? 'border-yellow-400/50 bg-yellow-400/10 scale-[1.03]'
                        : isDisabled ? 'border-[#1c2830] bg-[#0c1015] opacity-30 cursor-not-allowed'
                        : 'border-[#1c2830] bg-[#111820] hover:border-yellow-400/30 hover:bg-yellow-400/5'
                      }`}>
                      <div className="flex justify-center mb-1">
                        <PokemonSprite pokemon={p} size={44} />
                      </div>
                      <p className="font-bold text-white text-xs truncate">{p.name}</p>
                      <div className="flex justify-center gap-1 mt-1 flex-wrap">
                        {p.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}
                      </div>
                      {isSelected && <p className="font-mono-tech text-xs text-yellow-400 mt-1">✓ LEAD</p>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* LEAD DEL RIVAL */}
        <div className="bg-[#0c1015] border border-red-400/20 rounded-xl overflow-visible">
          <div className="bg-[#111820] px-5 py-3.5 border-b border-red-400/20 flex items-center justify-between">
            <div>
              <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-red-400">
                {lang === 'es' ? 'Lead del Rival' : 'Rival\'s Lead'}
              </h2>
              <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">
                {lang === 'es' ? 'Selecciona o añade los 2 del rival' : 'Select or add the rival\'s 2'}
              </p>
            </div>
            <span className={`font-mono-tech text-xs px-2.5 py-1 rounded border ${rivalLead.length === 2 ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-[#4a6070] bg-[#0c1015] border-[#1c2830]'}`}>
              {rivalLead.length} / 2
            </span>
          </div>
          <div className="p-4 overflow-visible">

            {/* Si hay equipo rival guardado, muéstralo para seleccionar */}
            {rivalTeam.length > 0 ? (
              <>
                <p className="font-mono-tech text-xs text-red-400/60 mb-3">
                  {lang === 'es' ? 'Equipo del rival (del Rival Analysis):' : 'Rival team (from Rival Analysis):'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {rivalTeam.map(p => {
                    const isSelected = !!rivalLead.find(x => x.name === p.name)
                    const isDisabled = !isSelected && rivalLead.length >= 2
                    return (
                      <button key={p.name} onClick={() => toggleRivalLead(p)} disabled={isDisabled}
                        className={`rounded-xl border p-3 text-center transition-all duration-200 ${
                          isSelected ? 'border-red-400/50 bg-red-400/10 scale-[1.03]'
                          : isDisabled ? 'border-[#1c2830] bg-[#0c1015] opacity-30 cursor-not-allowed'
                          : 'border-[#1c2830] bg-[#111820] hover:border-red-400/30 hover:bg-red-400/5'
                        }`}>
                        <div className="flex justify-center mb-1">
                          <PokemonSprite pokemon={p} size={44} />
                        </div>
                        <p className="font-bold text-white text-xs truncate">{p.name}</p>
                        <div className="flex justify-center gap-1 mt-1 flex-wrap">
                          {p.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}
                        </div>
                        {isSelected && <p className="font-mono-tech text-xs text-red-400 mt-1">✓ LEAD</p>}
                      </button>
                    )
                  })}
                </div>
                <p className="font-mono-tech text-xs text-[#4a6070] mb-2">
                  {lang === 'es' ? '¿Sacó otro? Añádelo:' : 'Did they send out another? Add it:'}
                </p>
                <PokemonSearch onAdd={addManualRival} maxReached={rivalTeam.length >= 6}
                  placeholder={lang === 'es' ? 'Pokémon del rival...' : 'Rival Pokémon...'} />
              </>
            ) : (
              <>
                <p className="font-mono-tech text-xs text-[#4a6070] mb-3">
                  {lang === 'es'
                    ? 'Añade los Pokémon que sacó el rival (o ponlos en Rival Analysis para tenerlos guardados):'
                    : 'Add the rival\'s Pokémon (or add them in Rival Analysis to save them):'}
                </p>
                <PokemonSearch onAdd={addManualRival} maxReached={rivalLead.length >= 2}
                  placeholder={lang === 'es' ? 'Pokémon del rival...' : 'Rival Pokémon...'} />
                <div className="mt-3 flex flex-col gap-2">
                  {rivalLead.map(p => (
                    <div key={p.name} className="flex items-center justify-between bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <PokemonSprite pokemon={p} size={40} />
                        <span className="font-bold text-white">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                        <button onClick={() => setRivalLead(rivalLead.filter(x => x.name !== p.name))}
                          className="text-[#4a6070] hover:text-red-400 transition-colors ml-1 text-xl leading-none">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RESULTADO */}
      {canAnalyze && verdict && (
        <div className="flex flex-col gap-4">
          <div className={`rounded-xl border p-5 ${verdict.border} ${verdict.bg}`}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className={`font-orbitron text-xl font-black ${verdict.color}`}>
                  {lang === 'es' ? verdict.label : verdict.labelEN}
                </p>
                <p className="font-mono-tech text-xs text-[#4a6070] mt-1">
                  {lang === 'es'
                    ? `Score combinado de tu lead: ${totalLeadScore > 0 ? '+' : ''}${totalLeadScore}`
                    : `Combined lead score: ${totalLeadScore > 0 ? '+' : ''}${totalLeadScore}`}
                </p>
              </div>
              <button onClick={reset}
                className="font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors border border-[#1c2830] px-3 py-1.5 rounded-lg">
                {lang === 'es' ? 'Nuevo turno' : 'New turn'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {myLeadScores.map(s => {
                const v = getVerdict(s.total)
                return (
                  <div key={s.pokemon.name} className="bg-[#0c1015]/60 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <PokemonSprite pokemon={s.pokemon} size={44} />
                      <div>
                        <p className="font-bold text-white">{s.pokemon.name}</p>
                        <div className="flex gap-1 mt-0.5">{s.pokemon.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs font-mono-tech">
                      <span className="text-green-400">ATK: {s.offScore > 0 ? '+' : ''}{s.offScore}</span>
                      <span className="text-red-400">DEF: {s.defScore > 0 ? '+' : ''}{s.defScore}</span>
                      <span className={v.color}>Total: {s.total > 0 ? '+' : ''}{s.total}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {shouldSwitch && bestSwitch && (
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
                <p className="font-mono-tech text-xs text-orange-400 tracking-widest mb-3">
                  {lang === 'es' ? '⚠️ CONSIDERA HACER UN CAMBIO' : '⚠️ CONSIDER SWITCHING'}
                </p>
                <div className="flex items-center gap-3">
                  <PokemonSprite pokemon={bestSwitch.pokemon} size={52} />
                  <div>
                    <p className="font-bold text-white text-lg">{bestSwitch.pokemon.name}</p>
                    <div className="flex gap-1 mt-1">{bestSwitch.pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                    <p className="font-mono-tech text-xs text-orange-400 mt-1">
                      Score: {bestSwitch.total > 0 ? '+' : ''}{bestSwitch.total} {lang === 'es' ? 'vs este lead' : 'vs this lead'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!shouldSwitch && totalLeadScore >= 0 && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <p className="font-mono-tech text-xs text-green-400">
                  {lang === 'es'
                    ? '✅ Mantén tu lead. Tienes ventaja o matchup neutro con estos Pokémon.'
                    : '✅ Keep your lead. You have the advantage or a neutral matchup with these Pokémon.'}
                </p>
              </div>
            )}
          </div>

          {myTeam.length > 2 && (
            <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
              <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830]">
                <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-[#4a6070]">
                  {lang === 'es' ? 'Tu banco vs este lead' : 'Your bench vs this lead'}
                </h2>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benchScores.map((s, i) => {
                  const v = getVerdict(s.total)
                  return (
                    <div key={s.pokemon.name} className={`rounded-xl border p-3 ${i === 0 && shouldSwitch ? 'border-orange-500/30 bg-orange-900/10' : 'border-[#1c2830] bg-[#111820]'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <PokemonSprite pokemon={s.pokemon} size={44} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-white">{s.pokemon.name}</p>
                            {i === 0 && shouldSwitch && (
                              <span className="font-mono-tech text-xs text-orange-400 bg-orange-900/30 px-2 py-0.5 rounded">
                                {lang === 'es' ? 'MEJOR CAMBIO' : 'BEST SWITCH'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 mt-0.5">{s.pokemon.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-xs font-mono-tech">
                          <span className="text-green-400">ATK: {s.offScore > 0 ? '+' : ''}{s.offScore}</span>
                          <span className="text-red-400">DEF: {s.defScore > 0 ? '+' : ''}{s.defScore}</span>
                        </div>
                        <span className={`font-mono-tech text-xs font-bold ${v.color}`}>
                          {s.total > 0 ? '+' : ''}{s.total}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!canAnalyze && (
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-8 text-center">
          <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest uppercase mb-2">
            {lang === 'es' ? 'Esperando datos del combate' : 'Waiting for battle data'}
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <div className={`flex flex-col items-center gap-1 ${myLead.length === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <span className="font-orbitron text-2xl font-black" style={{ color: myLead.length === 2 ? '#f0c040' : '#4a6070' }}>{myLead.length}/2</span>
              <span className="font-mono-tech text-xs text-[#4a6070]">{lang === 'es' ? 'mi lead' : 'my lead'}</span>
            </div>
            <div className="text-[#2a3840] font-orbitron text-2xl">vs</div>
            <div className={`flex flex-col items-center gap-1 ${rivalLead.length === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <span className="font-orbitron text-2xl font-black" style={{ color: rivalLead.length === 2 ? '#ff4422' : '#4a6070' }}>{rivalLead.length}/2</span>
              <span className="font-mono-tech text-xs text-[#4a6070]">{lang === 'es' ? 'lead rival' : 'rival lead'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}