import { useState } from 'react'
import TypeBadge from './TypeBadge'
import { useLang } from './lang'

const ARCHETYPES = [
  {
    id: 'goodstuffs',
    icon: '⚔️',
    color: '#f0c040',
    borderColor: 'border-yellow-400/30',
    bg: 'bg-yellow-400/5',
    labelES: 'Goodstuffs', labelEN: 'Goodstuffs',
    descES: 'Los mejores Pokémon individuales con sinergia natural. El arquetipo más consistente del meta actual.',
    descEN: 'Best individual Pokémon with natural synergy. Most consistent archetype in the current meta.',
    diffKey: 'gen.difficulty.beginner',
    diffColor: 'text-green-400',
    doubles: {
      strategyES: 'Construye alrededor de la utilidad de Incineroar y empareja atacantes fuertes con sinergia de tipos natural. Gana a través de matchups individuales superiores y un buen team preview.',
      strategyEN: 'Build around Incineroar\'s utility and pair strong attackers with natural type synergy. Win through superior individual matchups and smart team preview.',
      lead: 'Incineroar + Garchomp',
      team: [
        { name: 'Incineroar',      types: ['fire','dark'],      role: 'Support',  noteES: 'Fake Out + Intimidate turno 1. Parting Shot para pivotar con seguridad. El pegamento de cada equipo.', noteEN: 'Fake Out + Intimidate turn 1. Parting Shot to pivot safely. The glue of every team.' },
        { name: 'Garchomp',        types: ['dragon','ground'],  role: 'Attacker', noteES: 'Spread Earthquake + STAB Dragón. Forma Mega opcional para más potencia.', noteEN: 'Spread Earthquake + Dragon STAB. Mega form optional for extra power.' },
        { name: 'Kingambit',       types: ['dark','steel'],     role: 'Attacker', noteES: 'Sweep late game con Supreme Overlord. Deja que 1-2 compañeros caigan primero para máximo poder.', noteEN: 'Supreme Overlord late-game sweep. Let 1-2 teammates faint first for max power.' },
        { name: 'Sneasler',        types: ['fighting','poison'], role: 'Attacker', noteES: 'Velocidad Unburden tras usar el objeto. Dire Claw y parálisis desestabilizan al rival.', noteEN: 'Unburden speed after item use. Dire Claw paralysis fishing disrupts opponents.' },
        { name: 'Floette-Eternal', types: ['fairy'],            role: 'Attacker', noteES: '54.87% win rate — el más alto del formato. Aguanta golpes y reparte daño SpAtk masivo.', noteEN: '54.87% win rate — highest in the format. Tanks hits and deals massive SpAtk damage.' },
        { name: 'Sinistcha',       types: ['grass','ghost'],    role: 'Support',  noteES: 'Curación con Matcha Gotcha mantiene aliados sanos. Redirige y aguanta cuando hace falta.', noteEN: 'Matcha Gotcha healing keeps allies healthy. Redirects and stalls when needed.' },
      ],
    },
    singles: {
      strategyES: 'Usa Garchomp como condición de victoria y construye cubriendo sus debilidades. Mantén un atacante rápido y un pivot resistente.',
      strategyEN: 'Use Garchomp as your win condition and build around covering its weaknesses. Keep one fast attacker and one bulky pivot.',
      lead: 'Sneasler',
      team: [
        { name: 'Garchomp',        types: ['dragon','ground'],  role: 'Attacker', noteES: 'Condición de victoria principal. Danza Espada o Banda Elegida según el equipo.', noteEN: 'Primary win condition. Swords Dance or Choice Scarf depending on team needs.' },
        { name: 'Sneasler',        types: ['fighting','poison'], role: 'Attacker', noteES: 'Sweeper Unburden. Lidera y consume el objeto turno 1 para boost de velocidad instantáneo.', noteEN: 'Unburden sweeper. Lead and consume item turn 1 for instant speed boost.' },
        { name: 'Floette-Eternal', types: ['fairy'],            role: 'Attacker', noteES: 'Responde a los tipos Dragón que counteren a Garchomp. Sorprendentemente resistente.', noteEN: 'Answers Dragon types that counter Garchomp. Surprisingly bulky.' },
        { name: 'Corviknight',     types: ['flying','steel'],   role: 'Tank',     noteES: 'Muraliza los counters de Garchomp. Defog de apoyo. Pivot fiable con Presión.', noteEN: 'Walls Garchomp counters. Defog support. Reliable pivot with Pressure.' },
        { name: 'Kingambit',       types: ['dark','steel'],     role: 'Attacker', noteES: 'Limpiador de late game. Golpe Bajo prioridad tras acumular Supreme Overlord.', noteEN: 'Late-game cleaner. Sucker Punch priority after Supreme Overlord stacks.' },
        { name: 'Milotic',         types: ['water'],            role: 'Tank',     noteES: 'Competitive castiga Intimidate. Muro especial resistente para equilibrio.', noteEN: 'Competitive punishes Intimidate. Bulky special wall for balance.' },
      ],
    },
  },
  {
    id: 'tailwind',
    icon: '💨',
    color: '#33aaff',
    borderColor: 'border-blue-400/30',
    bg: 'bg-blue-400/5',
    labelES: 'Tailwind Offense', labelEN: 'Tailwind Offense',
    descES: 'Establece Tailwind para 4 turnos de Velocidad doblada, luego arrasa con atacantes rápidos y potentes.',
    descEN: 'Set Tailwind for 4 turns of doubled Speed, then overwhelm with fast, hard-hitting attackers.',
    diffKey: 'gen.difficulty.intermediate',
    diffColor: 'text-yellow-400',
    doubles: {
      strategyES: 'Lidera con tu setter de Tailwind + un atacante rápido. Una vez activo Tailwind, tu equipo supera en Speed a todo. Protege al setter turno 1 si es necesario.',
      strategyEN: 'Lead with your Tailwind setter + a fast attacker. Once Tailwind is up, your whole team outruns everything. Protect the setter turn 1 if needed.',
      lead: 'Aerodactyl + Garchomp',
      team: [
        { name: 'Aerodactyl',  types: ['rock','flying'],    role: 'Support',  noteES: 'Setter de Tailwind más rápido. Rock Slide spread + Tailwind. Taunt para detener setters rivales.', noteEN: 'Fastest Tailwind setter. Rock Slide spread + Tailwind. Taunt stops rival setters.' },
        { name: 'Garchomp',    types: ['dragon','ground'],  role: 'Attacker', noteES: 'Spread Earthquake golpea a ambos bajo Tailwind antes de que rivales puedan actuar.', noteEN: 'Spread Earthquake hits both under Tailwind before rivals can move.' },
        { name: 'Incineroar',  types: ['fire','dark'],      role: 'Support',  noteES: 'Fake Out asegura Tailwind turno 1. Pivot Intimidate para reiniciar la presión.', noteEN: 'Fake Out secures Tailwind turn 1. Intimidate pivot to reset pressure.' },
        { name: 'Sneasler',    types: ['fighting','poison'], role: 'Attacker', noteES: 'Bajo Tailwind, Unburden es redundante — úsalo como atacante puro.', noteEN: 'Under Tailwind, Unburden becomes redundant — use as raw attacker.' },
        { name: 'Kingambit',   types: ['dark','steel'],     role: 'Attacker', noteES: 'Supreme Overlord + Tailwind = limpiador imparable de late game.', noteEN: 'Supreme Overlord + Tailwind = unstoppable late-game cleaner.' },
        { name: 'Rotom-Wash',  types: ['electric','water'], role: 'Support',  noteES: 'Setter secundario de Tailwind. Will-O-Wisp pivot si Aerodactyl cae.', noteEN: 'Secondary Tailwind setter. Will-O-Wisp pivot if Aerodactyl is KO\'d.' },
      ],
    },
    singles: {
      strategyES: 'Usa Talonflame como lead para establecer Tailwind y amenazar inmediatamente con tus sweepers.',
      strategyEN: 'Use Talonflame as a lead to set Tailwind and immediately threaten with your sweepers.',
      lead: 'Talonflame',
      team: [
        { name: 'Talonflame',  types: ['fire','flying'],    role: 'Support',  noteES: 'Tailwind de prioridad con Alas Ígneas. Jugada sacrificio — establece Tailwind y presiona.', noteEN: 'Gale Wings priority Tailwind. Sacrifice play — set Tailwind and pressure immediately.' },
        { name: 'Garchomp',    types: ['dragon','ground'],  role: 'Attacker', noteES: 'Bajo Tailwind, Garchomp gana casi cualquier empate de Speed.', noteEN: 'Under Tailwind, Garchomp wins nearly every speed tie.' },
        { name: 'Sneasler',    types: ['fighting','poison'], role: 'Attacker', noteES: 'Ya es rápido — Tailwind lo hace ridículamente difícil de superar en Speed.', noteEN: 'Already fast — Tailwind makes it absurdly hard to outspeed.' },
        { name: 'Archaludon',  types: ['dragon','steel'],   role: 'Attacker', noteES: 'Amplia cobertura. Bajo Tailwind, ningún pivot defensivo puede responderlo con seguridad.', noteEN: 'Broad coverage. Under Tailwind, no defensive pivot can answer it safely.' },
        { name: 'Primarina',   types: ['water','fairy'],    role: 'Attacker', noteES: 'Atacante especial que se beneficia de superar en Speed a las aguas resistentes.', noteEN: 'Special attacker that benefits from outspeeding bulky waters.' },
        { name: 'Corviknight', types: ['flying','steel'],   role: 'Tank',     noteES: 'Defog + bulk. Plan B cuando expira Tailwind.', noteEN: 'Defog + bulk. Backup plan when Tailwind expires.' },
      ],
    },
  },
  {
    id: 'trickroom',
    icon: '🔮',
    color: '#ff88cc',
    borderColor: 'border-pink-400/30',
    bg: 'bg-pink-400/5',
    labelES: 'Trick Room', labelEN: 'Trick Room',
    descES: 'Invierte la prioridad de Velocidad durante 5 turnos. Tus Pokémon más lentos mueven primero — y golpean más fuerte.',
    descEN: 'Reverse Speed priority for 5 turns. Your slowest Pokémon move first — and hit the hardest.',
    diffKey: 'gen.difficulty.advanced',
    diffColor: 'text-red-400',
    doubles: {
      strategyES: 'Lidera con tu setter de TR + un usuario lento de Protección. Establece TR con seguridad, luego trae a tus atacantes pesados.',
      strategyEN: 'Lead with your TR setter + a slow Protect user. Set TR safely, then bring in your heavy hitters.',
      lead: 'Rotom-Wash + Gardevoir',
      team: [
        { name: 'Rotom-Wash',  types: ['electric','water'], role: 'Trick Room', noteES: 'Setter principal de TR. Will-O-Wisp reduce daño físico. Volt Switch pivota tras colocar TR.', noteEN: 'Primary TR setter. Will-O-Wisp cuts physical damage. Volt Switch pivots out after TR.' },
        { name: 'Gardevoir',   types: ['psychic','fairy'],  role: 'Support',   noteES: 'Traza copia habilidades. Setter secundario de TR + Señuelo para proteger a Rotom.', noteEN: 'Trace copies abilities. Secondary TR setter + Follow Me redirect to protect Rotom.' },
        { name: 'Incineroar',  types: ['fire','dark'],      role: 'Support',   noteES: 'Fake Out + Intimidate. Permite a Rotom establecer TR turno 1 sin interrupción.', noteEN: 'Fake Out + Intimidate. Lets Rotom set TR safely on turn 1 without interruption.' },
        { name: 'Sinistcha',   types: ['grass','ghost'],    role: 'Tank',      noteES: 'Lento y resistente — va primero bajo TR. Matcha Gotcha drena y cura simultáneamente.', noteEN: 'Slow and bulky — goes first under TR. Matcha Gotcha drains and heals simultaneously.' },
        { name: 'Kingambit',   types: ['dark','steel'],     role: 'Attacker',  noteES: 'La baja Velocidad es una ventaja bajo TR. Supreme Overlord + Iron Head destruye.', noteEN: 'Low Speed becomes an asset under TR. Supreme Overlord + Iron Head destroys.' },
        { name: 'Garchomp',    types: ['dragon','ground'],  role: 'Attacker',  noteES: 'Pick flexible — rápido fuera de TR, sigue golpeando duro dentro. Seguro de cobertura.', noteEN: 'Flex pick — fast outside TR, still hits hard inside. Coverage insurance.' },
      ],
    },
    singles: {
      strategyES: 'En Singles, TR dura 5 turnos y puede cambiar partidas enteras. Usa un setter y dos atacantes lentos y resistentes.',
      strategyEN: 'In Singles, TR lasts 5 turns and can swing entire games. Use one setter and two slow bulky attackers.',
      lead: 'Rotom-Wash',
      team: [
        { name: 'Rotom-Wash',  types: ['electric','water'], role: 'Trick Room', noteES: 'Establece TR y amenaza inmediatamente con Hydro Pump o Will-O-Wisp.', noteEN: 'Set TR and immediately threaten with Hydro Pump or Will-O-Wisp.' },
        { name: 'Sinistcha',   types: ['grass','ghost'],    role: 'Tank',       noteES: 'Lento y casi indestructible bajo TR. Sustain con Matcha Gotcha gana stall wars.', noteEN: 'Slow and nearly unkillable under TR. Matcha Gotcha sustain wins stall wars.' },
        { name: 'Kingambit',   types: ['dark','steel'],     role: 'Attacker',   noteES: 'Mueve primero bajo TR. Iron Head con Supreme Overlord hace OHKO a la mayoría.', noteEN: 'Moves first under TR. Supreme Overlord Iron Head OHKOs most threats.' },
        { name: 'Gardevoir',   types: ['psychic','fairy'],  role: 'Support',    noteES: 'Setter secundario de TR. Traza puede copiar habilidades útiles del rival.', noteEN: 'Backup TR setter. Trace ability can copy useful opponent abilities.' },
        { name: 'Incineroar',  types: ['fire','dark'],      role: 'Support',    noteES: 'Pivot e Intimidate de apoyo. Gana turnos para reiniciar TR si expira.', noteEN: 'Pivot and Intimidate support. Buys turns to reset TR if it expires.' },
        { name: 'Milotic',     types: ['water'],            role: 'Tank',       noteES: 'Competitive + bulk. Suficientemente lento para beneficiarse de TR. Cubre debilidades de Agua.', noteEN: 'Competitive + bulk. Slow enough to benefit from TR. Covers Water weaknesses.' },
      ],
    },
  },
  {
    id: 'rain',
    icon: '🌧️',
    color: '#2288ff',
    borderColor: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    labelES: 'Lluvia', labelEN: 'Rain',
    descES: 'Invoca lluvia para potenciar movimientos de Agua un 50% y activar Nado Rápido para Speed doblada.',
    descEN: 'Summon rain to boost Water moves by 50% and activate Swift Swim for doubled Speed.',
    diffKey: 'gen.difficulty.intermediate',
    diffColor: 'text-yellow-400',
    doubles: {
      strategyES: 'Lidera Pelipper para invocar Lluvia automáticamente. Empareja con un atacante de Nado Rápido para amenaza inmediata.',
      strategyEN: 'Lead Pelipper to auto-summon Rain. Pair with a Swift Swim attacker for immediate threat.',
      lead: 'Pelipper + Incineroar',
      team: [
        { name: 'Pelipper',    types: ['water','flying'],   role: 'Setter',   noteES: 'Llovizna invoca Lluvia automáticamente. Vendaval tiene 100% de precisión bajo Lluvia.', noteEN: 'Drizzle auto-summons Rain. Hurricane is 100% accurate in Rain. Tailwind flex.' },
        { name: 'Incineroar',  types: ['fire','dark'],      role: 'Support',  noteES: 'Fake Out protege a Pelipper turno 1. Intimidate suaviza los golpes físicos al setter.', noteEN: 'Fake Out protects Pelipper turn 1. Intimidate softens physical hits on the setter.' },
        { name: 'Basculegion', types: ['water','ghost'],    role: 'Attacker', noteES: 'Wave Crash + Lluvia = devastador. Adaptabilidad + boost de Agua supera 200 de poder.', noteEN: 'Wave Crash + Rain = devastating. Adaptability + Water boost hits over 200 power.' },
        { name: 'Kingambit',   types: ['dark','steel'],     role: 'Attacker', noteES: 'Tipo Acero resiste ataques de Hielo vs Pelipper. Sweep tardío con Supreme Overlord.', noteEN: 'Steel typing resists Ice attacks aimed at Pelipper. Late-game Supreme Overlord sweep.' },
        { name: 'Sinistcha',   types: ['grass','ghost'],    role: 'Support',  noteES: 'Redirección + curación. Protege al atacante de Nado Rápido de prioridad y spread.', noteEN: 'Redirect + heal. Protects your Swift Swim attacker from priority and spread.' },
        { name: 'Rotom-Wash',  types: ['electric','water'], role: 'Support',  noteES: 'Setter de Lluvia de respaldo. Trueno tiene 100% de precisión bajo Lluvia.', noteEN: 'Backup Rain setter via weather wars. Thunder is 100% accurate in Rain.' },
      ],
    },
    singles: {
      strategyES: 'Usa Pelipper como lead para invocar Lluvia y presiona inmediatamente con tu atacante de Agua.',
      strategyEN: 'Use Pelipper as lead and immediately pressure with your Water attacker.',
      lead: 'Pelipper',
      team: [
        { name: 'Pelipper',    types: ['water','flying'],   role: 'Setter',   noteES: 'Invoca Lluvia automáticamente. Usa Vendaval y Acua Jet para presionar inmediatamente.', noteEN: 'Auto-summon Rain. Use Hurricane and Scald to pressure immediately after.' },
        { name: 'Basculegion', types: ['water','ghost'],    role: 'Attacker', noteES: 'Mejor sweeper de Lluvia. Wave Crash con Adaptabilidad + Lluvia + STAB = nuke.', noteEN: 'Best Rain sweeper. Wave Crash with Adaptability + Rain + STAB = nuke.' },
        { name: 'Milotic',     types: ['water'],            role: 'Tank',     noteES: 'Agua resistente que se beneficia de la Lluvia. Competitive castiga Intimidate.', noteEN: 'Bulky Water that benefits from Rain. Competitive punishes Intimidate switches.' },
        { name: 'Kingambit',   types: ['dark','steel'],     role: 'Attacker', noteES: 'Anti-clima. Supreme Overlord arrasa cuando expira la Lluvia.', noteEN: 'Anti-weather check. Supreme Overlord sweeps when Rain expires.' },
        { name: 'Garchomp',    types: ['dragon','ground'],  role: 'Attacker', noteES: 'Inmunidad a Eléctrico. Cobertura para tipos Acero que bloquean el core de Agua.', noteEN: 'Ground immunity to Electric. Coverage for Steel types that wall Water.' },
        { name: 'Sinistcha',   types: ['grass','ghost'],    role: 'Support',  noteES: 'Sustain y desgaste. Cubre la debilidad a Planta del core de Agua.', noteEN: 'Sustain and chip. Covers Grass weakness of Water core.' },
      ],
    },
  },
  {
    id: 'sand',
    icon: '🏜️',
    color: '#bb8833',
    borderColor: 'border-yellow-700/30',
    bg: 'bg-yellow-900/10',
    labelES: 'Arena', labelEN: 'Sand',
    descES: 'Invoca tormenta de arena para daño pasivo y Sand Rush en Excadrill para boost instantáneo de Speed.',
    descEN: 'Summon sandstorm for passive chip damage and Sand Rush Excadrill for instant Speed boost.',
    diffKey: 'gen.difficulty.intermediate',
    diffColor: 'text-yellow-400',
    doubles: {
      strategyES: 'Lidera Tyranitar para establecer Arena y desgastar todo lo que no sea Roca/Acero/Tierra. Empareja con Excadrill para amenaza inmediata con Speed doblada.',
      strategyEN: 'Lead Tyranitar to set Sand and chip every non-Rock/Steel/Ground type. Pair with Excadrill to immediately threaten with doubled Speed.',
      lead: 'Tyranitar + Excadrill',
      team: [
        { name: 'Tyranitar',  types: ['rock','dark'],      role: 'Setter',   noteES: 'Sand Stream establece la tormenta. Bulk masivo + STAB Roca contrarresta equipos de Nieve.', noteEN: 'Sand Stream auto-sets sandstorm. Massive bulk + Rock STAB answers Snow teams.' },
        { name: 'Excadrill',  types: ['ground','steel'],   role: 'Attacker', noteES: 'Sand Rush dobla la Speed bajo Arena. Spread Earthquake + Iron Head para daño masivo.', noteEN: 'Sand Rush doubles Speed under Sand. Earthquake + Iron Head spread damage.' },
        { name: 'Incineroar', types: ['fire','dark'],      role: 'Support',  noteES: 'Fake Out + Intimidate. Pivot esencial para mantener el momentum del equipo.', noteEN: 'Fake Out + Intimidate. Essential pivot to maintain team momentum.' },
        { name: 'Garchomp',   types: ['dragon','ground'],  role: 'Attacker', noteES: 'Tipo Roca = inmune al daño de Arena. Spread Earthquake combina con Excadrill.', noteEN: 'Rock type = immune to Sand chip. Spread Earthquake pairs with Excadrill.' },
        { name: 'Kingambit',  types: ['dark','steel'],     role: 'Attacker', noteES: 'Acero = inmune al daño de Arena. Supreme Overlord limpia en late game.', noteEN: 'Steel = immune to Sand chip. Supreme Overlord sweeps late game.' },
        { name: 'Rotom-Wash', types: ['electric','water'], role: 'Support',  noteES: 'Responde a amenazas de Agua y Tierra que bloquean a Excadrill. Pivot con Will-O-Wisp.', noteEN: 'Answers Water and Ground threats that wall Excadrill. Will-O-Wisp pivot.' },
      ],
    },
    singles: {
      strategyES: 'La Arena proporciona presión pasiva cada turno. Usa Tyranitar + Excadrill como core y rellena con tipos inmunes a Arena.',
      strategyEN: 'Sand provides passive pressure every turn. Use Tyranitar + Excadrill as your core and fill with Sand-immune types.',
      lead: 'Tyranitar',
      team: [
        { name: 'Tyranitar',  types: ['rock','dark'],      role: 'Setter',   noteES: 'Establece Arena + Trampa Rocas. Variante Danza Dragón también es una seria amenaza.', noteEN: 'Set Sand + Stealth Rock. Dragon Dance variant is also a serious threat.' },
        { name: 'Excadrill',  types: ['ground','steel'],   role: 'Attacker', noteES: 'Sweeper Sand Rush. Variante Rompemoldes ignora Levitación en formas Rotom.', noteEN: 'Sand Rush sweeper. Mold Breaker variant ignores Levitate on Rotom forms.' },
        { name: 'Garchomp',   types: ['dragon','ground'],  role: 'Attacker', noteES: 'Tipo Roca inmune a Arena. Piel Dura + Arena = daño residual constante.', noteEN: 'Rock immune to Sand. Rough Skin chip + Sand = constant residual damage.' },
        { name: 'Kingambit',  types: ['dark','steel'],     role: 'Attacker', noteES: 'Acero inmune a Arena. Late-game Supreme Overlord tras desgaste de Arena.', noteEN: 'Steel immune to Sand. Late-game Supreme Overlord sweep after Sand wears them down.' },
        { name: 'Corviknight', types: ['flying','steel'],  role: 'Tank',     noteES: 'Acero inmune a Arena. Muraliza los tipos Lucha que amenazan a Tyranitar.', noteEN: 'Steel immune to Sand. Walls Fighting types that threaten Tyranitar.' },
        { name: 'Milotic',    types: ['water'],            role: 'Tank',     noteES: 'Responde a movimientos de Agua y Tierra. Competitive atrapa cambios de Intimidate.', noteEN: 'Answers Ground and Water moves. Competitive catches Intimidate switches.' },
      ],
    },
  },
]

