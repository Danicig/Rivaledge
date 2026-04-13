import { useState } from 'react'
import TypeBadge from './TypeBadge'

// ─── DATA ────────────────────────────────────────────────────────────────────
// Source: showdowntier.com — VGC 2026 Regulation M-A (Pokémon Champions)
// 24,378 battles analyzed · April 9–13, 2026 · Avg rating 1166
// All Pokémon confirmed legal in Champions Reg M-A
// ─────────────────────────────────────────────────────────────────────────────

const DOUBLES_TIERS = [
  {
    tier: 'S',
    color: '#ff4422',
    bg: 'bg-red-950/30',
    border: 'border-red-500/30',
    label: 'Dominant — High usage & win rate',
    pokemon: [
      {
        name: 'Kingambit', types: ['dark','steel'],
        usage: '22.52%', wr: '52.46%', role: 'Attacker',
        note: 'Supreme Overlord snowballs late game. Best win rate among high-usage Pokémon. Core in every goodstuffs build.',
      },
      {
        name: 'Floette-Eternal', types: ['fairy'],
        usage: '14.39%', wr: '54.87%', role: 'Attacker',
        note: 'Highest win rate of any Pokémon with real usage (54.87%). Deceptively bulky with massive SpAtk. Underestimated at your peril.',
      },
      {
        name: 'Rotom-Wash', types: ['electric','water'],
        usage: '17.75%', wr: '52.41%', role: 'Support',
        note: 'Trick Room + Will-O-Wisp + Volt Switch pivot. Huge presence on top ladder. Answers most physical threats reliably.',
      },
    ],
  },
  {
    tier: 'A',
    color: '#ff8844',
    bg: 'bg-orange-950/30',
    border: 'border-orange-500/30',
    label: 'Tournament Core — Present in most top teams',
    pokemon: [
      {
        name: 'Incineroar', types: ['fire','dark'],
        usage: '49.31%', wr: '50.01%', role: 'Support',
        note: '#1 usage at 49%. Fake Out + Intimidate + Parting Shot. Present on nearly every tournament team. Auto-include.',
      },
      {
        name: 'Sneasler', types: ['fighting','poison'],
        usage: '38.16%', wr: '51.91%', role: 'Attacker',
        note: '#2 usage at 38%. Unburden makes it one of the fastest attackers. Dire Claw paralysis fishing is brutal.',
      },
      {
        name: 'Garchomp', types: ['dragon','ground'],
        usage: '36.31%', wr: '51.78%', role: 'Attacker',
        note: '#3 usage. Spread Earthquake + Dragon STAB. Mega form adds extra threat. Standard offensive anchor.',
      },
      {
        name: 'Sinistcha', types: ['grass','ghost'],
        usage: '31.65%', wr: '50.92%', role: 'Support',
        note: 'Matcha Gotcha healing + redirection. Replaced Amoonguss as the go-to support. Surprisingly tanky.',
      },
      {
        name: 'Basculegion', types: ['water','ghost'],
        usage: '19.86%', wr: '51.34%', role: 'Attacker',
        note: 'Wave Crash + Ghost STAB. Adaptability makes it hit extremely hard. Emerging threat at high ladder.',
      },
    ],
  },
  {
    tier: 'B',
    color: '#ddbb00',
    bg: 'bg-yellow-950/30',
    border: 'border-yellow-500/30',
    label: 'Viable — Strong in the right team',
    pokemon: [
      {
        name: 'Aerodactyl', types: ['rock','flying'],
        usage: '9.75%', wr: '53.17%', role: 'Attacker',
        note: 'Rock Slide spread + Tailwind support. Top win rate for its usage bracket. Excellent offensive lead.',
      },
      {
        name: 'Delphox', types: ['fire','psychic'],
        usage: '6.42%', wr: '53.22%', role: 'Attacker',
        note: 'Highest win rate in B tier. Magician ability steals items. Hugely underused relative to its actual performance.',
      },
      {
        name: 'Pelipper', types: ['water','flying'],
        usage: '15.27%', wr: '49.13%', role: 'Setter',
        note: 'Drizzle rain setter. Core with Swift Swim partners. Held back by weather wars with Sand and Snow teams.',
      },
      {
        name: 'Tyranitar', types: ['rock','dark'],
        usage: '15.19%', wr: '50.66%', role: 'Setter',
        note: 'Sand Stream + massive bulk. Direct counter to Snow teams. Standard goodstuffs pick alongside Incineroar.',
      },
      {
        name: 'Charizard', types: ['fire','flying'],
        usage: '14.56%', wr: '50.55%', role: 'Attacker',
        note: 'Mega Charizard Y + Sun core. Heat Wave spread under Sun is threatening. Targeted by priority moves.',
      },
      {
        name: 'Farigiraf', types: ['normal','psychic'],
        usage: '14.51%', wr: '49.99%', role: 'Support',
        note: 'Armor Tail blocks Fake Out — hard counter to Incineroar leads. Future Sight pressure + Trick Room option.',
      },
      {
        name: 'Archaludon', types: ['dragon','steel'],
        usage: '12.63%', wr: '49.54%', role: 'Attacker',
        note: 'Dragon/Steel STAB coverage. Hard to chip. Best as a late-game sweeper once checks are removed.',
      },
      {
        name: 'Milotic', types: ['water'],
        usage: '9.45%', wr: '51.23%', role: 'Tank',
        note: 'Competitive turns Intimidate into +2 SpAtk. Marvel Scale with status. Hard to KO, punishes passive play.',
      },
    ],
  },
  {
    tier: 'C',
    color: '#33aaff',
    bg: 'bg-blue-950/20',
    border: 'border-blue-900/30',
    label: 'Situational — Matchup dependent',
    pokemon: [
      {
        name: 'Talonflame', types: ['fire','flying'],
        usage: '7.53%', wr: '51.06%', role: 'Support',
        note: 'Tailwind setter + Gale Wings priority. Frail but sets speed control reliably in the right team.',
      },
      {
        name: 'Corviknight', types: ['flying','steel'],
        usage: '7.16%', wr: '51.03%', role: 'Tank',
        note: 'Physical wall vs Sneasler and Garchomp. Defog utility. Reliable but outclassed by more offensive picks.',
      },
      {
        name: 'Gardevoir', types: ['psychic','fairy'],
        usage: '6.55%', wr: '51.02%', role: 'Attacker',
        note: 'Trace ability copies useful abilities. Wide special coverage. Pairs with Sinistcha for Trick Room builds.',
      },
      {
        name: 'Primarina', types: ['water','fairy'],
        usage: '5.91%', wr: '50.16%', role: 'Attacker',
        note: 'Solid Water/Fairy offensive typing. Consistent but outclassed by faster special attackers in the current meta.',
      },
      {
        name: 'Azumarill', types: ['water','fairy'],
        usage: '1.28%', wr: '54.97%', role: 'Attacker',
        note: '⭐ HIDDEN GEM — Highest win rate of the entire format (54.97%). Huge Power + Belly Drum sweeps. Massively underused.',
      },
      {
        name: 'Dragapult', types: ['dragon','ghost'],
        usage: '4.65%', wr: '50.37%', role: 'Attacker',
        note: '142 base Speed. Dragon Darts hits twice. Falls short of prior hype but still a speed control threat.',
      },
      {
        name: 'Dragonite', types: ['dragon','flying'],
        usage: '9.45%', wr: '49.25%', role: 'Attacker',
        note: 'Multiscale safe lead. Extreme Speed +2 priority. Below 50% win rate — Sneasler and Kingambit handle it well.',
      },
    ],
  },
  {
    tier: 'D',
    color: '#888888',
    bg: 'bg-gray-950/20',
    border: 'border-gray-800/30',
    label: 'Struggling — Better options available',
    pokemon: [
      {
        name: 'Froslass', types: ['ice','ghost'],
        usage: '8.83%', wr: '49.69%', role: 'Setter',
        note: 'Snow Warning setter. Below 50% win rate — Rock types now standard counter. Snow meta has fully adapted.',
      },
      {
        name: 'Whimsicott', types: ['grass','fairy'],
        usage: '18.97%', wr: '48.43%', role: 'Support',
        note: '3rd highest usage but negative win rate. Sneasler hard counters it. Currently overhyped vs actual results.',
      },
      {
        name: 'Torkoal', types: ['fire'],
        usage: '6.15%', wr: '49.13%', role: 'Setter',
        note: 'Drought + Eruption in Trick Room. Losing weather war vs Rain and Sand. Slow speed a liability outside TR.',
      },
      {
        name: 'Excadrill', types: ['ground','steel'],
        usage: '7.57%', wr: '49.72%', role: 'Attacker',
        note: 'Sand Rush under Tyranitar. Below 50% win rate — Sand teams getting read more consistently at high ladder.',
      },
      {
        name: 'Hatterene', types: ['psychic','fairy'],
        usage: '2.20%', wr: '47.44%', role: 'Trick Room',
        note: 'Dropped hard from prior hype. Trick Room meta adapted fast. Frail and slow to set up in current format.',
      },
    ],
  },
]

