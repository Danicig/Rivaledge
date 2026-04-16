import { useState } from 'react'
import TypeBadge from './TypeBadge'
import { useLang } from './lang'

// ─── DATA — showdowntier.com 04/16/2026 · 41.564 batallas · Pikalytics Champions Tournament
// Tiers: A/B/C/D — No hay Tier S en Reg M-A (formato equilibrado)

const DOUBLES_TIERS = [
  {
    tier: 'A', color: '#ff8844', bg: 'bg-orange-950/30', border: 'border-orange-500/30',
    labelES: 'Tier A — Core del meta', labelEN: 'Tier A — Meta Core',
    pokemon: [
      {
        name: 'Sneasler', types: ['fighting','poison'], usage: '39.32%', wr: '51.82%', role: 'Attacker',
        item: 'White Herb / Focus Sash', ability: 'Unburden / Pressure',
        moves: ['Dire Claw','Close Combat','Fake Out','Protect'],
        noteES: '#1 en el meta actual. Unburden tras consumir White Herb lo convierte en el atacante más rápido del formato. Dire Claw es su move más peligroso por la probabilidad de parálisis.',
        noteEN: '#1 in current meta. Unburden after White Herb makes it the fastest attacker. Dire Claw is its most dangerous move due to paralysis chance.',
      },
      {
        name: 'Garchomp', types: ['dragon','ground'], usage: '35.20%', wr: '51.59%', role: 'Attacker',
        item: 'Life Orb / Clear Amulet / Garchompite', ability: 'Rough Skin',
        moves: ['Earthquake','Dragon Claw','Rock Slide','Protect'],
        noteES: '#2 en uso. Earthquake spread + cobertura Dragon. Life Orb es el objeto más usado. Garchompite disponible para build Mega. Core ofensivo estándar en casi todos los equipos.',
        noteEN: '#2 in usage. Spread Earthquake + Dragon coverage. Life Orb most common item. Garchompite option for Mega build. Standard offensive core in almost every team.',
      },
      {
        name: 'Kingambit', types: ['dark','steel'], usage: '23.75%', wr: '52.28%', role: 'Attacker',
        item: 'Sitrus Berry / Leftovers', ability: 'Supreme Overlord',
        moves: ['Iron Head','Kowtow Cleave','Sucker Punch','Protect'],
        noteES: 'Supreme Overlord gana potencia con cada compañero caído. Mejor win rate del Tier A. Limpiador de late game imparable. Sucker Punch da prioridad crucial.',
        noteEN: 'Supreme Overlord gains power with each fallen teammate. Best win rate in Tier A. Unstoppable late-game cleaner. Sucker Punch provides crucial priority.',
      },
    ],
  },
  {
    tier: 'B', color: '#ddbb00', bg: 'bg-yellow-950/30', border: 'border-yellow-500/30',
    labelES: 'Tier B — Viables y frecuentes', labelEN: 'Tier B — Viable & Common',
    pokemon: [
      {
        name: 'Incineroar', types: ['fire','dark'], usage: '47.55%', wr: '49.81%', role: 'Support',
        item: 'Sitrus Berry / Rocky Helmet', ability: 'Intimidate',
        moves: ['Fake Out','Parting Shot','Flare Blitz','Darkest Lariat'],
        noteES: 'Mayor uso del formato (47.55%) pero win rate bajo el 50% — el meta se adaptó. Sigue siendo imprescindible por Fake Out + Intimidate + Parting Shot pero ya no domina partidas.',
        noteEN: 'Highest usage (47.55%) but below 50% win rate — meta adapted. Still essential for Fake Out + Intimidate + Parting Shot but no longer game-defining.',
      },
      {
        name: 'Sinistcha', types: ['grass','ghost'], usage: '31.21%', wr: '50.49%', role: 'Support',
        item: 'Sitrus Berry / Leftovers / Occa Berry', ability: 'Hospitality',
        moves: ['Matcha Gotcha','Rage Powder','Trick Room','Life Dew'],
        noteES: 'Support imprescindible. Hospitality cura al compañero al entrar. Rage Powder redirige. Matcha Gotcha drena y cura. Versátil — puede ser setter de Trick Room también.',
        noteEN: 'Essential support. Hospitality heals partner on switch-in. Rage Powder redirects. Matcha Gotcha drains and heals. Versatile — can also set Trick Room.',
      },
      {
        name: 'Basculegion', types: ['water','ghost'], usage: '21.42%', wr: '51.89%', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Adaptability',
        moves: ['Wave Crash','Shadow Ball','Aqua Jet','Protect'],
        noteES: 'Amenaza emergente. Adaptabilidad + boost de Lluvia convierte Wave Crash en un nuke devastador. Aqua Jet da prioridad. Mejor win rate del Tier B junto a Floette.',
        noteEN: 'Emerging threat. Adaptability + Rain boost makes Wave Crash devastating. Aqua Jet provides priority. Best win rate in Tier B alongside Floette.',
      },
      {
        name: 'Rotom-Wash', types: ['electric','water'], usage: '17.18%', wr: '51.58%', role: 'Support',
        item: 'Sitrus Berry / Leftovers', ability: 'Levitate',
        moves: ['Hydro Pump','Thunderbolt','Will-O-Wisp','Protect'],
        noteES: 'Pivot eléctrico resistente. Will-O-Wisp corta el daño físico de amenazas. Volt Switch para pivotar con seguridad. Responde a Gyarados y ataques de Agua.',
        noteEN: 'Bulky Electric pivot. Will-O-Wisp cuts physical damage from threats. Volt Switch for safe pivoting. Answers Gyarados and Water attacks.',
      },
      {
        name: 'Floette-Eternal', types: ['fairy'], usage: '14.70%', wr: '54.59%', role: 'Attacker',
        item: 'Sitrus Berry / Life Orb', ability: 'Flower Veil',
        moves: ['Moonblast','Dazzling Gleam','Protect','Helping Hand'],
        noteES: 'Win rate más alto del Tier B (54.59%). Alta presencia en high ladder. Moonblast es su move con mayor win rate (66.3%). SpAtk masivo con bulk natural sorprendente.',
        noteEN: 'Highest win rate in Tier B (54.59%). High presence in high ladder play. Moonblast is its highest win rate move (66.3%). Massive SpAtk with surprising natural bulk.',
      },
      {
        name: 'Aerodactyl', types: ['rock','flying'], usage: '13.12%', wr: '51.59%', role: 'Support',
        item: 'Focus Sash / King\'s Rock', ability: 'Rock Head / Pressure',
        moves: ['Rock Slide','Tailwind','Taunt','Protect'],
        noteES: 'Setter de Tailwind más rápido del formato. Rock Slide con flinch chance. Taunt bloquea setters rivales. Excelente lead ofensivo para equipos de control de velocidad.',
        noteEN: 'Fastest Tailwind setter in the format. Rock Slide with flinch chance. Taunt stops rival setters. Excellent offensive lead for speed control teams.',
      },
      {
        name: 'Delphox', types: ['fire','psychic'], usage: '7.20%', wr: '53.23%', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Magician',
        moves: ['Psychic','Fire Blast','Shadow Ball','Protect'],
        noteES: 'Magician roba el objeto del rival al atacar. Muy infrautilizado (7.20%) para su win rate (53.23%). Excelente pick anti-meta sorpresa.',
        noteEN: 'Magician steals opponent\'s item on attack. Heavily underused (7.20%) for its win rate (53.23%). Excellent surprise anti-meta pick.',
      },
    ],
  },
  {
    tier: 'C', color: '#33aaff', bg: 'bg-blue-950/20', border: 'border-blue-900/30',
    labelES: 'Tier C — Situacionales', labelEN: 'Tier C — Situational',
    pokemon: [
      {
        name: 'Pelipper', types: ['water','flying'], usage: '15.69%', wr: '49.68%', role: 'Setter',
        item: 'Damp Rock / Sitrus Berry', ability: 'Drizzle',
        moves: ['Hurricane','Scald','Tailwind','Protect'],
        noteES: 'Setter de Lluvia con Llovizna. Hurricane 100% precisión bajo lluvia. Win rate bajo el 50% — los equipos de lluvia están siendo leídos mejor en alto ladder.',
        noteEN: 'Drizzle Rain setter. Hurricane is 100% accurate in Rain. Below 50% win rate — Rain teams being read better at high ladder.',
      },
      {
        name: 'Tyranitar', types: ['rock','dark'], usage: '14.93%', wr: '50.19%', role: 'Setter',
        item: 'Smooth Rock / Sitrus Berry', ability: 'Sand Stream',
        moves: ['Rock Slide','Crunch','Ice Punch','Protect'],
        noteES: 'Sand Stream invoca Arena. Bulk masivo + STAB Roca. Contrarresta equipos de Nieve. Win rate justo encima del 50%, consistente pero sin brillo.',
        noteEN: 'Sand Stream auto-summons Sandstorm. Massive bulk + Rock STAB. Counters Snow teams. Win rate just above 50%, consistent but unremarkable.',
      },
      {
        name: 'Farigiraf', types: ['normal','psychic'], usage: '14.83%', wr: '49.94%', role: 'Support',
        item: 'Throat Spray / Sitrus Berry / Mental Herb', ability: 'Cud Chew / Armor Tail',
        moves: ['Trick Room','Hyper Voice','Protect','Helping Hand'],
        noteES: 'Armor Tail bloquea Fake Out — counter directo al lead Incineroar. Throat Spray + Hyper Voice. Setter de Trick Room + Future Sight pressure.',
        noteEN: 'Armor Tail blocks Fake Out — hard counter to Incineroar leads. Throat Spray + Hyper Voice. Trick Room setter + Future Sight pressure.',
      },
      {
        name: 'Charizard', types: ['fire','flying'], usage: '13.87%', wr: '49.99%', role: 'Attacker',
        item: 'Charizardite Y / Charizardite X / Life Orb', ability: 'Drought / Blaze',
        moves: ['Heat Wave','Protect','Solar Beam','Weather Ball'],
        noteES: 'Mega Charizard Y bajo Sol. Heat Wave spread devastador. Win rate casi exactamente 50% — sigue siendo amenaza real pero tiene sus counters establecidos.',
        noteEN: 'Mega Charizard Y under Sun. Devastating spread Heat Wave. Win rate almost exactly 50% — still a real threat but counters are well established.',
      },
      {
        name: 'Archaludon', types: ['dragon','steel'], usage: '13.00%', wr: '49.62%', role: 'Attacker',
        item: 'Power Herb / Assault Vest', ability: 'Stamina / Sturdy',
        moves: ['Electro Shot','Body Press','Flash Cannon','Protect'],
        noteES: 'Electro Shot con Power Herb. Body Press aprovecha la alta Defensa. Resistente y difícil de matar pero el win rate bajo el 50% lo limita.',
        noteEN: 'Electro Shot with Power Herb. Body Press leverages high Defense. Bulky and hard to KO but sub-50% win rate limits its ceiling.',
      },
      {
        name: 'Milotic', types: ['water'], usage: '9.73%', wr: '50.43%', role: 'Tank',
        item: 'Leftovers / Sitrus Berry', ability: 'Competitive',
        moves: ['Scald','Ice Beam','Recover','Protect'],
        noteES: 'Competitive convierte Intimidate en +2 SpAtk. Leftovers es el objeto más común. Muro especial resistente — difícil de matar sin un counter específico.',
        noteEN: 'Competitive turns Intimidate into +2 SpAtk. Leftovers most common item. Bulky special wall — hard to KO without a specific counter.',
      },
      {
        name: 'Talonflame', types: ['fire','flying'], usage: '7.09%', wr: '51.37%', role: 'Support',
        item: 'Focus Sash', ability: 'Gale Wings',
        moves: ['Tailwind','Brave Bird','Flare Blitz','Protect'],
        noteES: 'Gale Wings da prioridad a Tailwind. Setter sacrificio fiable. Frágil pero establece control de velocidad rápidamente en equipos de Tailwind.',
        noteEN: 'Gale Wings gives Tailwind priority. Reliable sacrifice setter. Frail but quickly establishes speed control on Tailwind teams.',
      },
      {
        name: 'Corviknight', types: ['flying','steel'], usage: '7.03%', wr: '51.51%', role: 'Tank',
        item: 'Rocky Helmet / Leftovers', ability: 'Pressure / Mirror Armor',
        moves: ['Brave Bird','Iron Head','Bulk Up','Protect'],
        noteES: 'Muro físico vs Sneasler y Garchomp. Mirror Armor rebota bajadas de stats. Resistente y útil pero superado por picks más ofensivos en el meta actual.',
        noteEN: 'Physical wall vs Sneasler and Garchomp. Mirror Armor bounces back stat drops. Bulky and useful but outclassed by more offensive picks in current meta.',
      },
      {
        name: 'Gardevoir', types: ['psychic','fairy'], usage: '6.18%', wr: '51.32%', role: 'Support',
        item: 'Sitrus Berry / Choice Scarf', ability: 'Trace',
        moves: ['Moonblast','Psyshock','Trick Room','Protect'],
        noteES: 'Trace copia habilidades útiles del rival. Setter de Trick Room + atacante especial. Sinergia con builds de Trick Room junto a Sinistcha.',
        noteEN: 'Trace ability copies useful opponent abilities. Trick Room setter + special attacker. Synergy with Trick Room builds alongside Sinistcha.',
      },
      {
        name: 'Aegislash', types: ['steel','ghost'], usage: '6.13%', wr: '50.34%', role: 'Attacker',
        item: 'Weakness Policy / Sitrus Berry', ability: 'Stance Change',
        moves: ['Shadow Ball','Iron Head','King\'s Shield','Wide Guard'],
        noteES: 'Wide Guard bloquea moves spread. Weakness Policy explota cuando lo golpean. Stance Change le da roles distintos atacando y defendiendo.',
        noteEN: 'Wide Guard blocks spread moves. Weakness Policy explodes when hit. Stance Change gives it distinct attacking and defending roles.',
      },
      {
        name: 'Primarina', types: ['water','fairy'], usage: '5.75%', wr: '50.91%', role: 'Attacker',
        item: 'Choice Specs / Sitrus Berry', ability: 'Liquid Voice',
        moves: ['Hyper Voice','Moonblast','Protect','Calm Mind'],
        noteES: 'Liquid Voice convierte Hyper Voice en ataque de Agua. Tipado Agua/Hada cubre bien el meta. Consistente pero superada por atacantes especiales más veloces.',
        noteEN: 'Liquid Voice turns Hyper Voice into Water attack. Water/Fairy typing covers the meta well. Consistent but outclassed by faster special attackers.',
      },
      {
        name: 'Azumarill', types: ['water','fairy'], usage: '1.04%', wr: '54.45%', role: 'Attacker',
        item: 'Sitrus Berry / Assault Vest', ability: 'Huge Power',
        moves: ['Aqua Jet','Play Rough','Belly Drum','Protect'],
        noteES: '⭐ GEM OCULTA — 54.45% win rate con solo 1% de uso. Enorme Poder + Aqua Jet arrasa equipos debilitados. Belly Drum es alto riesgo, recompensa brutal.',
        noteEN: '⭐ HIDDEN GEM — 54.45% win rate with only 1% usage. Huge Power + Aqua Jet sweeps weakened teams. Belly Drum is high risk, massive reward.',
      },
    ],
  },
  {
    tier: 'D', color: '#888888', bg: 'bg-gray-950/20', border: 'border-gray-800/30',
    labelES: 'Tier D — Con dificultades', labelEN: 'Tier D — Struggling',
    pokemon: [
      {
        name: 'Whimsicott', types: ['grass','fairy'], usage: '17.26%', wr: '48.99%', role: 'Support',
        item: 'Focus Sash / Mental Herb', ability: 'Prankster',
        moves: ['Tailwind','Moonblast','Encore','Protect'],
        noteES: 'Alto uso (17.26%) pero win rate negativo. Sneasler lo contrarresta duramente. El meta actual tiene respuestas establecidas — actualmente sobrevalorado.',
        noteEN: 'High usage (17.26%) but negative win rate. Sneasler hard counters it. Current meta has established answers — currently overhyped vs actual results.',
      },
      {
        name: 'Dragonite', types: ['dragon','flying'], usage: '9.21%', wr: '49.22%', role: 'Attacker',
        item: 'Dragoninite / Loaded Dice', ability: 'Inner Focus / Multiscale',
        moves: ['Extreme Speed','Scale Shot','Hurricane','Protect'],
        noteES: 'Multiscale aguanta el primer golpe. Extreme Speed prioridad +2. Win rate bajo el 50% — ha perdido protagonismo frente a atacantes más rápidos y consistentes.',
        noteEN: 'Multiscale tanks the first hit. Extreme Speed +2 priority. Below 50% win rate — overshadowed by faster and more consistent attackers.',
      },
      {
        name: 'Froslass', types: ['ice','ghost'], usage: '8.64%', wr: '49.94%', role: 'Setter',
        item: 'Focus Sash / Icy Rock', ability: 'Snow Warning / Cursed Body',
        moves: ['Blizzard','Shadow Ball','Tailwind','Protect'],
        noteES: 'Snow Warning invoca Nieve. Blizzard 100% precisión bajo Nieve. Win rate casi 50% — los tipos Roca ahora son counter estándar. El meta de Nieve se adaptó completamente.',
        noteEN: 'Snow Warning summons Snow. Blizzard 100% accurate in Snow. Near 50% win rate — Rock types are now standard counters. Snow meta has fully adapted.',
      },
      {
        name: 'Gengar', types: ['ghost','poison'], usage: '8.54%', wr: '48.96%', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Cursed Body',
        moves: ['Shadow Ball','Sludge Bomb','Dazzling Gleam','Protect'],
        noteES: 'Alto SpAtk pero muy frágil. Cuerpo Maldito puede bloquear moves del rival. Win rate negativo — demasiado frágil en el meta actual dominado por Sneasler.',
        noteEN: 'High SpAtk but very frail. Cursed Body can disable opponent moves. Negative win rate — too frail in current meta dominated by Sneasler.',
      },
      {
        name: 'Excadrill', types: ['ground','steel'], usage: '7.24%', wr: '49.61%', role: 'Attacker',
        item: 'Life Orb / Choice Scarf', ability: 'Sand Rush / Mold Breaker',
        moves: ['Earthquake','Iron Head','Rock Slide','Protect'],
        noteES: 'Sand Rush dobla Speed bajo Arena de Tyranitar. Win rate bajo el 50% — los equipos de Arena están siendo leídos con más facilidad en alto ladder.',
        noteEN: 'Sand Rush doubles Speed under Tyranitar Sand. Below 50% win rate — Sand teams being read more consistently at high ladder.',
      },
      {
        name: 'Torkoal', types: ['fire'], usage: '6.12%', wr: '49.29%', role: 'Setter',
        item: 'Heat Rock / Sitrus Berry', ability: 'Drought',
        moves: ['Heat Wave','Earth Power','Yawn','Protect'],
        noteES: 'Sequía invoca Sol. Core con Charizard Y. Perdiendo la guerra de clima vs Lluvia y Arena. La baja velocidad es un lastre fuera de Trick Room.',
        noteEN: 'Drought summons Sun. Core with Charizard Y. Losing weather war vs Rain and Sand. Low Speed is a liability outside Trick Room.',
      },
    ],
  },
]

