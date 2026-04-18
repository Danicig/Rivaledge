import { useState, useEffect } from 'react'
import PokemonSearch from './PokemonSearch'
import TypeBadge from './TypeBadge'
import { getEff, TIPOS, getSpriteUrl } from './data'
import { useLang } from './lang'
import { useTeam } from './TeamContext'

const SAVED_TEAMS_KEY = 'rivaledge_saved_teams'
const MAX_SAVED = 5

function loadSavedTeams() {
  try { return JSON.parse(localStorage.getItem(SAVED_TEAMS_KEY)) || [] } catch { return [] }
}
function saveSavedTeams(teams) {
  try { localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify(teams)) } catch {}
}

function PokemonSprite({ pokemon, size = 48 }) {
  const url = getSpriteUrl(pokemon.spriteId)
  if (!url) return null
  return (
    <img src={url} alt={pokemon.name} width={size} height={size}
      style={{ imageRendering: 'pixelated', flexShrink: 0 }}
      onError={e => { e.target.style.display = 'none' }} />
  )
}

const TYPE_GLOW = {
  fire:'#ff4422', water:'#2288ff', grass:'#33aa33', electric:'#ddbb00',
  psychic:'#ff4488', dragon:'#4433dd', dark:'#665544', steel:'#8899aa',
  fairy:'#ee88bb', fighting:'#bb3311', poison:'#9933bb', ghost:'#6655aa',
  ice:'#55ccee', rock:'#aaaa55', ground:'#bb8833', flying:'#7799ee',
  bug:'#77aa11', normal:'#9a9a9a',
}

function getTeamGlow(pokemon) {
  if (!pokemon?.length) return '#f0c040'
  const type = pokemon[0]?.types?.[0] || 'normal'
  return TYPE_GLOW[type] || '#f0c040'
}

// ─── LÓGICA COMPETITIVA REAL ───────────────────────────────────────────────
// Scoring de cada Pokémon propio vs el equipo rival COMPLETO
// Analizamos cada rival por separado y sumamos
//
// vs cada rival:
//   Defensiva (lo que nos pueden hacer):
//     ×4 → -60  (casi seguro KO)
//     ×2 → -25  (peligro real)
//     ×0.5 → +15 (resistencia útil)
//     ×0  → +30  (inmunidad — muy valioso)
//
//   Ofensiva (lo que podemos hacer):
//     ×4 → +50  (OHKO casi garantizado)
//     ×2 → +25  (ventaja ofensiva clara)
//     ×1 → +5
//     ×0.5 → -5
//     ×0  → -10 (bloqueado)

function scoreVsRival(myP, rivalP) {
  const incomingMult = Math.max(...rivalP.types.map(rt => getEff(rt, myP.types)))
  const outgoingMult = Math.max(...myP.types.map(mt => getEff(mt, rivalP.types)))

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

  return { defScore, offScore, incomingMult, outgoingMult }
}

function scoreMyPokemon(myP, rivalTeam) {
  let totalScore = 0
  const offensiveWins = []
  const dangers = []

  rivalTeam.forEach(rp => {
    const { defScore, offScore, incomingMult, outgoingMult } = scoreVsRival(myP, rp)
    totalScore += defScore + offScore

    if (outgoingMult >= 2) offensiveWins.push({ name: rp.name, mult: outgoingMult })
    if (incomingMult >= 2) dangers.push({ name: rp.name, mult: incomingMult })
  })

  // Penalización extra si tiene ×4 de algún rival — es un riesgo muy alto
  const hasCritical = dangers.some(d => d.mult >= 4)
  if (hasCritical) totalScore -= 30

  // Bonus si puede golpear SE a más de la mitad del equipo rival
  const coverageRatio = offensiveWins.length / rivalTeam.length
  if (coverageRatio >= 0.5) totalScore += 20

  return { score: totalScore, offensiveWins, dangers, hasCritical }
}

