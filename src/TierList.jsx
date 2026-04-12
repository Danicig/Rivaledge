import { useState } from 'react'
import TypeBadge from './TypeBadge'

const DOUBLES_TIERS = [
  {
    tier: 'S',
    color: '#ff4422',
    bg: 'bg-red-950/30',
    border: 'border-red-500/30',
    label: '60%+ Win Rate',
    pokemon: [
      { name: 'Mega Froslass', types: ['ice','ghost'], wr: '63.8%', role: 'Setter', note: 'Snow Warning + Blizzard spread. Best offensive anchor at launch.' },
      { name: 'Hatterene', types: ['psychic','fairy'], wr: '62.3%', role: 'Trick Room', note: 'Primary Trick Room setter. Core with Indeedee-F.' },
      { name: 'Incineroar', types: ['fire','dark'], wr: '62.4%', role: 'Support', note: 'Present in 62% of tournament teams. Fake Out + Intimidate.' },
    ]
  },
  {
    tier: 'A',
    color: '#ff8844',
    bg: 'bg-orange-950/30',
    border: 'border-orange-500/30',
    label: 'Tournament Proven',
    pokemon: [
      { name: 'Mega Garchomp', types: ['dragon','ground'], wr: '55.2%', role: 'Attacker', note: 'Goodstuffs and Tailwind anchor. Dragon/Ground spread damage.' },
      { name: 'Whimsicott', types: ['grass','fairy'], wr: '54.1%', role: 'Support', note: 'Prankster Tailwind activates before any opponent can respond.' },
      { name: 'Dragapult', types: ['dragon','ghost'], wr: '50.8%', role: 'Attacker', note: '142 base Speed. Unkiteable under Tailwind.' },
      { name: 'Kingambit', types: ['dark','steel'], wr: '52.1%', role: 'Attacker', note: 'Supreme Overlord grows with each fainted ally. Best late game.' },
      { name: 'Dondozo', types: ['water'], wr: '58.6%', role: 'Tank', note: 'With Tatsugiri inside: +2 all stats. Nearly unkillable.' },
      { name: 'Tatsugiri', types: ['dragon','water'], wr: '58.6%', role: 'Support', note: 'Commander core with Dondozo. Most underrated duo in the meta.' },
    ]
  },
  {
    tier: 'B',
    color: '#ddbb00',
    bg: 'bg-yellow-950/30',
    border: 'border-yellow-500/30',
    label: 'Viable — Matchup Dependent',
    pokemon: [
      { name: 'Politoed', types: ['water'], wr: '51.3%', role: 'Setter', note: 'Rain core. Vulnerable to Sun and Sand weather override.' },
      { name: 'Torkoal', types: ['fire'], wr: '57.2%', role: 'Setter', note: 'Drought + Eruption under Trick Room. Devastating Sun core.' },
      { name: 'Tyranitar', types: ['rock','dark'], wr: '56.4%', role: 'Setter', note: 'Sand Stream. Direct counter to Mega Froslass Snow.' },
      { name: 'Excadrill', types: ['ground','steel'], wr: '56.4%', role: 'Attacker', note: 'Sand Rush doubles Speed under Sand. Core with Tyranitar.' },
      { name: 'Mega Dragonite', types: ['dragon','flying'], wr: '53.1%', role: 'Attacker', note: 'Multiscale safe lead. Extreme Speed +2 priority.' },
      { name: 'Amoonguss', types: ['grass','poison'], wr: '51.8%', role: 'Support', note: 'Rage Powder + Spore. Essential redirection in doubles.' },
      { name: 'Milotic', types: ['water'], wr: '50.2%', role: 'Tank', note: 'Competitive turns rival Intimidates into +2 SpAtk.' },
    ]
  },
  {
    tier: 'C',
    color: '#33aa33',
    bg: 'bg-green-950/20',
    border: 'border-green-900/30',
    label: 'Situational',
    pokemon: [
      { name: 'Mega Venusaur', types: ['grass','poison'], wr: '48.2%', role: 'Attacker', note: 'Sun core with Torkoal. Solar Beam no charge under Sun.' },
      { name: 'Chesnaught', types: ['grass','fighting'], wr: '52.8%', role: 'Tank', note: 'Bulletproof nullifies Shadow Ball, Energy Ball, Focus Blast.' },
      { name: 'Indeedee-F', types: ['normal','psychic'], wr: '49.1%', role: 'Support', note: 'Psychic Surge blocks priority moves. Exclusive Hatterene partner.' },
      { name: 'Oranguru', types: ['normal','psychic'], wr: '47.3%', role: 'Support', note: 'Instruct copies last move — doubles Torkoal Eruption in one turn.' },
    ]
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
      { name: 'Garchomp', types: ['dragon','ground'], wr: 'Top 1', role: 'Attacker', note: 'Highest physical output + top Speed. Versatile sets, hard to predict. Mega option adds extra threat.' },
      { name: 'Hippowdon', types: ['ground'], wr: 'Top 2', role: 'Tank', note: 'Sand Stream + Stealth Rock + Yawn + Slack Off. Best stall lead in Singles.' },
      { name: 'Floette', types: ['fairy'], wr: '75%+', role: 'Attacker', note: 'Eternal Flower form. Highest individual win rate in Singles according to Game Rant.' },
    ]
  },
  {
    tier: 'A',
    color: '#ff8844',
    bg: 'bg-orange-950/30',
    border: 'border-orange-500/30',
    label: 'Reliable — Team anchors',
    pokemon: [
      { name: 'Primarina', types: ['water','fairy'], wr: 'Top 5', role: 'Attacker', note: 'Strong special attacker. Water/Fairy coverage hits most of the meta.' },
      { name: 'Corviknight', types: ['flying','steel'], wr: 'Top 5', role: 'Tank', note: 'Hard wall vs Garchomp. Reliable physical tank with Pressure.' },
      { name: 'Meowscarada', types: ['grass','dark'], wr: 'Top 5', role: 'Attacker', note: 'Fast, hits hard, great offensive typing. Excellent lead option.' },
      { name: 'Archaludon', types: ['dragon','steel'], wr: 'Top 5', role: 'Attacker', note: 'Dragon/Steel coverage. Can be built as attacker or Stealth Rock setter.' },
      { name: 'Kingambit', types: ['dark','steel'], wr: 'Top 5', role: 'Attacker', note: 'Supreme Overlord reverse sweep. Natural bulk lets it set up late game.' },
      { name: 'Mimikyu', types: ['ghost','fairy'], wr: 'Top 5', role: 'Attacker', note: 'Disguise absorbs one hit for free. Unique physical attacker with surprise factor.' },
      { name: 'Hydreigon', types: ['dark','dragon'], wr: 'High', role: 'Attacker', note: 'Broad special coverage. Hard to switch into safely.' },
      { name: 'Greninja', types: ['water','dark'], wr: 'High', role: 'Attacker', note: 'Speed and versatility. Protean Mega adds unpredictability.' },
    ]
  },
  {
    tier: 'B',
    color: '#ddbb00',
    bg: 'bg-yellow-950/30',
    border: 'border-yellow-500/30',
    label: 'Viable — Situational',
    pokemon: [
      { name: 'Tyranitar', types: ['rock','dark'], wr: 'Mid', role: 'Setter', note: 'Sand Stream passive + strong STAB. Pairs well with Excadrill.' },
      { name: 'Excadrill', types: ['ground','steel'], wr: 'Mid', role: 'Attacker', note: 'Sand Rush under Hippowdon Sand. Fast physical threat.' },
      { name: 'Incineroar', types: ['fire','dark'], wr: 'Mid', role: 'Support', note: 'Less dominant than in Doubles but Intimidate still very useful.' },
      { name: 'Dragapult', types: ['dragon','ghost'], wr: 'Mid', role: 'Attacker', note: '142 Speed outspeeds almost all non-scarfed threats.' },
      { name: 'Milotic', types: ['water'], wr: 'Mid', role: 'Tank', note: 'Competitive + bulk. Hard to break with Intimidate teams.' },
    ]
  },
  {
    tier: 'C',
    color: '#33aa33',
    bg: 'bg-green-950/20',
    border: 'border-green-900/30',
    label: 'Situational',
    pokemon: [
      { name: 'Sylveon', types: ['fairy'], wr: 'Low', role: 'Tank', note: 'Pixilate Hyper Voice hits hard but Speed is limiting.' },
      { name: 'Gengar', types: ['ghost','poison'], wr: 'Low', role: 'Attacker', note: 'High SpAtk but frail. Better in Mega form.' },
      { name: 'Whimsicott', types: ['grass','fairy'], wr: 'Low', role: 'Support', note: 'Prankster Encore and status still useful but less impactful than in Doubles.' },
    ]
  },
]