const ROLE_COLORS = {
  'Setter':'#4488ff','Attacker':'#ff4422','Support':'#33aa33','Tank':'#aa88ff','Trick Room':'#ff88cc',
}

const ALL_ROLES = ['All','Attacker','Support','Tank','Setter']

export default function TierList() {
  const { t, lang } = useLang()
  const [format, setFormat] = useState('doubles')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [collapsed, setCollapsed] = useState({})
  const [expandedPokemon, setExpandedPokemon] = useState(null)

  function toggleCollapse(tier) {
    setCollapsed(prev => ({ ...prev, [tier]: !prev[tier] }))
  }

  function toggleExpand(name) {
    setExpandedPokemon(prev => prev === name ? null : name)
  }

  function filterPokemon(pokemon) {
    return pokemon.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'All' || p.role === roleFilter
      return matchSearch && matchRole
    })
  }

  const tiers = DOUBLES_TIERS
  const totalVisible = tiers.reduce((sum, tier) => sum + filterPokemon(tier.pokemon).length, 0)

  return (
    <div>

      {/* Info bar */}
      <div className="mb-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-orbitron text-xs font-bold text-yellow-400 tracking-widest mb-1">
            TIER LIST DOBLES · REGULATION M-A
          </p>
          <p className="font-mono-tech text-xs text-[#4a6070]">
            showdowntier.com · 41.564 batallas · Abr 9–16, 2026 · Rating medio 1200
          </p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono-tech text-xs text-yellow-400">{t('global.active_until')}</span>
        </div>
      </div>

      {/* Search + Role filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'es' ? 'Buscar Pokémon...' : 'Search Pokémon...'}
          className="flex-1 bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-2.5 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech text-sm" />
        <div className="flex gap-2 flex-wrap">
          {ALL_ROLES.map(role => (
            <button key={role} onClick={() => setRoleFilter(role)}
              className="px-3 py-2 rounded-xl font-mono-tech text-xs tracking-widest uppercase transition-all border flex-shrink-0"
              style={roleFilter === role && role !== 'All'
                ? { borderColor: `${ROLE_COLORS[role]}60`, color: ROLE_COLORS[role], background: `${ROLE_COLORS[role]}15` }
                : roleFilter === role
                  ? { borderColor: 'rgba(240,192,64,0.4)', color: '#f0c040', background: 'rgba(240,192,64,0.1)' }
                  : { borderColor: '#1c2830', color: '#4a6070', background: '#0c1015' }
              }>
              {role === 'All' ? (lang === 'es' ? 'Todos' : 'All') : role}
            </button>
          ))}
        </div>
      </div>

      {/* No results */}
      {totalVisible === 0 && (
        <div className="text-center py-12">
          <p className="text-[#4a6070] font-mono-tech text-sm">
            {lang === 'es' ? 'No se encontraron Pokémon para' : 'No Pokémon found for'} "{search}"
          </p>
        </div>
      )}

      {/* Tiers */}
      <div className="flex flex-col gap-4">
        {tiers.map(tier => {
          const visible = filterPokemon(tier.pokemon)
          if (visible.length === 0) return null
          const isCollapsed = collapsed[tier.tier]
          const label = lang === 'es' ? tier.labelES : tier.labelEN

          return (
            <div key={tier.tier} className={`rounded-xl border ${tier.border} ${tier.bg} overflow-hidden`}>
              <button onClick={() => toggleCollapse(tier.tier)}
                className="w-full flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="font-orbitron text-3xl font-black" style={{ color: tier.color }}>{tier.tier}</div>
                  <div className="text-left">
                    <p className="font-orbitron text-xs font-bold text-white tracking-widest uppercase">{label}</p>
                    <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">{visible.length} Pokémon</p>
                  </div>
                </div>
                <span className="text-[#4a6070] text-sm font-mono-tech">{isCollapsed ? '▼' : '▲'}</span>
              </button>

              {!isCollapsed && (
                <div className="p-3 flex flex-col gap-2">
                  {visible.map(p => {
                    const isExpanded = expandedPokemon === p.name
                    return (
                      <div key={p.name}
                        className="bg-[#0c1015]/60 border border-white/5 rounded-lg hover:border-white/10 transition-all duration-200 overflow-hidden">
                        {/* Header row */}
                        <button onClick={() => toggleExpand(p.name)}
                          className="w-full flex items-center justify-between p-3 text-left">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-bold text-white text-sm">{p.name}</p>
                                <span className="text-xs px-1.5 py-0.5 rounded font-mono-tech flex-shrink-0"
                                  style={{ background: `${ROLE_COLORS[p.role]}22`, color: ROLE_COLORS[p.role] }}>{p.role}</span>
                              </div>
                              <div className="flex gap-1 flex-wrap">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 ml-3 flex-shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="font-mono-tech text-xs text-[#4a6070]">{p.usage} {lang === 'es' ? 'uso' : 'use'}</p>
                              <p className="font-mono-tech text-xs font-bold" style={{ color: tier.color }}>{p.wr} {lang === 'es' ? 'win' : 'win'}</p>
                            </div>
                            <span className="text-[#4a6070] text-xs">{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-white/5 pt-3">
                            {/* Stats mobile */}
                            <div className="flex gap-4 mb-3 sm:hidden">
                              <span className="font-mono-tech text-xs text-[#4a6070]">{p.usage} {lang === 'es' ? 'uso' : 'use'}</span>
                              <span className="font-mono-tech text-xs font-bold" style={{ color: tier.color }}>{p.wr} {lang === 'es' ? 'win' : 'win'}</span>
                            </div>

                            {/* Set info */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                              <div className="bg-[#111820] rounded-lg p-2.5">
                                <p className="font-mono-tech text-xs text-[#4a6070] mb-1">{lang === 'es' ? 'OBJETO' : 'ITEM'}</p>
                                <p className="text-xs text-white font-semibold">{p.item}</p>
                              </div>
                              <div className="bg-[#111820] rounded-lg p-2.5">
                                <p className="font-mono-tech text-xs text-[#4a6070] mb-1">{lang === 'es' ? 'HABILIDAD' : 'ABILITY'}</p>
                                <p className="text-xs text-white font-semibold">{p.ability}</p>
                              </div>
                              <div className="bg-[#111820] rounded-lg p-2.5">
                                <p className="font-mono-tech text-xs text-[#4a6070] mb-2">{lang === 'es' ? 'MOVIMIENTOS TOP' : 'TOP MOVES'}</p>
                                <div className="flex flex-wrap gap-1">
                                  {p.moves.map(m => (
                                    <span key={m} className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded font-mono-tech">{m}</span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Note */}
                            <p className="text-xs text-[#6a7a8a] leading-relaxed">
                              {lang === 'es' ? p.noteES : p.noteEN}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
          <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">
            {lang === 'es'
              ? '📊 Datos de showdowntier.com — 41.564 batallas Reg M-A, Abr 9–16 2026, rating medio 1200. Sets de Pikalytics Champions Tournament. Todos los Pokémon confirmados legales en Champions.'
              : '📊 Data from showdowntier.com — 41,564 Reg M-A battles, Apr 9–16 2026, avg rating 1200. Sets from Pikalytics Champions Tournament. All Pokémon confirmed legal in Champions.'}
          </p>
        </div>
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
          <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">
            {lang === 'es'
              ? '⚠️ Los Pokémon Paradoja y los Tesoros de la Ruina están prohibidos en Regulación M-A. Cualquier tier list que incluya Flutter Mane, Iron Hands, Chi-Yu o Chien-Pao es de otro formato.'
              : '⚠️ Paradox Pokémon and Treasures of Ruin are banned in Regulation M-A. Any tier list including Flutter Mane, Iron Hands, Chi-Yu or Chien-Pao is from a different format.'}
          </p>
        </div>
      </div>
    </div>
  )
}