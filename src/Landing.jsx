import { useState, useEffect } from 'react'

const TOOLS = [
  {
    id: 'analysis',
    icon: '⚔️',
    title: 'Rival Analysis',
    desc: 'Add your team and the rival\'s. We tell you which Pokémon to bring and the best lead pair.',
    color: '#f0c040',
    border: 'border-yellow-400/30',
    bg: 'bg-yellow-400/5',
    glow: 'shadow-yellow-400/20',
  },
  {
    id: 'damage',
    icon: '💥',
    title: 'Damage Calc',
    desc: 'Real movepools from PokéAPI. Calculate exact damage ranges against any defender.',
    color: '#ff4422',
    border: 'border-red-400/30',
    bg: 'bg-red-400/5',
    glow: 'shadow-red-400/20',
  },
  {
    id: 'tierlist',
    icon: '📊',
    title: 'Tier List',
    desc: 'Current meta rankings for Regulation M-A. Know what\'s dominant before you play.',
    color: '#33aaff',
    border: 'border-blue-400/30',
    bg: 'bg-blue-400/5',
    glow: 'shadow-blue-400/20',
  },
  {
    id: 'types',
    icon: '🔷',
    title: 'Type Chart',
    desc: 'Full 18×18 interactive type effectiveness table. Find weaknesses in seconds.',
    color: '#33aa33',
    border: 'border-green-400/30',
    bg: 'bg-green-400/5',
    glow: 'shadow-green-400/20',
  },
]

const STATS = [
  { value: '187', label: 'Available Pokémon' },
  { value: '59', label: 'Mega Evolutions' },
  { value: '4', label: 'Tools' },
  { value: 'M-A', label: 'Active Regulation' },
]

export default function Landing({ onEnter }) {
  const [visible, setVisible] = useState(false)
  const [hoveredTool, setHoveredTool] = useState(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div className="min-h-screen bg-[#06080a] text-white overflow-hidden relative">

      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(240,192,64,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(240,192,64,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(240,192,64,0.08) 0%, transparent 70%)' }} />

      <div className={`relative z-10 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono-tech text-xs text-yellow-400 tracking-widest uppercase">Pokemon Champions 2026 · Regulation M-A</span>
        </div>

        <h1 className="font-orbitron text-7xl sm:text-8xl font-black tracking-widest mb-4 leading-none">
          RIVAL<span className="text-yellow-400" style={{ textShadow: '0 0 40px rgba(240,192,64,0.5)' }}>EDGE</span>
        </h1>

        <p className="font-mono-tech text-lg text-[#8899aa] mb-4 tracking-wide max-w-xl">
          The competitive edge your rival doesn't have.
        </p>
        <p className="text-[#4a6070] text-sm max-w-lg mb-12 leading-relaxed">
          Analyze teams, calculate damage with real movepools, check the meta and dominate every battle in Pokémon Champions.
        </p>

        <button onClick={() => onEnter('analysis')}
          className="group relative px-12 py-4 bg-yellow-400 text-black font-orbitron font-black text-sm tracking-widest uppercase rounded-xl transition-all duration-300 hover:scale-105 mb-4"
          style={{ boxShadow: '0 0 40px rgba(240,192,64,0.4)' }}>
          <span className="relative z-10">ENTER THE TOOLS</span>
          <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>

        <p className="text-xs text-[#4a6070] font-mono-tech">Free · No sign up required</p>
      </div>

      <div className={`relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto px-6 mb-16 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {STATS.map(s => (
          <div key={s.label} className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4 text-center">
            <div className="font-orbitron text-3xl font-black text-yellow-400 mb-1">{s.value}</div>
            <div className="font-mono-tech text-xs text-[#4a6070] uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`relative z-10 max-w-5xl mx-auto px-6 mb-20 transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest uppercase text-center mb-8">Available tools</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map(tool => (
            <div key={tool.id}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => onEnter(tool.id)}
              className={`cursor-pointer rounded-xl border p-6 transition-all duration-300 ${tool.border} ${tool.bg} ${hoveredTool === tool.id ? `shadow-lg ${tool.glow} scale-[1.02]` : ''}`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{tool.icon}</div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-white mb-2">{tool.title}</h3>
                  <p className="text-sm text-[#8899aa] leading-relaxed">{tool.desc}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: tool.color }}>Open tool →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`relative z-10 text-center pb-12 transition-all duration-1000 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-mono-tech text-xs text-[#2a3840]">
          RIVALEDGE · Pokemon Champions 2026 · Fan-made · Not affiliated with Nintendo or The Pokémon Company
        </p>
      </div>

    </div>
  )
}