const ROLE_COLORS = {
  'Setter': '#4488ff',
  'Attacker': '#ff4422',
  'Support': '#33aa33',
  'Tank': '#aa88ff',
  'Trick Room': '#ff88cc',
}

export default function TierList() {
  const [format, setFormat] = useState('doubles')
  const tiers = format === 'doubles' ? DOUBLES_TIERS : SINGLES_TIERS

  return (
    <div className="animate-fade-in">

      <div className="flex gap-3 mb-6">
        <button onClick={() => setFormat('doubles')}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${
            format === 'doubles' ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'
          }`}>Doubles 2v2</button>
        <button onClick={() => setFormat('singles')}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${
            format === 'singles' ? 'bg-blue-400/10 border-blue-400/40 text-blue-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'
          }`}>Singles 1v1</button>
      </div>

      <div className="mb-6 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-orbitron text-xs font-bold text-yellow-400 tracking-widest mb-1">
            {format === 'doubles' ? 'DOUBLES TIER LIST' : 'SINGLES TIER LIST'} · REGULATION M-A
          </p>
          <p className="font-mono-tech text-xs text-[#4a6070]">
            {format === 'doubles'
              ? 'Data from 2M+ simulated battles + 250 tournaments · Champions Lab / Switchblade Gaming'
              : 'Based on meta analysis · Sources: Games.GG, Game8, Game Rant · Updated Apr 10, 2026'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono-tech text-xs text-yellow-400">Active until Jun. 2026</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {tiers.map(tier => (
          <div key={tier.tier} className={`rounded-xl border ${tier.border} ${tier.bg} overflow-hidden`}>
            <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5">
              <div className="font-orbitron text-3xl font-black" style={{ color: tier.color }}>{tier.tier}</div>
              <p className="font-orbitron text-xs font-bold text-white tracking-widest uppercase">{tier.label}</p>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {tier.pokemon.map(p => (
                <div key={p.name} className="bg-[#0c1015]/60 border border-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-white text-sm">{p.name}</p>
                      <div className="flex gap-1 mt-1">{p.types.map(t => <TypeBadge key={t} type={t} />)}</div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="font-mono-tech text-xs font-bold" style={{ color: tier.color }}>{p.wr}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-mono-tech" style={{ background: `${ROLE_COLORS[p.role]}22`, color: ROLE_COLORS[p.role] }}>{p.role}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6a7a8a] leading-relaxed">{p.note}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
        <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">
          ⚠️ Paradox Pokémon and Treasures of Ruin are <span className="text-red-400">banned</span> in Regulation M-A. Any tier list including Flutter Mane, Iron Hands, Chi-Yu or Chien-Pao is from a different format.
        </p>
      </div>
    </div>
  )
}