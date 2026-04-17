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

// ─── LÓGICA COMPETITIVA REAL ───────────────────────────────────────────────
//
// Para cada Pokémon propio vs cada rival, calculamos:
//   - incomingMax: el mayor multiplicador de daño que recibe (amenaza defensiva)
//   - outgoingMax: el mayor multiplicador que puede infligir (cobertura ofensiva)
//
// Scoring individual vs UN rival:
//   Defensiva (lo que nos pueden hacer):
//     ×4 entrante → -60  (peligro crítico — casi seguro KO en 1 turno)
//     ×2 entrante → -25  (peligro significativo)
//     ×1 entrante → 0
//     ×0.5 entrante → +15 (resistencia útil)
//     ×0 entrante → +30  (inmunidad — muy valioso)
//
//   Ofensiva (lo que podemos hacer):
//     ×4 saliente → +50  (OHKO casi garantizado)
//     ×2 saliente → +25  (ventaja ofensiva clara)
//     ×1 saliente → +5
//     ×0.5 saliente → -5 (resistido)
//     ×0 saliente → -10  (bloqueado)
//
// Score total = suma vs ambos rivales
// Luego calculamos flags de peligro y recomendación de cambio

function analyzeMatchup(myP, rivalLeads) {
  let totalScore = 0
  const details = rivalLeads.map(rp => {
    // Defensa: lo que el rival nos puede hacer
    const incomingMult = Math.max(...rp.types.map(rt => getEff(rt, myP.types)))
    // Ofensa: lo que nosotros le podemos hacer
    const outgoingMult = Math.max(...myP.types.map(mt => getEff(mt, rp.types)))

    let defScore = 0
    if (incomingMult >= 4)       defScore = -60
    else if (incomingMult >= 2)  defScore = -25
    else if (incomingMult <= 0)  defScore = +30
    else if (incomingMult <= 0.5) defScore = +15

    let offScore = 0
    if (outgoingMult >= 4)       offScore = +50
    else if (outgoingMult >= 2)  offScore = +25
    else if (outgoingMult === 1) offScore = +5
    else if (outgoingMult <= 0)  offScore = -10
    else if (outgoingMult <= 0.5) offScore = -5

    totalScore += defScore + offScore

    return {
      rival: rp,
      incomingMult,
      outgoingMult,
      defScore,
      offScore,
    }
  })

  // Flags de peligro — evaluamos cada rival por separado
  const criticalDanger  = details.some(d => d.incomingMult >= 4)   // ×4 de algún rival
  const significantDanger = details.filter(d => d.incomingMult >= 2).length // cuántos rivales nos golpean ×2+
  const doubleWeakness  = details.every(d => d.incomingMult >= 2)  // ×2 de AMBOS rivales
  const hasOffCoverage  = details.some(d => d.outgoingMult >= 2)   // golpeamos SE a alguno
  const hasFullCoverage = details.every(d => d.outgoingMult >= 2)  // golpeamos SE a ambos

  return {
    score: totalScore,
    details,
    criticalDanger,
    significantDanger,
    doubleWeakness,
    hasOffCoverage,
    hasFullCoverage,
  }
}

// Genera el mensaje de razón de cambio específico
function getSwitchReason(myPokemon, analysis, rivalLeads, lang) {
  const threats = analysis.details.filter(d => d.incomingMult >= 2)
  if (analysis.criticalDanger) {
    const threat = analysis.details.find(d => d.incomingMult >= 4)
    return lang === 'es'
      ? `${myPokemon.name} recibe daño ×4 de ${threat.rival.name} — cambio urgente`
      : `${myPokemon.name} takes ×4 damage from ${threat.rival.name} — urgent switch`
  }
  if (analysis.doubleWeakness) {
    return lang === 'es'
      ? `${myPokemon.name} es débil ×2 a ${threats.map(t => t.rival.name).join(' y ')} — muy expuesto`
      : `${myPokemon.name} is ×2 weak to ${threats.map(t => t.rival.name).join(' and ')} — too exposed`
  }
  if (threats.length === 1) {
    return lang === 'es'
      ? `${myPokemon.name} es débil ×2 a ${threats[0].rival.name}`
      : `${myPokemon.name} is ×2 weak to ${threats[0].rival.name}`
  }
  return ''
}

// Evalúa qué tan bueno es un Pokémon del banco como reemplazo
function evaluateAsSwitch(p, rivalLeads) {
  const analysis = analyzeMatchup(p, rivalLeads)
  // Penalizar mucho si tiene debilidades, premiar si resiste ambos y golpea SE
  let switchScore = analysis.score
  if (analysis.criticalDanger) switchScore -= 50
  if (analysis.doubleWeakness) switchScore -= 30
  if (analysis.hasFullCoverage) switchScore += 20
  return { pokemon: p, analysis, switchScore }
}