const SINGLES_TIERS = [
  {
    tier: 'S',
    color: '#ff4422',
    bg: 'bg-red-950/30',
    border: 'border-red-500/30',
    label: 'Top of the meta',
    pokemon: [
      {
        name: 'Garchomp', types: ['dragon','ground'],
        usage: 'Top 1', wr: 'Top 1', role: 'Attacker',
        note: 'Highest physical output + top Speed tier. Versatile sets. Mega form adds threat. Mandatory on physical teams.',
      },
      {
        name: 'Floette-Eternal', types: ['fairy'],
        usage: 'Top 3', wr: '75%+', role: 'Attacker',
        note: 'Eternal Flower form. Highest win rate in 3v3 Singles. Natural bulk + massive SpAtk. Very hard to answer.',
      },
      {
        name: 'Sneasler', types: ['fighting','poison'],
        usage: 'Top 2', wr: 'Top 2', role: 'Attacker',
        note: 'Unburden speed + Close Combat. Carries over Doubles dominance. Deadly once White Herb is consumed.',
      },
    ],
  },
  {
    tier: 'A',
    color: '#ff8844',
    bg: 'bg-orange-950/30',
    border: 'border-orange-500/30',
    label: 'Reliable — Team anchors',
    pokemon: [
      {
        name: 'Kingambit', types: ['dark','steel'],
        usage: 'Top 5', wr: 'High', role: 'Attacker',
        note: 'Supreme Overlord snowball. Natural bulk + Sucker Punch priority. Sets up late game after teammates fall.',
      },
      {
        name: 'Corviknight', types: ['flying','steel'],
        usage: 'Top 5', wr: 'High', role: 'Tank',
        note: 'Walls Garchomp completely. Defog + physical bulk. Solid glue for any team needing a Steel wall.',
      },
      {
        name: 'Archaludon', types: ['dragon','steel'],
        usage: 'Top 5', wr: 'High', role: 'Attacker',
        note: 'Dragon/Steel coverage. Hard to wall without a dedicated counter. Best of both offensive worlds.',
      },
      {
        name: 'Primarina', types: ['water','fairy'],
        usage: 'Top 5', wr: 'High', role: 'Attacker',
        note: 'Liquid Voice Hyper Voice is hard to block. Water/Fairy typing hits most of the meta neutrally or better.',
      },
      {
        name: 'Incineroar', types: ['fire','dark'],
        usage: 'High', wr: 'Mid', role: 'Support',
        note: 'Intimidate + Parting Shot utility. Less dominant 1v1 than Doubles but still the best support option.',
      },
      {
        name: 'Milotic', types: ['water'],
        usage: 'High', wr: 'High', role: 'Tank',
        note: 'Competitive + bulk. Marvel Scale + Rest stall. Very hard to break through raw power alone.',
      },
    ],
  },
  {
    tier: 'B',
    color: '#ddbb00',
    bg: 'bg-yellow-950/30',
    border: 'border-yellow-500/30',
    label: 'Viable — Situational picks',
    pokemon: [
      {
        name: 'Tyranitar', types: ['rock','dark'],
        usage: 'Mid', wr: 'Mid', role: 'Setter',
        note: 'Sand Stream + Stealth Rock + strong STAB. Pairs well with Sand Rush Excadrill.',
      },
      {
        name: 'Excadrill', types: ['ground','steel'],
        usage: 'Mid', wr: 'Mid', role: 'Attacker',
        note: 'Sand Rush sweeper under Tyranitar. Outspeeds everything in Sand. Falls flat without weather support.',
      },
      {
        name: 'Dragapult', types: ['dragon','ghost'],
        usage: 'Mid', wr: 'Mid', role: 'Attacker',
        note: '142 Speed outspeeds nearly all non-scarfed threats. Dragon Darts + Ghost STAB pressure.',
      },
      {
        name: 'Aerodactyl', types: ['rock','flying'],
        usage: 'Mid', wr: 'Mid', role: 'Attacker',
        note: 'Fastest non-Mega lead. Rock Slide flinch fishing. Taunt shuts down setup and hazard setters.',
      },
      {
        name: 'Delphox', types: ['fire','psychic'],
        usage: 'Low', wr: 'High', role: 'Attacker',
        note: 'Magician item stealing creates unique pressure. Overshadowed in usage but punches well above its weight.',
      },
    ],
  },
  {
    tier: 'C',
    color: '#33aa33',
    bg: 'bg-green-950/20',
    border: 'border-green-900/30',
    label: 'Situational',
    pokemon: [
      {
        name: 'Azumarill', types: ['water','fairy'],
        usage: 'Low', wr: 'Very High', role: 'Attacker',
        note: '⭐ Hidden gem. Huge Power + Aqua Jet sweeps weakened teams. Belly Drum set is high risk, massive reward.',
      },
      {
        name: 'Gengar', types: ['ghost','poison'],
        usage: 'Low', wr: 'Low', role: 'Attacker',
        note: 'High SpAtk but very frail. Mega form adds bulk. Cursed Body can clutch some matchups.',
      },
      {
        name: 'Sinistcha', types: ['grass','ghost'],
        usage: 'Low', wr: 'Mid', role: 'Support',
        note: 'Support role carries over from Doubles. Less impactful 1v1 but Matcha Gotcha healing still useful.',
      },
    ],
  },
]

