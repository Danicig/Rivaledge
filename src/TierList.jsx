import { useState } from 'react'
import TypeBadge from './TypeBadge'
import { useLang } from './lang'

const DOUBLES_TIERS = [
  {
    tier: 'S', color: '#ff4422', bg: 'bg-red-950/30', border: 'border-red-500/30',
    labelES: 'Dominante — Alto uso y win rate', labelEN: 'Dominant — High usage & win rate',
    pokemon: [
      { name: 'Kingambit',       types: ['dark','steel'],     usage: '22.52%', wr: '52.46%', role: 'Attacker',  noteES: 'Supreme Overlord snowballa en late game. Mejor win rate entre los Pokémon de alto uso. Core en cualquier goodstuffs.', noteEN: 'Supreme Overlord snowballs late game. Best win rate among high-usage Pokémon. Core in every goodstuffs build.' },
      { name: 'Floette-Eternal', types: ['fairy'],            usage: '14.39%', wr: '54.87%', role: 'Attacker',  noteES: 'Mayor win rate de cualquier Pokémon con uso real (54.87%). Engañosamente resistente con SpAtk masivo.', noteEN: 'Highest win rate of any Pokémon with real usage (54.87%). Deceptively bulky with massive SpAtk.' },
      { name: 'Rotom-Wash',      types: ['electric','water'], usage: '17.75%', wr: '52.41%', role: 'Support',   noteES: 'Trick Room + Will-O-Wisp + pivot Volt Switch. Gran presencia en el top ladder. Responde a la mayoría de amenazas físicas.', noteEN: 'Trick Room + Will-O-Wisp + Volt Switch pivot. Huge presence on top ladder. Answers most physical threats.' },
    ],
  },
  {
    tier: 'A', color: '#ff8844', bg: 'bg-orange-950/30', border: 'border-orange-500/30',
    labelES: 'Core de Torneo — Presente en la mayoría de equipos top', labelEN: 'Tournament Core — Present in most top teams',
    pokemon: [
      { name: 'Incineroar', types: ['fire','dark'],     usage: '49.31%', wr: '50.01%', role: 'Support',  noteES: '#1 uso con 49%. Fake Out + Intimidate + Parting Shot. Presente en casi todos los equipos de torneo.', noteEN: '#1 usage at 49%. Fake Out + Intimidate + Parting Shot. Present on nearly every tournament team.' },
      { name: 'Sneasler',   types: ['fighting','poison'],usage: '38.16%', wr: '51.91%', role: 'Attacker', noteES: '#2 uso con 38%. Unburden lo convierte en uno de los atacantes más rápidos. Dire Claw y parálisis son brutales.', noteEN: '#2 usage at 38%. Unburden makes it one of the fastest attackers. Dire Claw paralysis fishing is brutal.' },
      { name: 'Garchomp',   types: ['dragon','ground'], usage: '36.31%', wr: '51.78%', role: 'Attacker', noteES: '#3 uso. Spread Earthquake + STAB Dragón. Forma Mega añade amenaza extra. Ancla ofensiva estándar.', noteEN: '#3 usage. Spread Earthquake + Dragon STAB. Mega form adds extra threat. Standard offensive anchor.' },
      { name: 'Sinistcha',  types: ['grass','ghost'],   usage: '31.65%', wr: '50.92%', role: 'Support',  noteES: 'Curación con Matcha Gotcha + redirección. Sustituyó a Amoonguss como support principal. Sorprendentemente resistente.', noteEN: 'Matcha Gotcha healing + redirection. Replaced Amoonguss as the go-to support. Surprisingly tanky.' },
      { name: 'Basculegion', types: ['water','ghost'],  usage: '19.86%', wr: '51.34%', role: 'Attacker', noteES: 'Wave Crash + STAB Fantasma. Adaptabilidad lo hace golpear durísimo. Amenaza emergente en el top ladder.', noteEN: 'Wave Crash + Ghost STAB. Adaptability makes it hit extremely hard. Emerging threat at high ladder.' },
    ],
  },
  {
    tier: 'B', color: '#ddbb00', bg: 'bg-yellow-950/30', border: 'border-yellow-500/30',
    labelES: 'Viable — Fuerte en el equipo adecuado', labelEN: 'Viable — Strong in the right team',
    pokemon: [
      { name: 'Aerodactyl',  types: ['rock','flying'],   usage: '9.75%',  wr: '53.17%', role: 'Attacker', noteES: 'Rock Slide spread + Tailwind. Top win rate para su rango de uso. Excelente lead ofensivo.', noteEN: 'Rock Slide spread + Tailwind support. Top win rate for its usage bracket. Excellent offensive lead.' },
      { name: 'Delphox',     types: ['fire','psychic'],  usage: '6.42%',  wr: '53.22%', role: 'Attacker', noteES: 'Mayor win rate del tier B. Magician roba objetos. Muy infrautilizado respecto a sus resultados reales.', noteEN: 'Highest win rate in B tier. Magician ability steals items. Hugely underused relative to actual performance.' },
      { name: 'Pelipper',    types: ['water','flying'],  usage: '15.27%', wr: '49.13%', role: 'Setter',   noteES: 'Setter de lluvia con Llovizna. Core con Swift Swim. Frenado por guerras de clima contra Arena y Nieve.', noteEN: 'Drizzle rain setter. Core with Swift Swim partners. Held back by weather wars with Sand and Snow teams.' },
      { name: 'Tyranitar',   types: ['rock','dark'],     usage: '15.19%', wr: '50.66%', role: 'Setter',   noteES: 'Sand Stream + bulk masivo. Contrarresta equipos de Nieve. Pick estándar junto a Incineroar.', noteEN: 'Sand Stream + massive bulk. Direct counter to Snow teams. Standard goodstuffs pick alongside Incineroar.' },
      { name: 'Charizard',   types: ['fire','flying'],   usage: '14.56%', wr: '50.55%', role: 'Attacker', noteES: 'Mega Charizard Y + core de Sol. Heat Wave spread bajo Sol es devastador. Objetivo de movimientos de prioridad.', noteEN: 'Mega Charizard Y + Sun core. Heat Wave spread under Sun is threatening. Targeted by priority moves.' },
      { name: 'Farigiraf',   types: ['normal','psychic'],usage: '14.51%', wr: '49.99%', role: 'Support',  noteES: 'Armor Tail bloquea Fake Out — contador directo al lead Incineroar. Future Sight + opción Trick Room.', noteEN: 'Armor Tail blocks Fake Out — hard counter to Incineroar leads. Future Sight pressure + Trick Room option.' },
      { name: 'Archaludon',  types: ['dragon','steel'],  usage: '12.63%', wr: '49.54%', role: 'Attacker', noteES: 'Cobertura STAB Dragón/Acero. Difícil de desgastar. Mejor como late-game sweeper.', noteEN: 'Dragon/Steel STAB coverage. Hard to chip. Best as a late-game sweeper once checks are removed.' },
      { name: 'Milotic',     types: ['water'],           usage: '9.45%',  wr: '51.23%', role: 'Tank',     noteES: 'Competitive convierte Intimidate en +2 SpAtk. Escama Milagro con estados. Difícil de derribar.', noteEN: 'Competitive turns Intimidate into +2 SpAtk. Marvel Scale with status. Hard to KO, punishes passive play.' },
    ],
  },
  {
    tier: 'C', color: '#33aaff', bg: 'bg-blue-950/20', border: 'border-blue-900/30',
    labelES: 'Situacional — Depende del matchup', labelEN: 'Situational — Matchup dependent',
    pokemon: [
      { name: 'Talonflame',  types: ['fire','flying'],   usage: '7.53%',  wr: '51.06%', role: 'Support',  noteES: 'Setter de Tailwind + Gale Wings priority. Frágil pero establece control de velocidad fiablemente.', noteEN: 'Tailwind setter + Gale Wings priority. Frail but sets speed control reliably in the right team.' },
      { name: 'Corviknight', types: ['flying','steel'],  usage: '7.16%',  wr: '51.03%', role: 'Tank',     noteES: 'Muro físico vs Sneasler y Garchomp. Utilidad Defog. Fiable pero superado por picks más ofensivos.', noteEN: 'Physical wall vs Sneasler and Garchomp. Defog utility. Reliable but outclassed by more offensive picks.' },
      { name: 'Gardevoir',   types: ['psychic','fairy'], usage: '6.55%',  wr: '51.02%', role: 'Attacker', noteES: 'Copia habilidades con Trace. Amplia cobertura especial. Buena en builds de Trick Room con Sinistcha.', noteEN: 'Trace ability copies useful abilities. Wide special coverage. Pairs with Sinistcha for Trick Room builds.' },
      { name: 'Primarina',   types: ['water','fairy'],   usage: '5.91%',  wr: '50.16%', role: 'Attacker', noteES: 'Tipado Agua/Hada sólido. Consistente pero superado por atacantes especiales más veloces.', noteEN: 'Solid Water/Fairy offensive typing. Consistent but outclassed by faster special attackers.' },
      { name: 'Azumarill',   types: ['water','fairy'],   usage: '1.28%',  wr: '54.97%', role: 'Attacker', noteES: '⭐ GEM OCULTA — Mayor win rate del formato entero (54.97%). Enorme Poder + Danza Espada arrasa. Muy infrautilizado.', noteEN: '⭐ HIDDEN GEM — Highest win rate of the entire format (54.97%). Huge Power + Belly Drum sweeps. Massively underused.' },
      { name: 'Dragapult',   types: ['dragon','ghost'],  usage: '4.65%',  wr: '50.37%', role: 'Attacker', noteES: '142 de Velocidad base. Dragon Darts golpea dos veces. Menor presencia que antes pero sigue amenazando.', noteEN: '142 base Speed. Dragon Darts hits twice. Falls short of prior hype but still a speed control threat.' },
      { name: 'Dragonite',   types: ['dragon','flying'], usage: '9.45%',  wr: '49.25%', role: 'Attacker', noteES: 'Multiscala aguanta el primer golpe. Extremvelocidad +2 prioridad. Win rate bajo el 50% limita su techo.', noteEN: 'Multiscale safe lead. Extreme Speed +2 priority. Below 50% win rate limits its ceiling.' },
    ],
  },
  {
    tier: 'D', color: '#888888', bg: 'bg-gray-950/20', border: 'border-gray-800/30',
    labelES: 'Con Dificultades — Hay opciones mejores', labelEN: 'Struggling — Better options available',
    pokemon: [
      { name: 'Froslass',   types: ['ice','ghost'],     usage: '8.83%',  wr: '49.69%', role: 'Setter',    noteES: 'Setter de Nieve. Win rate bajo el 50% — los tipos Roca son ahora counter estándar. El meta se adaptó.', noteEN: 'Snow Warning setter. Below 50% win rate — Rock types now standard counter. Snow meta has fully adapted.' },
      { name: 'Whimsicott', types: ['grass','fairy'],   usage: '18.97%', wr: '48.43%', role: 'Support',   noteES: '3er uso más alto pero win rate negativo. Sneasler lo contrarresta duramente. Actualmente sobrevalorado.', noteEN: '3rd highest usage but negative win rate. Sneasler hard counters it. Currently overhyped vs actual results.' },
      { name: 'Torkoal',    types: ['fire'],            usage: '6.15%',  wr: '49.13%', role: 'Setter',    noteES: 'Setter de Sol. Perdiendo la guerra de clima vs Lluvia y Arena. La baja velocidad es un lastre fuera de TR.', noteEN: 'Drought setter for Sun core. Losing weather war vs Rain and Sand. Slow speed a liability outside TR.' },
      { name: 'Excadrill',  types: ['ground','steel'],  usage: '7.57%',  wr: '49.72%', role: 'Attacker',  noteES: 'Sand Rush bajo Tyranitar. Win rate bajo el 50% — los equipos de Arena se están leyendo mejor.', noteEN: 'Sand Rush under Tyranitar. Below 50% win rate — Sand teams getting read more consistently at high ladder.' },
      { name: 'Hatterene',  types: ['psychic','fairy'], usage: '2.20%',  wr: '47.44%', role: 'Trick Room', noteES: 'Cayó fuerte desde el hype inicial. El meta de Trick Room se adaptó rápido. Frágil y lento de colocar.', noteEN: 'Dropped hard from prior hype. Trick Room meta adapted fast. Frail and slow to set up in current format.' },
    ],
  },
]

