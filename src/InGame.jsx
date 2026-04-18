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

// ─── LÓGICA COMPETITIVA ───────────────────────────────────────────────────────
function analyzeMatchup(myP, rivalLeads) {
  let totalScore = 0
  const details = rivalLeads.map(rp => {
    const incomingMult = Math.max(...rp.types.map(rt => getEff(rt, myP.types)))
    const outgoingMult = Math.max(...myP.types.map(mt => getEff(mt, rp.types)))

    let defScore = 0
    if (incomingMult >= 4)        defScore = -60
    else if (incomingMult >= 2)   defScore = -25
    else if (incomingMult <= 0)   defScore = +30
    else if (incomingMult <= 0.5) defScore = +15

    let offScore = 0
    if (outgoingMult >= 4)        offScore = +50
    else if (outgoingMult >= 2)   offScore = +25
    else if (outgoingMult === 1)  offScore = +5
    else if (outgoingMult <= 0)   offScore = -10
    else if (outgoingMult <= 0.5) offScore = -5

    totalScore += defScore + offScore
    return { rival: rp, incomingMult, outgoingMult, defScore, offScore }
  })

  const criticalDanger  = details.some(d => d.incomingMult >= 4)
  const doubleWeakness  = details.every(d => d.incomingMult >= 2)
  const hasOffCoverage  = details.some(d => d.outgoingMult >= 2)
  const hasFullCoverage = details.every(d => d.outgoingMult >= 2)

  return { score: totalScore, details, criticalDanger, doubleWeakness, hasOffCoverage, hasFullCoverage }
}

function getSwitchReason(myPokemon, analysis, lang) {
  const threats = analysis.details.filter(d => d.incomingMult >= 2)
  if (analysis.criticalDanger) {
    const threat = analysis.details.find(d => d.incomingMult >= 4)
    return lang === 'es'
      ? `${myPokemon.name} recibe ×4 de ${threat.rival.name}`
      : `${myPokemon.name} takes ×4 from ${threat.rival.name}`
  }
  if (analysis.doubleWeakness) {
    return lang === 'es'
      ? `${myPokemon.name} es débil ×2 a ${threats.map(t => t.rival.name).join(' y ')}`
      : `${myPokemon.name} is ×2 weak to ${threats.map(t => t.rival.name).join(' and ')}`
  }
  return ''
}

function evaluateAsSwitch(p, rivalLeads) {
  const analysis = analyzeMatchup(p, rivalLeads)
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
    desc: lang === 'es' ? 'Uno de tus Pokémon recibe ×4. Cambia ahora.' : 'One Pokémon takes ×4 damage. Switch now.',
    forceSwitch: true, emoji: '🚨', battleColor: '#ff2244',
  }
  if (hasDouble) return {
    label: '⚠️ Desventaja clara', labelEN: '⚠️ Clear disadvantage',
    color: 'text-orange-400', bg: 'bg-orange-950/30', border: 'border-orange-500/30',
    desc: lang === 'es' ? 'Un Pokémon débil a ambos rivales. Considera cambiar.' : 'A Pokémon weak to both rivals. Consider switching.',
    forceSwitch: false, emoji: '⚠️', battleColor: '#ff8844',
  }
  if (avgScore >= 60 && bothSuperEff) return {
    label: '✅ Ventaja dominante', labelEN: '✅ Dominant advantage',
    color: 'text-green-400', bg: 'bg-green-950/30', border: 'border-green-500/30',
    desc: lang === 'es' ? 'Dominas ofensiva y defensivamente. Mantén.' : 'You dominate offensively and defensively. Keep it.',
    forceSwitch: false, emoji: '✅', battleColor: '#33cc66',
  }
  if (avgScore >= 20 || bothGood) return {
    label: '🟢 Ventaja', labelEN: '🟢 Advantage',
    color: 'text-green-400', bg: 'bg-green-950/20', border: 'border-green-900/30',
    desc: lang === 'es' ? 'Buen matchup. Mantén tu lead.' : 'Good matchup. Keep your lead.',
    forceSwitch: false, emoji: '🟢', battleColor: '#33aa55',
  }
  if (avgScore >= -20) return {
    label: '⚖️ Matchup neutro', labelEN: '⚖️ Neutral matchup',
    color: 'text-[#8899aa]', bg: 'bg-[#111820]', border: 'border-[#1c2830]',
    desc: lang === 'es' ? 'Matchup equilibrado. Depende de la estrategia.' : 'Balanced matchup. Depends on your strategy.',
    forceSwitch: false, emoji: '⚖️', battleColor: '#6688aa',
  }
  return {
    label: '🟠 Ligera desventaja', labelEN: '🟠 Slight disadvantage',
    color: 'text-orange-400', bg: 'bg-orange-950/20', border: 'border-orange-900/30',
    desc: lang === 'es' ? 'Matchup desfavorable. Valora si hay mejor opción.' : 'Unfavorable matchup. Check if you have a better option.',
    forceSwitch: false, emoji: '🟠', battleColor: '#ff8844',
  }
}