const ROLE_COLORS = {
  'Setter':     '#4488ff',
  'Attacker':   '#ff4422',
  'Support':    '#33aa33',
  'Tank':       '#aa88ff',
  'Trick Room': '#ff88cc',
}

const ALL_ROLES = ['All', 'Attacker', 'Support', 'Tank', 'Setter', 'Trick Room']

export default function TierList() {
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

  const totalVisible = tiers.reduce((sum, t) => sum + filterPokemon(t.pokemon).length, 0)

  return (
    <div>

      {/* Format selector */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setFormat('doubles')}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${
            format === 'doubles' ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'
          }`}>Doubles 2v2</button>
        <button onClick={() => setFormat('singles')}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${
            format === 'singles' ? 'bg-blue-400/10 border-blue-400/40 text-blue-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'
          }`}>Singles 3v3</button>
      </div>

      {/* Info bar */}
      <div className="mb-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-orbitron text-xs font-bold text-yellow-400 tracking-widest mb-1">
            {format === 'doubles' ? 'DOUBLES TIER LIST' : 'SINGLES TIER LIST'} · REGULATION M-A
          </p>
          <p className="font-mono-tech text-xs text-[#4a6070]">
            {format === 'doubles'
              ? 'Data: showdowntier.com · 24,378 battles · Apr 9–13, 2026 · Avg rating 1166'
              : 'Champions Lab 3v3 Singles ladder · Updated Apr 13, 2026'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono-tech text-xs text-yellow-400">Active until Jun. 2026</span>
        </div>
      </div>

      {/* Search + Role filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search Pokémon..."
          className="flex-1 bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-2.5 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech text-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {ALL_ROLES.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className="px-3 py-2 rounded-xl font-mono-tech text-xs tracking-widest uppercase transition-all border flex-shrink-0"
              style={
                roleFilter === role && role !== 'All'
                  ? { borderColor: `${ROLE_COLORS[role]}60`, color: ROLE_COLORS[role], background: `${ROLE_COLORS[role]}15` }
                  : roleFilter === role
                    ? { borderColor: 'rgba(240,192,64,0.4)', color: '#f0c040', background: 'rgba(240,192,64,0.1)' }
                    : { borderColor: '#1c2830', color: '#4a6070', background: '#0c1015' }
              }
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* No results */}
      {totalVisible === 0 && (
        <div className="text-center py-12">
          <p className="text-[#4a6070] font-mono-tech text-sm">No Pokémon found for "{search}"</p>
        </div>
      )}

      {/* Tiers */}
      <div className="flex flex-col gap-4">
        {tiers.map(tier => {
          const visible = filterPokemon(tier.pokemon)
          if (visible.length === 0) return null
          const isCollapsed = collapsed[tier.tier]

          return (
            <div key={tier.tier} className={`rounded-xl border ${tier.border} ${tier.bg} overflow-hidden`}>
              <button
                onClick={() => toggleCollapse(tier.tier)}
                className="w-full flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="font-orbitron text-3xl font-black" style={{ color: tier.color }}>{tier.tier}</div>
                  <div className="text-left">
                    <p className="font-orbitron text-xs font-bold text-white tracking-widest uppercase">{tier.label}</p>
                    <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">{visible.length} Pokémon</p>
                  </div>
                </div>
                <span className="text-[#4a6070] text-sm font-mono-tech">{isCollapsed ? '▼' : '▲'}</span>
              </button>

              {!isCollapsed && (
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {visible.map(p => (
                    <div
                      key={p.name}
                      className="bg-[#0c1015]/60 border border-white/5 rounded-lg p-3 hover:border-white/10 hover:bg-[#0c1015]/90 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          <div className="flex gap-1 mt-1">{p.types.map(t => <TypeBadge key={t} type={t} />)}</div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 ml-2">
                          <span className="font-mono-tech text-xs text-[#4a6070]">{p.usage} use</span>
                          <span className="font-mono-tech text-xs font-bold" style={{ color: tier.color }}>{p.wr} win</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-mono-tech"
                            style={{ background: `${ROLE_COLORS[p.role]}22`, color: ROLE_COLORS[p.role] }}>
                            {p.role}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#6a7a8a] leading-relaxed">{p.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer notices */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
          <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">
            📊 Doubles data from <span className="text-white">showdowntier.com</span> — 24,378 Reg M-A (Pokémon Champions) battles, April 9–13 2026, avg rating 1166. All Pokémon confirmed legal in Champions.
          </p>
        </div>
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
          <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">
            ⚠️ Paradox Pokémon and Treasures of Ruin are <span className="text-red-400">banned</span> in Regulation M-A. Any tier list including Flutter Mane, Iron Hands, Chi-Yu or Chien-Pao is from a different format.
          </p>
        </div>
      </div>

    </div>
  )
}