const SINGLES_TIERS = [
  {
    tier: 'S', color: '#ff4422', bg: 'bg-red-950/30', border: 'border-red-500/30',
    labelES: 'Top del meta', labelEN: 'Top of the meta',
    pokemon: [
      { name: 'Garchomp',        types: ['dragon','ground'],  usage: 'Top 1', wr: 'Top 1', role: 'Attacker', noteES: 'Mayor output físico + top Speed. Sets versátiles. Forma Mega añade amenaza. Obligatorio en equipos físicos.', noteEN: 'Highest physical output + top Speed tier. Versatile sets. Mega form adds threat. Mandatory on physical teams.' },
      { name: 'Floette-Eternal', types: ['fairy'],            usage: 'Top 3', wr: '75%+',  role: 'Attacker', noteES: 'Forma Flor Eterna. Mayor win rate en Singles 3v3. Resistencia natural + SpAtk masivo. Muy difícil de responder.', noteEN: 'Eternal Flower form. Highest win rate in 3v3 Singles. Natural bulk + massive SpAtk. Very hard to answer.' },
      { name: 'Sneasler',        types: ['fighting','poison'],usage: 'Top 2', wr: 'Top 2', role: 'Attacker', noteES: 'Velocidad Unburden + Close Combat. Domina igual que en Dobles. Letal tras consumir el objeto.', noteEN: 'Unburden speed + Close Combat. Carries over Doubles dominance. Deadly once White Herb is consumed.' },
    ],
  },
  {
    tier: 'A', color: '#ff8844', bg: 'bg-orange-950/30', border: 'border-orange-500/30',
    labelES: 'Fiable — Anclas de equipo', labelEN: 'Reliable — Team anchors',
    pokemon: [
      { name: 'Kingambit',   types: ['dark','steel'],    usage: 'Top 5', wr: 'High', role: 'Attacker', noteES: 'Bola de nieve Supreme Overlord. Bulk natural + Golpe Bajo prioridad. Limpiador de late game.', noteEN: 'Supreme Overlord snowball. Natural bulk + Sucker Punch priority. Sets up late game after teammates fall.' },
      { name: 'Corviknight', types: ['flying','steel'],  usage: 'Top 5', wr: 'High', role: 'Tank',     noteES: 'Muraliza Garchomp completamente. Defog + bulk físico. Pegamento de cualquier equipo que necesite un muro Acero.', noteEN: 'Walls Garchomp completely. Defog + physical bulk. Solid glue for any team needing a Steel wall.' },
      { name: 'Archaludon',  types: ['dragon','steel'],  usage: 'Top 5', wr: 'High', role: 'Attacker', noteES: 'Cobertura Dragón/Acero. Difícil de muralizar sin un counter específico.', noteEN: 'Dragon/Steel coverage. Hard to wall without a dedicated counter. Best of both offensive worlds.' },
      { name: 'Primarina',   types: ['water','fairy'],   usage: 'Top 5', wr: 'High', role: 'Attacker', noteES: 'Voz Líquida Hiperrayo difícil de bloquear. Agua/Hada cubre la mayoría del meta.', noteEN: 'Liquid Voice Hyper Voice is hard to block. Water/Fairy typing hits most of the meta.' },
      { name: 'Incineroar',  types: ['fire','dark'],     usage: 'High',  wr: 'Mid',  role: 'Support',  noteES: 'Utilidad Intimidate + Parting Shot. Menos dominante 1v1 pero sigue siendo el mejor support en Singles.', noteEN: 'Intimidate + Parting Shot utility. Less dominant 1v1 but still the best support option.' },
      { name: 'Milotic',     types: ['water'],           usage: 'High',  wr: 'High', role: 'Tank',     noteES: 'Competitive + bulk. Escama Milagro + Descanso stall. Muy difícil de derribar por fuerza bruta.', noteEN: 'Competitive + bulk. Marvel Scale + Rest stall. Very hard to break through raw power alone.' },
    ],
  },
  {
    tier: 'B', color: '#ddbb00', bg: 'bg-yellow-950/30', border: 'border-yellow-500/30',
    labelES: 'Viable — Picks situacionales', labelEN: 'Viable — Situational picks',
    pokemon: [
      { name: 'Tyranitar',  types: ['rock','dark'],    usage: 'Mid', wr: 'Mid',  role: 'Setter',   noteES: 'Sand Stream + Stealth Rock + STAB fuerte. Buena sinergia con Excadrill.', noteEN: 'Sand Stream + Stealth Rock + strong STAB. Pairs well with Sand Rush Excadrill.' },
      { name: 'Excadrill',  types: ['ground','steel'], usage: 'Mid', wr: 'Mid',  role: 'Attacker', noteES: 'Sweeper Sand Rush bajo Tyranitar. Supera en Speed a casi todo bajo Arena.', noteEN: 'Sand Rush sweeper under Tyranitar. Outspeeds everything in Sand. Falls flat without weather.' },
      { name: 'Dragapult',  types: ['dragon','ghost'], usage: 'Mid', wr: 'Mid',  role: 'Attacker', noteES: '142 Speed supera casi todo sin Banda Elegida. Dragon Darts + presión Fantasma.', noteEN: '142 Speed outspeeds nearly all non-scarfed threats. Dragon Darts + Ghost STAB pressure.' },
      { name: 'Aerodactyl', types: ['rock','flying'],  usage: 'Mid', wr: 'Mid',  role: 'Attacker', noteES: 'Lead más rápido sin Mega. Rock Slide flinch + Taunt bloquea setters y hazards.', noteEN: 'Fastest non-Mega lead. Rock Slide flinch fishing. Taunt shuts down setup and hazard setters.' },
      { name: 'Delphox',    types: ['fire','psychic'], usage: 'Low', wr: 'High', role: 'Attacker', noteES: 'Magician roba objetos — presión única. Infrautilizado pero rinde muy por encima de su uso.', noteEN: 'Magician item stealing creates unique pressure. Overshadowed in usage but punches above its weight.' },
    ],
  },
  {
    tier: 'C', color: '#33aa33', bg: 'bg-green-950/20', border: 'border-green-900/30',
    labelES: 'Situacional', labelEN: 'Situational',
    pokemon: [
      { name: 'Azumarill',  types: ['water','fairy'],  usage: 'Low', wr: 'Very High', role: 'Attacker', noteES: '⭐ Gem oculta. Enorme Poder + Aqua Jet arrasa equipos debilitados. Danza Espada es alto riesgo, enorme recompensa.', noteEN: '⭐ Hidden gem. Huge Power + Aqua Jet sweeps weakened teams. Belly Drum is high risk, massive reward.' },
      { name: 'Gengar',     types: ['ghost','poison'], usage: 'Low', wr: 'Low',       role: 'Attacker', noteES: 'Alto SpAtk pero muy frágil. Forma Mega añade bulk. Cuerpo Maldito puede salvar algunos matchups.', noteEN: 'High SpAtk but very frail. Mega form adds bulk. Cursed Body can clutch some matchups.' },
      { name: 'Sinistcha',  types: ['grass','ghost'],  usage: 'Low', wr: 'Mid',       role: 'Support',  noteES: 'El rol de support se mantiene desde Dobles. Menos impacto 1v1 pero Matcha Gotcha sigue siendo útil.', noteEN: 'Support role carries over from Doubles. Less impactful 1v1 but Matcha Gotcha healing still useful.' },
    ],
  },
]