function getVerdict(myLeadAnalyses, lang) {
  const hasCritical = myLeadAnalyses.some(a => a.criticalDanger)
  const hasDouble   = myLeadAnalyses.some(a => a.doubleWeakness)
  const avgScore    = myLeadAnalyses.reduce((s, a) => s + a.score, 0)
  const bothGood    = myLeadAnalyses.every(a => !a.doubleWeakness && !a.criticalDanger && a.score >= 0)
  const bothSuperEff = myLeadAnalyses.every(a => a.hasOffCoverage)

  if (hasCritical) return {
    label: '🚨 CAMBIO URGENTE', labelEN: '🚨 URGENT SWITCH',
    color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-500/40',
    desc: lang === 'es' ? 'Uno de tus Pokémon recibe ×4 de daño. Cambia ahora.' : 'One of your Pokémon takes ×4 damage. Switch now.',
    forceSwitch: true,
  }
  if (hasDouble) return {
    label: '⚠️ Desventaja clara', labelEN: '⚠️ Clear disadvantage',
    color: 'text-orange-400', bg: 'bg-orange-950/30', border: 'border-orange-500/30',
    desc: lang === 'es' ? 'Un Pokémon es débil a ambos rivales. Considera cambiar.' : 'A Pokémon is weak to both rivals. Consider switching.',
    forceSwitch: false,
  }
  if (avgScore >= 60 && bothSuperEff) return {
    label: '✅ Ventaja dominante', labelEN: '✅ Dominant advantage',
    color: 'text-green-400', bg: 'bg-green-950/30', border: 'border-green-500/30',
    desc: lang === 'es' ? 'Tu lead domina ofensiva y defensivamente. Mantén.' : 'Your lead dominates offensively and defensively. Keep it.',
    forceSwitch: false,
  }
  if (avgScore >= 20 || bothGood) return {
    label: '🟢 Ventaja', labelEN: '🟢 Advantage',
    color: 'text-green-400', bg: 'bg-green-950/20', border: 'border-green-900/30',
    desc: lang === 'es' ? 'Buen matchup. Mantén tu lead.' : 'Good matchup. Keep your lead.',
    forceSwitch: false,
  }
  if (avgScore >= -20) return {
    label: '⚖️ Matchup neutro', labelEN: '⚖️ Neutral matchup',
    color: 'text-[#8899aa]', bg: 'bg-[#111820]', border: 'border-[#1c2830]',
    desc: lang === 'es' ? 'Matchup equilibrado. Depende de la estrategia.' : 'Balanced matchup. Depends on your strategy.',
    forceSwitch: false,
  }
  return {
    label: '🟠 Ligera desventaja', labelEN: '🟠 Slight disadvantage',
    color: 'text-orange-400', bg: 'bg-orange-950/20', border: 'border-orange-900/30',
    desc: lang === 'es' ? 'Matchup desfavorable. Valora si hay mejor opción en el banco.' : 'Unfavorable matchup. Check if you have a better option on the bench.',
    forceSwitch: false,
  }
}

function MultBadge({ mult }) {
  if (mult >= 4) return <span className="font-mono-tech text-xs font-bold text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded">×4 🔥</span>
  if (mult >= 2) return <span className="font-mono-tech text-xs font-bold text-orange-400 bg-orange-900/30 px-1.5 py-0.5 rounded">×2</span>
  if (mult <= 0) return <span className="font-mono-tech text-xs font-bold text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded">×0 inmune</span>
  if (mult <= 0.5) return <span className="font-mono-tech text-xs font-bold text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">×½ resiste</span>
  return <span className="font-mono-tech text-xs text-[#4a6070]">×1</span>
}