// Scoring de un par de Pokémon como lead vs el equipo rival
// Un buen lead debe:
// 1. Cubrir ofensivamente al mayor número de rivales posibles entre los dos
// 2. No tener ×4 debilidad compartida al mismo rival
// 3. Ser complementarios — si uno es débil a algo, el otro resiste
function scorePair(p1, p2, rivalTeam) {
  let score = 0

  rivalTeam.forEach(rp => {
    const { incomingMult: def1, outgoingMult: off1 } = scoreVsRival(p1, rp)
    const { incomingMult: def2, outgoingMult: off2 } = scoreVsRival(p2, rp)

    // Cobertura ofensiva — al menos uno golpea SE
    const bestOff = Math.max(off1, off2)
    if (bestOff >= 4) score += 40
    else if (bestOff >= 2) score += 20
    else score += 3

    // Penalizar si AMBOS son débiles al mismo rival
    if (def1 >= 4 && def2 >= 4) score -= 80  // catastrófico
    else if (def1 >= 4 && def2 >= 2) score -= 50
    else if (def2 >= 4 && def1 >= 2) score -= 50
    else if (def1 >= 4 || def2 >= 4) score -= 35  // uno solo con ×4
    else if (def1 >= 2 && def2 >= 2) score -= 30  // ambos con ×2
    else if (def1 >= 2 || def2 >= 2) score -= 10  // uno con ×2

    // Bonus por complementariedad — uno resiste lo que el otro no
    if (def1 >= 2 && def2 <= 0.5) score += 20
    if (def2 >= 2 && def1 <= 0.5) score += 20
    if (def1 <= 0) score += 10  // inmunidad es muy valiosa
    if (def2 <= 0) score += 10
  })

  return Math.max(0, score)
}