function MultBadge({ mult }) {
  if (mult >= 4) return <span className="font-mono-tech text-xs font-bold text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded">×4 🔥</span>
  if (mult >= 2) return <span className="font-mono-tech text-xs font-bold text-orange-400 bg-orange-900/30 px-1.5 py-0.5 rounded">×2</span>
  if (mult <= 0) return <span className="font-mono-tech text-xs font-bold text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded">×0</span>
  if (mult <= 0.5) return <span className="font-mono-tech text-xs font-bold text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">×½</span>
  return <span className="font-mono-tech text-xs text-[#4a6070]">×1</span>
}

// ─── MODO BATALLA ─────────────────────────────────────────────────────────────
function BattleMode({ myLead, rivalLead, myTeam, onClose, onReset, lang }) {
  const canAnalyze = myLead.length === 2 && rivalLead.length === 2
  const myLeadAnalyses = canAnalyze ? myLead.map(p => ({ pokemon: p, ...analyzeMatchup(p, rivalLead) })) : []
  const verdict = canAnalyze ? getVerdict(myLeadAnalyses, lang) : null

  const bench = canAnalyze
    ? myTeam.filter(p => !myLead.find(l => l.name === p.name))
        .map(p => evaluateAsSwitch(p, rivalLead))
        .sort((a, b) => b.switchScore - a.switchScore)
    : []

  const worstLead = myLeadAnalyses.length > 0
    ? myLeadAnalyses.reduce((worst, curr) => curr.score < worst.score ? curr : worst)
    : null

  const bestSwitch = bench[0]
  const shouldSwitch = verdict && (
    verdict.forceSwitch ||
    (worstLead && (worstLead.criticalDanger || worstLead.doubleWeakness) && bestSwitch && bestSwitch.switchScore > worstLead.score)
  )

  return (
    <div className="fixed inset-0 z-50 bg-[#04060a] flex flex-col overflow-hidden">
      <style>{`
        @keyframes urgentPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        @keyframes verdictIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Fondo con glow del veredicto */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{ background: verdict ? `radial-gradient(ellipse 80% 50% at 50% 50%, ${verdict.battleColor}12 0%, transparent 70%)` : 'none' }} />

      {/* Header compacto */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-[#1c2830]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="font-orbitron text-xs font-bold text-red-400 tracking-widest">
            {lang === 'es' ? 'MODO BATALLA' : 'BATTLE MODE'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onReset}
            className="font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors">
            {lang === 'es' ? 'Nuevo turno' : 'New turn'}
          </button>
          <button onClick={onClose}
            className="font-mono-tech text-xs text-[#4a6070] hover:text-white transition-colors border border-[#1c2830] px-3 py-1.5 rounded-lg">
            ✕ {lang === 'es' ? 'Salir' : 'Exit'}
          </button>
        </div>
      </div>

      {/* Contenido principal — scrolleable */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

        {/* Leads en dos columnas */}
        <div className="grid grid-cols-2 gap-3">
          {/* Mi lead */}
          <div className="bg-[#0c1015] border border-yellow-400/20 rounded-2xl p-3">
            <p className="font-orbitron text-xs font-bold text-yellow-400 tracking-widest mb-2 text-center">
              {lang === 'es' ? 'MI LEAD' : 'MY LEAD'}
            </p>
            <div className="flex justify-center gap-2">
              {myLead.length > 0 ? myLead.map((p, i) => {
                const analysis = myLeadAnalyses.find(a => a.pokemon.name === p.name)
                const hasDanger = analysis?.criticalDanger || analysis?.doubleWeakness
                return (
                  <div key={p.name} className={`flex flex-col items-center gap-1 rounded-xl p-2 flex-1 ${hasDanger ? 'bg-red-950/30 border border-red-500/30' : 'bg-[#111820]'}`}>
                    <PokemonSprite pokemon={p} size={52} />
                    <p className="font-bold text-white text-xs text-center leading-tight">{p.name}</p>
                    {hasDanger && <span className="text-xs text-red-400">⚠</span>}
                  </div>
                )
              }) : (
                <p className="text-[#4a6070] text-xs text-center py-4">
                  {lang === 'es' ? 'Sin seleccionar' : 'Not selected'}
                </p>
              )}
            </div>
          </div>

          {/* Lead rival */}
          <div className="bg-[#0c1015] border border-red-400/20 rounded-2xl p-3">
            <p className="font-orbitron text-xs font-bold text-red-400 tracking-widest mb-2 text-center">
              {lang === 'es' ? 'RIVAL' : 'RIVAL'}
            </p>
            <div className="flex justify-center gap-2">
              {rivalLead.length > 0 ? rivalLead.map(p => (
                <div key={p.name} className="flex flex-col items-center gap-1 bg-[#111820] rounded-xl p-2 flex-1">
                  <PokemonSprite pokemon={p} size={52} />
                  <p className="font-bold text-white text-xs text-center leading-tight">{p.name}</p>
                </div>
              )) : (
                <p className="text-[#4a6070] text-xs text-center py-4">
                  {lang === 'es' ? 'Sin seleccionar' : 'Not selected'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* VEREDICTO — el corazón del modo batalla */}
        {canAnalyze && verdict ? (
          <div className="rounded-2xl border p-5 text-center"
            style={{
              borderColor: `${verdict.battleColor}50`,
              background: `${verdict.battleColor}10`,
              animation: verdict.forceSwitch ? 'urgentPulse 1.5s ease-in-out infinite' : 'verdictIn 0.4s ease both',
              boxShadow: `0 0 40px ${verdict.battleColor}20`,
            }}>
            {/* Emoji grande */}
            <div className="text-5xl mb-2">{verdict.emoji}</div>

            {/* Label principal */}
            <p className="font-orbitron text-2xl font-black mb-2" style={{ color: verdict.battleColor }}>
              {lang === 'es' ? verdict.label : verdict.labelEN}
            </p>

            {/* Descripción */}
            <p className="font-mono-tech text-sm text-[#8899aa] mb-3">{verdict.desc}</p>

            {/* Razón específica si hay peligro */}
            {worstLead && (worstLead.criticalDanger || worstLead.doubleWeakness) && (
              <p className="font-mono-tech text-sm font-bold" style={{ color: verdict.battleColor }}>
                {getSwitchReason(worstLead.pokemon, worstLead, lang)}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#1c2830] p-6 text-center bg-[#0c1015]">
            <p className="font-orbitron text-lg font-black text-[#4a6070] mb-1">
              {lang === 'es' ? 'SELECCIONA TUS LEADS' : 'SELECT YOUR LEADS'}
            </p>
            <p className="font-mono-tech text-xs text-[#2a3840]">
              {lang === 'es' ? 'Vuelve al modo normal para seleccionar' : 'Go back to normal mode to select'}
            </p>
          </div>
        )}

        {/* Recomendación de cambio */}
        {shouldSwitch && bestSwitch && (
          <div className="rounded-2xl border border-green-500/30 bg-green-950/20 p-4">
            <p className="font-orbitron text-xs font-bold text-green-400 tracking-widest mb-3 text-center">
              {lang === 'es' ? '→ ENTRA ESTE' : '→ BRING THIS ONE'}
            </p>
            <div className="flex items-center gap-4">
              {/* Sale */}
              {worstLead && (
                <div className="flex flex-col items-center gap-1 opacity-40 flex-1">
                  <PokemonSprite pokemon={worstLead.pokemon} size={44} />
                  <p className="font-mono-tech text-xs text-red-400 text-center">
                    {lang === 'es' ? 'Sale' : 'Out'}
                  </p>
                  <p className="font-bold text-white text-xs text-center line-through">{worstLead.pokemon.name}</p>
                </div>
              )}
              <span className="text-2xl text-[#4a6070]">→</span>
              {/* Entra */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <PokemonSprite pokemon={bestSwitch.pokemon} size={56} />
                <p className="font-mono-tech text-xs text-green-400 text-center">
                  {lang === 'es' ? 'Entra' : 'In'}
                </p>
                <p className="font-bold text-white text-sm text-center">{bestSwitch.pokemon.name}</p>
                <div className="flex gap-1 flex-wrap justify-center">
                  {bestSwitch.pokemon.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}
                </div>
              </div>
            </div>

            {/* Matchup del sustituto */}
            <div className="mt-3 flex gap-2 justify-center flex-wrap">
              {bestSwitch.analysis.details.map(d => (
                <div key={d.rival.name} className="flex items-center gap-1 bg-[#0c1015] rounded-lg px-2 py-1">
                  <span className="font-mono-tech text-xs text-[#4a6070]">vs {d.rival.name}:</span>
                  <MultBadge mult={d.incomingMult} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banco — compacto */}
        {bench.length > 0 && canAnalyze && (
          <div className="bg-[#0c1015] border border-[#1c2830] rounded-2xl overflow-hidden">
            <p className="font-orbitron text-xs font-bold text-[#4a6070] tracking-widest px-4 py-3 border-b border-[#1c2830]">
              {lang === 'es' ? 'BANCO' : 'BENCH'}
            </p>
            <div className="p-3 flex flex-col gap-2">
              {bench.map(({ pokemon, analysis }, i) => {
                const isBest = i === 0 && shouldSwitch
                return (
                  <div key={pokemon.name}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isBest ? 'bg-green-950/20 border border-green-500/20' : 'bg-[#111820]'}`}>
                    <PokemonSprite pokemon={pokemon} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white text-sm">{pokemon.name}</p>
                        {isBest && <span className="font-mono-tech text-xs text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">★</span>}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {analysis.details.map(d => (
                          <div key={d.rival.name} className="flex items-center gap-1">
                            <span className="font-mono-tech text-xs text-[#4a6070]">{d.rival.name.split('-')[0]}:</span>
                            <MultBadge mult={d.incomingMult} />
                            <span className="text-[#2a3840] text-xs">/</span>
                            <MultBadge mult={d.outgoingMult} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Padding inferior para que no tape el feedback button */}
        <div className="h-4" />
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function InGame() {
  const { lang } = useLang()
  const { myTeam, rivalTeam, addRivalPokemon } = useTeam()

  const [myLead, setMyLead] = useState([])
  const [rivalLead, setRivalLead] = useState([])
  const [battleMode, setBattleMode] = useState(false)

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
  const myLeadAnalyses = canAnalyze ? myLead.map(p => ({ pokemon: p, ...analyzeMatchup(p, rivalLead) })) : []
  const verdict = canAnalyze ? getVerdict(myLeadAnalyses, lang) : null

  const bench = canAnalyze
    ? myTeam.filter(p => !myLead.find(l => l.name === p.name))
        .map(p => evaluateAsSwitch(p, rivalLead))
        .sort((a, b) => b.switchScore - a.switchScore)
    : []

  const worstLead = myLeadAnalyses.length > 0
    ? myLeadAnalyses.reduce((worst, curr) => curr.score < worst.score ? curr : worst)
    : null

  const bestSwitch = bench[0]
  const shouldSwitch = verdict && (
    verdict.forceSwitch ||
    (worstLead && (worstLead.criticalDanger || worstLead.doubleWeakness) && bestSwitch && bestSwitch.switchScore > worstLead.score)
  )

  // ─── MODO BATALLA ─────────────────────────────────────────────────────────
  if (battleMode) {
    return (
      <BattleMode
        myLead={myLead}
        rivalLead={rivalLead}
        myTeam={myTeam}
        lang={lang}
        onClose={() => setBattleMode(false)}
        onReset={() => { reset(); }}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 bg-[#0c1015] border border-red-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <p className="font-orbitron text-red-400 text-sm font-bold tracking-widest">IN-GAME ADVISOR</p>
            </div>
            <p className="text-sm text-[#8899aa]">
              {lang === 'es'
                ? 'Selecciona tus 2 leads y los 2 del rival. Análisis competitivo real.'
                : 'Select your 2 leads and the rival\'s 2. Real competitive analysis.'}
            </p>
          </div>
          {/* Botón Modo Batalla */}
          <div className="sm:hidden flex flex-col items-end gap-1">
            <button
              onClick={() => setBattleMode(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-100"
              style={{ background: 'linear-gradient(135deg, #1a0808 0%, #2a0f0f 100%)', border: '1px solid rgba(255,34,68,0.4)', color: '#ff4466', boxShadow: '0 0 16px rgba(255,34,68,0.2)' }}>
              <span className="text-base">⚔️</span>
              {lang === 'es' ? 'Modo Batalla' : 'Battle Mode'}
            </button>
            <p className="font-mono-tech text-xs text-[#4a6070] text-right">
              {lang === 'es' ? 'Vista simplificada para usar en partida desde el móvil' : 'Simplified view for in-game use on mobile'}
            </p>
          </div>
        </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {myLeadAnalyses.map(({ pokemon, details, criticalDanger, doubleWeakness }) => {
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
                  </div>
                )
              })}
            </div>

            {shouldSwitch && bestSwitch && (
              <div className={`rounded-xl border p-4 ${verdict.forceSwitch ? 'border-red-500/40 bg-red-950/30' : 'border-orange-500/30 bg-orange-950/20'}`}>
                <p className={`font-mono-tech text-xs tracking-widest mb-3 ${verdict.forceSwitch ? 'text-red-400' : 'text-orange-400'}`}>
                  {verdict.forceSwitch ? (lang === 'es' ? '🚨 CAMBIA AHORA' : '🚨 SWITCH NOW') : (lang === 'es' ? '⚠️ CONSIDERA ESTE CAMBIO' : '⚠️ CONSIDER THIS SWITCH')}
                </p>
                <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-2">
                    <PokemonSprite pokemon={bestSwitch.pokemon} size={52} />
                    <div>
                      <p className="font-bold text-white text-lg">{bestSwitch.pokemon.name}</p>
                      <div className="flex gap-1 mt-1">{bestSwitch.pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {bench.length > 0 && (
            <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
              <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830]">
                <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-[#4a6070]">
                  {lang === 'es' ? 'Tu banco vs este lead' : 'Your bench vs this lead'}
                </h2>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bench.map(({ pokemon, analysis }, i) => {
                  const isBest = i === 0 && shouldSwitch
                  return (
                    <div key={pokemon.name} className={`rounded-xl border p-3 ${isBest ? 'border-green-500/30 bg-green-950/10' : 'border-[#1c2830] bg-[#111820]'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <PokemonSprite pokemon={pokemon} size={40} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-white">{pokemon.name}</p>
                            {isBest && <span className="font-mono-tech text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">{lang === 'es' ? 'MEJOR' : 'BEST'}</span>}
                          </div>
                          <div className="flex gap-1 mt-0.5">{pokemon.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {analysis.details.map(d => (
                          <div key={d.rival.name} className="flex items-center gap-1">
                            <span className="font-mono-tech text-xs text-[#4a6070]">vs {d.rival.name}:</span>
                            <MultBadge mult={d.incomingMult} />
                            <span className="font-mono-tech text-xs text-[#2a3840]">/</span>
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