export default function InGame() {
  const { lang } = useLang()
  const { myTeam, rivalTeam, addRivalPokemon } = useTeam()

  const [myLead, setMyLead] = useState([])
  const [rivalLead, setRivalLead] = useState([])

  function toggleMyLead(p) {
    if (myLead.find(x => x.name === p.name)) setMyLead(myLead.filter(x => x.name !== p.name))
    else { if (myLead.length >= 2) return; setMyLead([...myLead, p]) }
  }

  function toggleRivalLead(p) {
    if (rivalLead.find(x => x.name === p.name)) setRivalLead(rivalLead.filter(x => x.name !== p.name))
    else { if (rivalLead.length >= 2) return; setRivalLead([...rivalLead, p]) }
  }

  function addManualRival(p) {
    addRivalPokemon(p)
    if (rivalLead.length < 2) setRivalLead(prev => [...prev, p])
  }

  function reset() { setMyLead([]); setRivalLead([]) }

  const canAnalyze = myLead.length === 2 && rivalLead.length === 2

  // Análisis completo — solo cuando hay datos
  const myLeadAnalyses = canAnalyze ? myLead.map(p => ({ pokemon: p, ...analyzeMatchup(p, rivalLead) })) : []
  const verdict = canAnalyze ? getVerdict(myLeadAnalyses, lang) : null

  // Banco — ordenado por switchScore
  const bench = canAnalyze
    ? myTeam.filter(p => !myLead.find(l => l.name === p.name))
        .map(p => evaluateAsSwitch(p, rivalLead))
        .sort((a, b) => b.switchScore - a.switchScore)
    : []

  // Pokémon del lead que debería cambiar (el peor)
  const worstLead = myLeadAnalyses.length > 0
    ? myLeadAnalyses.reduce((worst, curr) => curr.score < worst.score ? curr : worst)
    : null

  // Mejor sustituto del banco
  const bestSwitch = bench[0]

  // ¿Recomendar cambio?
  const shouldSwitch = verdict && (
    verdict.forceSwitch ||
    (worstLead && (worstLead.criticalDanger || worstLead.doubleWeakness) && bestSwitch && bestSwitch.switchScore > worstLead.score)
  )

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
            ? 'Selecciona tus 2 leads y los 2 del rival. Análisis competitivo real — debilidades, coberturas y cambios.'
            : 'Select your 2 leads and the rival\'s 2. Real competitive analysis — weaknesses, coverage and switches.'}
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
                <p className="text-[#4a6070] text-sm italic mb-1">{lang === 'es' ? 'Tu equipo está vacío' : 'Your team is empty'}</p>
                <p className="text-[#2a3840] text-xs font-mono-tech">{lang === 'es' ? 'Añade tu equipo en Rival Analysis primero' : 'Add your team in Rival Analysis first'}</p>
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
                      <div className="flex justify-center mb-1"><PokemonSprite pokemon={p} size={44} /></div>
                      <p className="font-bold text-white text-xs truncate">{p.name}</p>
                      <div className="flex justify-center gap-1 mt-1 flex-wrap">{p.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}</div>
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
                {lang === 'es' ? 'Lead del Rival' : "Rival's Lead"}
              </h2>
              <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">
                {lang === 'es' ? 'Selecciona o añade los 2 del rival' : "Select or add the rival's 2"}
              </p>
            </div>
            <span className={`font-mono-tech text-xs px-2.5 py-1 rounded border ${rivalLead.length === 2 ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-[#4a6070] bg-[#0c1015] border-[#1c2830]'}`}>
              {rivalLead.length} / 2
            </span>
          </div>
          <div className="p-4 overflow-visible">
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
                        <div className="flex justify-center mb-1"><PokemonSprite pokemon={p} size={44} /></div>
                        <p className="font-bold text-white text-xs truncate">{p.name}</p>
                        <div className="flex justify-center gap-1 mt-1 flex-wrap">{p.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}</div>
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
                  {lang === 'es' ? 'Añade los 2 Pokémon del rival:' : "Add the rival's 2 Pokémon:"}
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

          {/* Veredicto principal */}
          <div className={`rounded-xl border p-5 ${verdict.border} ${verdict.bg}`}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
              <p className={`font-orbitron text-xl font-black ${verdict.color}`}>
                {lang === 'es' ? verdict.label : verdict.labelEN}
              </p>
              <button onClick={reset}
                className="font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors border border-[#1c2830] px-3 py-1.5 rounded-lg">
                {lang === 'es' ? 'Nuevo turno' : 'New turn'}
              </button>
            </div>
            <p className="font-mono-tech text-sm text-[#8899aa] mb-4">{verdict.desc}</p>

            {/* Análisis individual de cada lead */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myLeadAnalyses.map(({ pokemon, details, criticalDanger, doubleWeakness, hasOffCoverage, score }) => {
                const danger = criticalDanger ? 'border-red-500/50 bg-red-950/30' : doubleWeakness ? 'border-orange-500/30 bg-orange-950/20' : 'border-white/5 bg-[#0c1015]/60'
                return (
                  <div key={pokemon.name} className={`rounded-xl p-3 border ${danger}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <PokemonSprite pokemon={pokemon} size={44} />
                      <div>
                        <p className="font-bold text-white">{pokemon.name}</p>
                        <div className="flex gap-1 mt-0.5">{pokemon.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}</div>
                      </div>
                      {criticalDanger && <span className="ml-auto font-mono-tech text-xs text-red-400 bg-red-900/40 px-2 py-0.5 rounded">⚠ PELIGRO</span>}
                    </div>

                    {/* Detalle vs cada rival */}
                    <div className="flex flex-col gap-2">
                      {details.map(d => (
                        <div key={d.rival.name} className="bg-[#111820] rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <PokemonSprite pokemon={d.rival} size={24} />
                              <span className="font-mono-tech text-xs text-white">{d.rival.name}</span>
                            </div>
                          </div>
                          <div className="flex gap-3 flex-wrap">
                            <div className="flex items-center gap-1">
                              <span className="font-mono-tech text-xs text-[#4a6070]">{lang === 'es' ? 'Recibe:' : 'Takes:'}</span>
                              <MultBadge mult={d.incomingMult} />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono-tech text-xs text-[#4a6070]">{lang === 'es' ? 'Inflige:' : 'Deals:'}</span>
                              <MultBadge mult={d.outgoingMult} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Razón de cambio si aplica */}
                    {(criticalDanger || doubleWeakness) && worstLead?.pokemon.name === pokemon.name && (
                      <p className="font-mono-tech text-xs text-orange-400 mt-2">
                        {getSwitchReason(pokemon, { criticalDanger, doubleWeakness, details }, rivalLead, lang)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recomendación de cambio */}
          {shouldSwitch && bestSwitch && (
            <div className={`rounded-xl border p-5 ${verdict.forceSwitch ? 'border-red-500/40 bg-red-950/30' : 'border-orange-500/30 bg-orange-950/20'}`}>
              <p className={`font-mono-tech text-xs tracking-widest mb-3 ${verdict.forceSwitch ? 'text-red-400' : 'text-orange-400'}`}>
                {verdict.forceSwitch
                  ? (lang === 'es' ? '🚨 CAMBIA AHORA' : '🚨 SWITCH NOW')
                  : (lang === 'es' ? '⚠️ CONSIDERA ESTE CAMBIO' : '⚠️ CONSIDER THIS SWITCH')}
              </p>
              <div className="flex items-center gap-4">
                {/* Quién sale */}
                {worstLead && (
                  <>
                    <div className="flex items-center gap-2 opacity-50">
                      <PokemonSprite pokemon={worstLead.pokemon} size={44} />
                      <div>
                        <p className="font-bold text-white line-through">{worstLead.pokemon.name}</p>
                        <p className="font-mono-tech text-xs text-red-400">{lang === 'es' ? 'Sale' : 'Out'}</p>
                      </div>
                    </div>
                    <span className="text-[#4a6070] text-xl">→</span>
                  </>
                )}
                {/* Quién entra */}
                <div className="flex items-center gap-2">
                  <PokemonSprite pokemon={bestSwitch.pokemon} size={52} />
                  <div>
                    <p className="font-bold text-white text-lg">{bestSwitch.pokemon.name}</p>
                    <div className="flex gap-1 mt-1">{bestSwitch.pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                    <div className="flex gap-3 mt-1">
                      {bestSwitch.analysis.details.map(d => (
                        <div key={d.rival.name} className="flex items-center gap-1">
                          <span className="font-mono-tech text-xs text-[#4a6070]">vs {d.rival.name}:</span>
                          <MultBadge mult={d.incomingMult} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banco completo ordenado */}
          {bench.length > 0 && (
            <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
              <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830]">
                <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-[#4a6070]">
                  {lang === 'es' ? 'Tu banco vs este lead' : 'Your bench vs this lead'}
                </h2>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bench.map(({ pokemon, analysis, switchScore }, i) => {
                  const isBest = i === 0 && shouldSwitch
                  return (
                    <div key={pokemon.name} className={`rounded-xl border p-3 ${isBest ? 'border-green-500/30 bg-green-950/10' : 'border-[#1c2830] bg-[#111820]'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <PokemonSprite pokemon={pokemon} size={40} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-white">{pokemon.name}</p>
                            {isBest && <span className="font-mono-tech text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">{lang === 'es' ? 'MEJOR CAMBIO' : 'BEST SWITCH'}</span>}
                          </div>
                          <div className="flex gap-1 mt-0.5">{pokemon.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {analysis.details.map(d => (
                          <div key={d.rival.name} className="flex items-center gap-1">
                            <span className="font-mono-tech text-xs text-[#4a6070]">vs {d.rival.name}:</span>
                            <MultBadge mult={d.incomingMult} />
                            <span className="font-mono-tech text-xs text-[#4a6070]">/</span>
                            <MultBadge mult={d.outgoingMult} />
                          </div>
                        ))}
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