function SavedTeamsSidebar({ savedTeams, activeTeamName, lang, onLoad, onDelete, onSave, myTeam }) {
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [savingName, setSavingName] = useState('')
  const [hoveredTeam, setHoveredTeam] = useState(null)

  function handleSave() {
    if (!savingName.trim()) return
    onSave(savingName.trim())
    setSavingName('')
    setShowSaveInput(false)
  }

  return (
    <div className="hidden xl:flex flex-col w-72 flex-shrink-0">
      <div className="sticky top-4 flex flex-col gap-3 overflow-y-auto" style={{maxHeight:"calc(100vh - 120px)", scrollbarWidth:"thin", scrollbarColor:"#1c2830 transparent"}}>

        <div className="flex items-center justify-between px-1">
          <div>
            <p className="font-orbitron text-sm font-black text-white tracking-widest uppercase">
              {lang === 'es' ? 'Mis Equipos' : 'My Teams'}
            </p>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: MAX_SAVED }).map((_, i) => (
                <div key={i} className="h-1 w-8 rounded-full transition-all duration-300"
                  style={{ background: i < savedTeams.length ? '#f0c040' : '#1c2830' }} />
              ))}
            </div>
          </div>
          {myTeam.length > 0 && savedTeams.length < MAX_SAVED && !showSaveInput && (
            <button onClick={() => setShowSaveInput(true)}
              className="font-orbitron text-xs font-bold text-black bg-yellow-400 px-3 py-2 rounded-lg hover:bg-yellow-300 transition-all hover:scale-105 active:scale-100"
              style={{ boxShadow: '0 0 12px rgba(240,192,64,0.4)' }}>
              + {lang === 'es' ? 'Guardar' : 'Save'}
            </button>
          )}
        </div>

        {showSaveInput && (
          <div className="bg-[#0c1015] border border-yellow-400/30 rounded-xl p-4 flex flex-col gap-3"
            style={{ boxShadow: '0 0 20px rgba(240,192,64,0.08)' }}>
            <p className="font-mono-tech text-xs text-yellow-400/70 tracking-widest uppercase">
              {lang === 'es' ? 'Nombre del equipo' : 'Team name'}
            </p>
            <input value={savingName} onChange={e => setSavingName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowSaveInput(false) }}
              placeholder={lang === 'es' ? 'Ej: Rain team, Trick Room...' : 'E.g. Rain team, Trick Room...'}
              autoFocus
              className="w-full bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech" />
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={!savingName.trim()}
                className="flex-1 font-orbitron text-xs font-bold text-black bg-yellow-400 py-2 rounded-lg hover:bg-yellow-300 transition-all disabled:opacity-40 disabled:bg-[#1c2830] disabled:text-[#4a6070]">
                {lang === 'es' ? '💾 Guardar' : '💾 Save'}
              </button>
              <button onClick={() => { setShowSaveInput(false); setSavingName('') }}
                className="font-mono-tech text-xs text-[#4a6070] border border-[#1c2830] px-3 py-2 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all">✕</button>
            </div>
          </div>
        )}

        {savedTeams.length === 0 && (
          <div className="bg-[#0c1015] border border-dashed border-[#1c2830] rounded-xl p-8 text-center">
            <div className="text-4xl mb-3 opacity-30">🏆</div>
            <p className="font-orbitron text-xs text-[#4a6070] tracking-widest uppercase mb-1">
              {lang === 'es' ? 'Sin equipos' : 'No teams yet'}
            </p>
            <p className="font-mono-tech text-xs text-[#2a3840]">
              {lang === 'es' ? 'Guarda tu equipo actual para cargarlo rápido' : 'Save your current team for quick access'}
            </p>
          </div>
        )}

        {savedTeams.map((team) => {
          const isActive = team.name === activeTeamName
          const isHovered = hoveredTeam === team.name
          const glowColor = getTeamGlow(team.pokemon)

          return (
            <div key={team.name}
              onClick={() => onLoad(team)}
              onMouseEnter={() => setHoveredTeam(team.name)}
              onMouseLeave={() => setHoveredTeam(null)}
              className="relative rounded-2xl cursor-pointer overflow-hidden transition-all duration-300"
              style={{
                transform: isHovered ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
                boxShadow: isActive
                  ? `0 0 30px ${glowColor}25, 0 0 0 1px ${glowColor}40`
                  : isHovered
                    ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${glowColor}20`
                    : '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(28,40,48,1)',
              }}>
              <div className="absolute inset-0 bg-[#0c1015]" />
              <div className="absolute inset-0 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse at 80% 20%, ${glowColor}40 0%, transparent 60%)`, opacity: isActive ? 0.3 : isHovered ? 0.2 : 0.08 }} />
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300"
                style={{ background: isActive ? glowColor : 'transparent', boxShadow: isActive ? `0 0 12px ${glowColor}` : 'none' }} />

              <div className="relative p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {isActive && <div className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: glowColor }} />}
                      <p className="font-orbitron text-sm font-black truncate transition-colors duration-200"
                        style={{ color: isActive ? glowColor : isHovered ? '#ffffff' : '#ccddee' }}>
                        {team.name}
                      </p>
                    </div>
                    <p className="font-mono-tech text-xs text-[#4a6070]">{team.pokemon.length} Pokémon</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onDelete(team.name) }}
                    className="text-[#2a3840] hover:text-red-400 transition-all text-xl leading-none ml-2 flex-shrink-0 hover:scale-110"
                    style={{ opacity: isHovered ? 1 : 0 }}>×</button>
                </div>

                <div className="flex items-center mb-3" style={{ height: 52 }}>
                  {Array.from({ length: 6 }).map((_, idx2) => {
                    const p = team.pokemon[idx2]
                    return (
                      <div key={idx2} className="rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ width: 48, height: 48, marginLeft: idx2 > 0 ? -10 : 0, zIndex: idx2,
                          background: p ? 'rgba(12,16,21,0.8)' : 'rgba(12,16,21,0.3)',
                          border: p ? '1px solid rgba(255,255,255,0.06)' : '1px dashed rgba(28,40,48,0.5)',
                          backdropFilter: 'blur(4px)' }}>
                        {p && <img src={getSpriteUrl(p.spriteId)} alt={p.name} width={40} height={40}
                          style={{ imageRendering: 'pixelated', filter: isHovered ? 'brightness(1.1)' : 'brightness(0.9)' }}
                          onError={e => { e.target.style.display = 'none' }} />}
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-wrap gap-1">
                  {[...new Set(team.pokemon.flatMap(p => p.types))].slice(0, 6).map(type => (
                    <span key={type} className="font-mono-tech px-2 py-0.5 rounded-full uppercase tracking-wide transition-all duration-200"
                      style={{ background: `${TYPE_GLOW[type] || '#888'}18`, color: TYPE_GLOW[type] || '#888',
                        border: `1px solid ${TYPE_GLOW[type] || '#888'}30`, fontSize: '9px' }}>
                      {type}
                    </span>
                  ))}
                </div>

                <div className="mt-3 overflow-hidden transition-all duration-200"
                  style={{ maxHeight: isHovered || isActive ? 32 : 0, opacity: isHovered || isActive ? 1 : 0 }}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-xs" style={{ color: isActive ? glowColor : '#4a6070' }}>
                      {isActive ? (lang === 'es' ? '✓ Equipo activo' : '✓ Active team') : (lang === 'es' ? '→ Click para cargar' : '→ Click to load')}
                    </span>
                    {isActive && (
                      <div className="flex gap-0.5">
                        {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full animate-pulse" style={{ background: glowColor, animationDelay: `${i * 0.2}s` }} />)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {savedTeams.length >= MAX_SAVED && (
          <p className="text-center font-mono-tech text-xs text-[#2a3840] italic">
            {lang === 'es' ? 'Máximo 5 equipos' : 'Max 5 teams'}
          </p>
        )}
      </div>
    </div>
  )
}

export default function RivalAnalysis() {
  const { t, lang } = useLang()
  const { myTeam, addPokemon, removePokemon, clearTeam, replaceTeam, rivalTeam, addRivalPokemon, removeRivalPokemon, clearRivalTeam } = useTeam()
  const [format, setFormat] = useState('doubles')
  const [analyzed, setAnalyzed] = useState(false)
  const [scores, setScores] = useState([])
  const [bestLead, setBestLead] = useState(null)
  const [copied, setCopied] = useState(false)

  const [savedTeams, setSavedTeams] = useState(() => loadSavedTeams())
  const [activeTeamName, setActiveTeamName] = useState(null)
  const [showMobileSave, setShowMobileSave] = useState(false)
  const [mobileSavingName, setMobileSavingName] = useState('')
  const [showMobileSaved, setShowMobileSaved] = useState(false)

  useEffect(() => { saveSavedTeams(savedTeams) }, [savedTeams])

  function saveCurrentTeam(name) {
    if (!name || myTeam.length === 0) return
    const newTeam = { name, pokemon: myTeam, date: new Date().toLocaleDateString() }
    const updated = [newTeam, ...savedTeams.filter(t => t.name !== name)].slice(0, MAX_SAVED)
    setSavedTeams(updated)
    setActiveTeamName(name)
  }

  function loadSavedTeam(team) {
    replaceTeam(team.pokemon)
    setActiveTeamName(team.name)
    setAnalyzed(false)
    setShowMobileSaved(false)
  }

  function deleteSavedTeam(name) {
    setSavedTeams(prev => prev.filter(t => t.name !== name))
    if (activeTeamName === name) setActiveTeamName(null)
  }

  const bringCount = format === 'doubles' ? 4 : 3

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

  function analyze() {
    if (myTeam.length === 0 || rivalTeam.length === 0) return

    // Scoring individual de cada Pokémon vs el equipo rival completo
    const scored = myTeam.map(mp => {
      const { score, offensiveWins, dangers, hasCritical } = scoreMyPokemon(mp, rivalTeam)
      return { pokemon: mp, score, offensiveWins, dangers, hasCritical }
    }).sort((a, b) => b.score - a.score)

    setScores(scored)

    // Lead óptimo en dobles — buscar el mejor par entre los top 4
    if (format === 'doubles') {
      const topN = scored.slice(0, Math.min(bringCount, scored.length))
      let bestPair = null, bestPairScore = -Infinity

      for (let i = 0; i < topN.length; i++) {
        for (let j = i + 1; j < topN.length; j++) {
          // Excluir pares donde alguno tiene ×4 vs el mismo rival que el otro
          const p1 = topN[i].pokemon
          const p2 = topN[j].pokemon
          const pairScore = scorePair(p1, p2, rivalTeam)
          if (pairScore > bestPairScore) {
            bestPairScore = pairScore
            bestPair = { p1, p2 }
          }
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
  const maxScore    = Math.max(1, scores[0]?.score || 1)

  return (
    <div className="flex gap-6">

      <SavedTeamsSidebar
        savedTeams={savedTeams}
        activeTeamName={activeTeamName}
        lang={lang}
        onLoad={loadSavedTeam}
        onDelete={deleteSavedTeam}
        onSave={saveCurrentTeam}
        myTeam={myTeam}
      />

      <div className="flex-1 min-w-0">

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

          {/* My Team */}
          <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-visible">
            <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] rounded-t-xl flex items-center justify-between">
              <div>
                <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-white">{t('ra.my_team')}</h2>
                <p className="font-mono-tech text-xs text-yellow-400/60 mt-0.5">{lang === 'es' ? 'Guardado automáticamente' : 'Auto-saved'}</p>
              </div>
              <div className="flex items-center gap-2">
                {savedTeams.length > 0 && (
                  <button onClick={() => { setShowMobileSaved(s => !s); setShowMobileSave(false) }}
                    className="xl:hidden font-mono-tech text-xs text-yellow-400/70 hover:text-yellow-400 transition-colors border border-yellow-400/20 px-2.5 py-1 rounded">
                    📂 {savedTeams.length}
                  </button>
                )}
                {myTeam.length > 0 && savedTeams.length < MAX_SAVED && (
                  <button onClick={() => { setShowMobileSave(s => !s); setShowMobileSaved(false) }}
                    className="xl:hidden font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors border border-[#1c2830] px-2.5 py-1 rounded">💾</button>
                )}
                {myTeam.length > 0 && (
                  <button onClick={() => { clearTeam(); setAnalyzed(false); setActiveTeamName(null) }}
                    className="font-mono-tech text-xs text-[#4a6070] hover:text-red-400 transition-colors">{t('global.clear')}</button>
                )}
                <span className="font-mono-tech text-xs text-[#4a6070] bg-[#0c1015] border border-[#1c2830] px-2.5 py-1 rounded">{myTeam.length} / 6</span>
              </div>
            </div>

            {showMobileSave && (
              <div className="xl:hidden px-4 pt-3 flex gap-2">
                <input value={mobileSavingName} onChange={e => setMobileSavingName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { saveCurrentTeam(mobileSavingName); setMobileSavingName(''); setShowMobileSave(false) } }}
                  placeholder={lang === 'es' ? 'Nombre del equipo...' : 'Team name...'} autoFocus
                  className="flex-1 bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2 text-white text-xs placeholder-[#4a6070] outline-none focus:border-yellow-400/50 font-mono-tech" />
                <button onClick={() => { saveCurrentTeam(mobileSavingName); setMobileSavingName(''); setShowMobileSave(false) }}
                  disabled={!mobileSavingName.trim()}
                  className="font-mono-tech text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-2 rounded-lg disabled:opacity-40">
                  {lang === 'es' ? 'Guardar' : 'Save'}
                </button>
              </div>
            )}

            {showMobileSaved && savedTeams.length > 0 && (
              <div className="xl:hidden px-4 pt-3 flex flex-col gap-1.5">
                {savedTeams.map(team => (
                  <div key={team.name} className="flex items-center justify-between bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex gap-0.5">
                        {team.pokemon.slice(0, 6).map(p => (
                          <img key={p.name} src={getSpriteUrl(p.spriteId)} alt={p.name} width={24} height={24}
                            style={{ imageRendering: 'pixelated' }} onError={e => { e.target.style.display = 'none' }} />
                        ))}
                      </div>
                      <span className="font-bold text-white text-xs truncate">{team.name}</span>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button onClick={() => loadSavedTeam(team)} className="font-mono-tech text-xs text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded">
                        {lang === 'es' ? 'Cargar' : 'Load'}
                      </button>
                      <button onClick={() => deleteSavedTeam(team.name)} className="text-[#4a6070] hover:text-red-400 transition-colors text-lg leading-none">×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
              <div>
                <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-red-400">{t('ra.rival_team')}</h2>
                <p className="font-mono-tech text-xs text-red-400/60 mt-0.5">{lang === 'es' ? 'Compartido entre herramientas' : 'Shared between tools'}</p>
              </div>
              <div className="flex items-center gap-2">
                {rivalTeam.length > 0 && <button onClick={() => { clearRivalTeam(); setAnalyzed(false) }} className="font-mono-tech text-xs text-[#4a6070] hover:text-red-400 transition-colors">{t('global.clear')}</button>}
                <span className="font-mono-tech text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded">{rivalTeam.length} / 6</span>
              </div>
            </div>
            <div className="p-4 overflow-visible">
              <PokemonSearch onAdd={p => { addRivalPokemon(p); setAnalyzed(false) }} maxReached={rivalTeam.length >= 6} placeholder={t('ra.placeholder_rival')} />
              <div className="mt-3 flex flex-col gap-2">
                {rivalTeam.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between bg-[#111820] border border-[#1c2830] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech text-xs text-[#4a6070] w-4">{i + 1}</span>
                      <PokemonSprite pokemon={p} size={40} />
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                      <button onClick={() => { removeRivalPokemon(p.name); setAnalyzed(false) }} className="text-[#4a6070] hover:text-red-400 transition-colors ml-1 text-xl leading-none">×</button>
                    </div>
                  </div>
                ))}
                {rivalTeam.length === 0 && (
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
        {myTeam.length > 0 && rivalTeam.length > 0 && (
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
                <p className="font-mono-tech text-xs text-yellow-400 tracking-widest mb-1">{t('ra.lead_title')}</p>
                <p className="font-mono-tech text-xs text-[#4a6070] mb-3">
                  {lang === 'es'
                    ? 'Mejor par inicial — cobertura complementaria y mínimas debilidades compartidas'
                    : 'Best opening pair — complementary coverage and minimal shared weaknesses'}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  {[bestLead.p1, bestLead.p2].map((p, idx) => (
                    <div key={p.name} className="flex items-center gap-2">
                      {idx === 1 && <span className="font-orbitron text-yellow-400 text-lg">+</span>}
                      <PokemonSprite pokemon={p} size={52} />
                      <div>
                        <span className="font-orbitron text-xl font-black text-white">{p.name}</span>
                        <div className="flex gap-1 mt-1">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#4a6070] mt-3 font-mono-tech">{t('ra.lead_sub')} {bringCount}</p>
              </div>
            )}

            <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
              <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] flex items-center justify-between">
                <div>
                  <h2 className={`font-orbitron text-sm font-bold tracking-widest uppercase ${format === 'doubles' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {format === 'doubles' ? t('ra.best_doubles') : t('ra.best_singles')}
                  </h2>
                  <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">
                    {lang === 'es'
                      ? 'Ordenados por cobertura ofensiva + resistencia defensiva vs el equipo rival'
                      : 'Ranked by offensive coverage + defensive resistance vs rival team'}
                  </p>
                </div>
                <button onClick={copyResults} className="font-mono-tech text-xs text-[#4a6070] hover:text-white transition-colors border border-[#1c2830] hover:border-[#2a3840] px-3 py-1.5 rounded-lg">
                  {copied ? t('global.copied') : t('ra.copy')}
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scores.map((s, i) => {
                  const pct = maxScore > 0 ? Math.max(0, Math.round((s.score / maxScore) * 100)) : 0
                  const isTop = i < bringCount
                  const rankEmoji = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'][i]
                  const accentColor = format === 'doubles' ? '#f0c040' : '#60a5fa'
                  const isLead = bestLead && (s.pokemon.name === bestLead.p1.name || s.pokemon.name === bestLead.p2.name)
                  return (
                    <div key={s.pokemon.name} className={`rounded-xl border p-4 transition-all ${
                      isTop
                        ? s.hasCritical
                          ? 'border-red-500/30 bg-red-950/10'
                          : format === 'doubles' ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-blue-400/30 bg-blue-400/5'
                        : 'border-[#1c2830] bg-[#111820] opacity-40'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg">{rankEmoji}</span>
                          <PokemonSprite pokemon={s.pokemon} size={44} />
                          <span className="font-bold text-white">{s.pokemon.name}</span>
                          {isLead && isTop && format === 'doubles' && (
                            <span className="text-xs bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded font-mono-tech">{t('ra.lead_badge')}</span>
                          )}
                          {s.hasCritical && isTop && (
                            <span className="text-xs bg-red-900/30 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono-tech">⚠ ×4</span>
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
                            {s.offensiveWins.map(w => (
                              <span key={w.name} className="text-xs bg-green-900/20 text-green-300 border border-green-900/30 px-2 py-0.5 rounded">
                                {w.name} ×{w.mult}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {s.dangers.length > 0 && (
                        <div>
                          <p className="font-mono-tech text-xs text-red-400 mb-1">{t('ra.threatened')}</p>
                          <div className="flex flex-wrap gap-1">
                            {s.dangers.map(d => (
                              <span key={d.name} className={`text-xs px-2 py-0.5 rounded border ${d.mult >= 4 ? 'bg-red-900/40 text-red-300 border-red-500/40' : 'bg-red-900/20 text-red-300 border-red-900/30'}`}>
                                {d.name} ×{d.mult}
                              </span>
                            ))}
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
    </div>
  )
}