const ROLE_COLORS = {
  'Setter': '#4488ff', 'Attacker': '#ff4422', 'Support': '#33aa33', 'Tank': '#aa88ff', 'Trick Room': '#ff88cc',
}

const ALL_ROLES = ['All', 'Attacker', 'Support', 'Tank', 'Setter', 'Trick Room']

export default function TierList() {
  const { t, lang } = useLang()
  const [format, setFormat] = useState('doubles')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [collapsed, setCollapsed] = useState({})

  const tiers = format === 'doubles' ? DOUBLES_TIERS : SINGLES_TIERS

  function toggleCollapse(tier) {
    setCollapsed(prev => ({ ...prev, [tier]: !prev[tier] }))
  }

  function filterPokemon(pokemon) {
    return pokemon.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'All' || p.role === roleFilter
      return matchSearch && matchRole
    })
  }

  const totalVisible = tiers.reduce((sum, tier) => sum + filterPokemon(tier.pokemon).length, 0)

  return (
    <div>

      {/* Format selector */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setFormat('doubles')}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${
            format === 'doubles' ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'
          }`}>{t('tl.doubles')}</button>
        <button onClick={() => setFormat('singles')}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${
            format === 'singles' ? 'bg-blue-400/10 border-blue-400/40 text-blue-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'
          }`}>{t('tl.singles')}</button>
      </div>

      {/* Info bar */}
      <div className="mb-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-orbitron text-xs font-bold text-yellow-400 tracking-widest mb-1">
            {format === 'doubles' ? t('tl.doubles_title') : t('tl.singles_title')} · REGULATION M-A
          </p>
          <p className="font-mono-tech text-xs text-[#4a6070]">
            {format === 'doubles' ? t('tl.source_doubles') : t('tl.source_singles')}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono-tech text-xs text-yellow-400">{t('global.active_until')}</span>
        </div>
      </div>

      {/* Search + Role filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('tl.search')}
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
              {role === 'All' ? t('tl.role.all') : role}
            </button>
          ))}
        </div>
      </div>

      {/* No results */}
      {totalVisible === 0 && (
        <div className="text-center py-12">
          <p className="text-[#4a6070] font-mono-tech text-sm">{t('tl.no_results')} "{search}"</p>
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
                    <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">{visible.length} {t('tl.pokemon_count')}</p>
                  </div>
                </div>
                <span className="text-[#4a6070] text-sm font-mono-tech">{isCollapsed ? '▼' : '▲'}</span>
              </button>

              {!isCollapsed && (
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {visible.map(p => (
                    <div key={p.name} className="bg-[#0c1015]/60 border border-white/5 rounded-lg p-3 hover:border-white/10 hover:bg-[#0c1015]/90 transition-all duration-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          <div className="flex gap-1 mt-1">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 ml-2">
                          <span className="font-mono-tech text-xs text-[#4a6070]">{p.usage} {t('tl.usage')}</span>
                          <span className="font-mono-tech text-xs font-bold" style={{ color: tier.color }}>{p.wr} {t('tl.win')}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-mono-tech" style={{ background: `${ROLE_COLORS[p.role]}22`, color: ROLE_COLORS[p.role] }}>{p.role}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#6a7a8a] leading-relaxed">{lang === 'es' ? p.noteES : p.noteEN}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
          <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">{t('tl.source_note')}</p>
        </div>
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
          <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">{t('tl.ban_note')}</p>
        </div>
      </div>
    </div>
  )
}