const ROLE_COLORS = {
  'Setter':'#4488ff','Attacker':'#ff4422','Support':'#33aa33','Tank':'#aa88ff','Trick Room':'#ff88cc',
}

export default function TeamGenerator() {
  const { t, lang } = useLang()
  const [format, setFormat] = useState('doubles')
  const [selectedArchetype, setSelectedArchetype] = useState(null)
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const archetype = ARCHETYPES.find(a => a.id === selectedArchetype)
  const teamData = archetype?.[format]

  function generate(id) { setSelectedArchetype(id); setGenerated(true); setCopied(false) }
  function reset() { setSelectedArchetype(null); setGenerated(false); setCopied(false) }

  function copyTeam() {
    if (!teamData) return
    const names = teamData.team.map(p => p.name).join('\n')
    const label = lang === 'es' ? archetype.labelES : archetype.labelEN
    const text = `RivalEdge — ${label} (${format === 'doubles' ? t('gen.doubles') : t('gen.singles')})\n\nLead: ${teamData.lead}\n\nTeam:\n${names}\n\nrivaledge.net`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>

      {/* Header */}
      <div className="mb-6 bg-[#0c1015] border border-[#1c2830] rounded-xl p-5">
        <p className="font-orbitron text-yellow-400 text-sm font-bold tracking-widest mb-1">{t('gen.title')}</p>
        <p className="text-sm text-[#8899aa]">{t('gen.desc')}</p>
      </div>

      {/* Format selector */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => { setFormat('doubles'); setGenerated(false) }}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${
            format === 'doubles' ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'
          }`}>{t('gen.doubles')}</button>
        <button onClick={() => { setFormat('singles'); setGenerated(false) }}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${
            format === 'singles' ? 'bg-blue-400/10 border-blue-400/40 text-blue-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'
          }`}>{t('gen.singles')}</button>
      </div>

      {/* Archetype selector */}
      {!generated && (
        <div>
          <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest uppercase mb-4">{t('gen.choose')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ARCHETYPES.map(a => (
              <button key={a.id} onClick={() => generate(a.id)}
                className={`text-left rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] ${a.borderColor} ${a.bg}`}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 20px ${a.color}30`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <p className="font-orbitron text-sm font-bold text-white">{lang === 'es' ? a.labelES : a.labelEN}</p>
                    <p className={`font-mono-tech text-xs ${a.diffColor}`}>{t(a.diffKey)}</p>
                  </div>
                </div>
                <p className="text-xs text-[#6a7a8a] leading-relaxed">{lang === 'es' ? a.descES : a.descEN}</p>
                <p className="font-mono-tech text-xs mt-3 tracking-widest uppercase" style={{ color: a.color }}>{t('gen.generate')}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generated team */}
      {generated && archetype && teamData && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={reset} className="font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors">{t('gen.change')}</button>
            <button onClick={copyTeam} className="font-mono-tech text-xs text-[#4a6070] hover:text-white transition-colors border border-[#1c2830] hover:border-[#2a3840] px-3 py-1.5 rounded-lg">
              {copied ? t('global.copied') : t('gen.copy')}
            </button>
          </div>

          {/* Team header */}
          <div className={`rounded-xl border p-5 mb-4 ${archetype.borderColor} ${archetype.bg}`} style={{ boxShadow: `0 0 30px ${archetype.color}15` }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{archetype.icon}</span>
              <div>
                <p className="font-orbitron text-lg font-black text-white">{lang === 'es' ? archetype.labelES : archetype.labelEN}</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono-tech text-xs text-[#4a6070]">{format === 'doubles' ? t('gen.doubles') : t('gen.singles')}</span>
                  <span className="text-[#2a3840]">·</span>
                  <span className={`font-mono-tech text-xs ${archetype.diffColor}`}>{t(archetype.diffKey)}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#8899aa] leading-relaxed mb-3">{lang === 'es' ? teamData.strategyES : teamData.strategyEN}</p>
            <div className="flex items-center gap-2 bg-[#0c1015]/60 rounded-lg px-3 py-2">
              <span className="font-mono-tech text-xs text-[#4a6070]">{t('gen.lead')}</span>
              <span className="font-orbitron text-sm font-bold" style={{ color: archetype.color }}>{teamData.lead}</span>
            </div>
          </div>

          {/* Team members */}
          <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl overflow-hidden">
            <div className="bg-[#111820] px-5 py-3.5 border-b border-[#1c2830] flex items-center justify-between">
              <h2 className="font-orbitron text-sm font-bold tracking-widest uppercase text-white">{t('gen.your_team')}</h2>
              <span className="font-mono-tech text-xs text-[#4a6070]">{t('gen.reg')}</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamData.team.map((p, i) => {
                const isLead = teamData.lead.includes(p.name)
                return (
                  <div key={p.name} className={`rounded-xl border p-4 transition-all duration-200 ${isLead ? `${archetype.borderColor} ${archetype.bg}` : 'border-[#1c2830] bg-[#111820]'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono-tech text-xs text-[#4a6070]">{i + 1}</span>
                          <span className="font-bold text-white">{p.name}</span>
                          {isLead && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-mono-tech font-bold" style={{ background: `${archetype.color}22`, color: archetype.color }}>LEAD</span>
                          )}
                        </div>
                        <div className="flex gap-1">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 rounded font-mono-tech flex-shrink-0" style={{ background: `${ROLE_COLORS[p.role]}22`, color: ROLE_COLORS[p.role] }}>{p.role}</span>
                    </div>
                    <p className="text-xs text-[#6a7a8a] leading-relaxed">{lang === 'es' ? p.noteES : p.noteEN}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
            <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">{t('gen.source')}</p>
          </div>
        </div>
      )}
    </div>
  )
}