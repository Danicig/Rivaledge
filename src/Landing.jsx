import { useState, useEffect, useRef } from 'react'

const TOOLS = [
  {
    id: 'analysis',
    icon: '⚔️',
    title: 'Rival Analysis',
    desc: 'Add your team and the rival\'s. We tell you which Pokémon to bring and the best lead pair.',
    color: '#f0c040',
    border: 'border-yellow-400/30',
    bg: 'bg-yellow-400/5',
    hoverBorder: 'hover:border-yellow-400/60',
    accentColor: 'rgba(240,192,64,0.5)',
  },
  {
    id: 'damage',
    icon: '💥',
    title: 'Damage Calc',
    desc: 'Real movepools from PokéAPI. Calculate exact damage ranges against any defender.',
    color: '#ff4422',
    border: 'border-red-400/30',
    bg: 'bg-red-400/5',
    hoverBorder: 'hover:border-red-400/60',
    accentColor: 'rgba(255,68,34,0.5)',
  },
  {
    id: 'tierlist',
    icon: '📊',
    title: 'Tier List',
    desc: 'Current meta rankings for Regulation M-A. Know what\'s dominant before you play.',
    color: '#33aaff',
    border: 'border-blue-400/30',
    bg: 'bg-blue-400/5',
    hoverBorder: 'hover:border-blue-400/60',
    accentColor: 'rgba(51,170,255,0.5)',
  },
  {
    id: 'types',
    icon: '🔷',
    title: 'Type Chart',
    desc: 'Full 18×18 interactive type effectiveness table. Find weaknesses in seconds.',
    color: '#33aa33',
    border: 'border-green-400/30',
    bg: 'bg-green-400/5',
    hoverBorder: 'hover:border-green-400/60',
    accentColor: 'rgba(51,170,51,0.5)',
  },
]

const STATS = [
  { value: 187, label: 'Available Pokémon', isNumber: true },
  { value: 59, label: 'Mega Evolutions', isNumber: true },
  { value: 4, label: 'Tools', isNumber: true },
  { value: 'M-A', label: 'Active Regulation', isNumber: false },
]

function useCountUp(target, duration = 1200, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start || typeof target !== 'number') return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

function StatCard({ stat, animate }) {
  const count = useCountUp(stat.isNumber ? stat.value : 0, 1200, animate)
  return (
    <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4 text-center transition-all duration-300 hover:border-yellow-400/20 hover:bg-[#0e1318]">
      <div className="font-orbitron text-3xl font-black text-yellow-400 mb-1">
        {stat.isNumber ? count : stat.value}
      </div>
      <div className="font-mono-tech text-xs text-[#4a6070] uppercase tracking-widest">{stat.label}</div>
    </div>
  )
}

export default function Landing({ onEnter }) {
  const [visible, setVisible] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [hoveredTool, setHoveredTool] = useState(null)
  const statsRef = useRef(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#06080a] text-white overflow-hidden relative">

      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(240,192,64,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(240,192,64,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />

      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(240,192,64,0.08) 0%, transparent 70%)' }} />

      {/* Hero */}
      <div className={`relative z-10 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono-tech text-xs text-yellow-400 tracking-widest uppercase">Pokemon Champions 2026 · Regulation M-A</span>
        </div>

        {/* Logo */}
        <h1 className="font-orbitron text-4xl sm:text-7xl lg:text-8xl font-black tracking-widest mb-4 leading-none">
          RIVAL<span className="text-yellow-400" style={{ textShadow: '0 0 40px rgba(240,192,64,0.5)' }}>EDGE</span>
        </h1>

        {/* Tagline */}
        <p className="font-mono-tech text-lg text-[#8899aa] mb-4 tracking-wide max-w-xl">
          The competitive edge your rival doesn't have.
        </p>
        <p className="text-[#4a6070] text-sm max-w-lg mb-12 leading-relaxed">
          Analyze teams, calculate damage with real movepools, check the meta and dominate every battle in Pokémon Champions.
        </p>

        {/* CTA Button with shimmer */}
        <button
          onClick={() => onEnter('analysis')}
          className="group relative px-12 py-4 bg-yellow-400 text-black font-orbitron font-black text-sm tracking-widest uppercase rounded-xl transition-all duration-300 hover:scale-105 active:scale-100 mb-4 overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(240,192,64,0.4)' }}
        >
          <span className="relative z-10">ENTER THE TOOLS</span>
          {/* Shimmer sweep */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
        </button>

        <p className="text-xs text-[#4a6070] font-mono-tech mb-8">Free · No sign up required</p>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-1 opacity-40">
          <span className="font-mono-tech text-[10px] text-[#4a6070] tracking-widest uppercase">scroll</span>
          <div className="w-px h-6 bg-gradient-to-b from-yellow-400/50 to-transparent animate-bounce" />
        </div>
      </div>

      {/* Stats */}
      <div
        ref={statsRef}
        className={`relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto px-6 mb-16 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {STATS.map(s => (
          <StatCard key={s.label} stat={s} animate={statsVisible} />
        ))}
      </div>

      {/* Tools */}
      <div className={`relative z-10 max-w-5xl mx-auto px-6 mb-20 transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest uppercase text-center mb-8">Available tools</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool, i) => (
            <div
              key={tool.id}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => onEnter(tool.id)}
              className={`cursor-pointer rounded-xl border p-6 transition-all duration-300 ${tool.border} ${tool.bg} ${tool.hoverBorder} relative overflow-hidden`}
              style={{
                transitionDelay: `${i * 60}ms`,
                boxShadow: hoveredTool === tool.id ? `0 0 24px ${tool.accentColor}` : 'none',
                transform: hoveredTool === tool.id ? 'scale(1.02) translateY(-2px)' : 'scale(1) translateY(0)',
              }}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl transition-all duration-300"
                style={{
                  background: tool.color,
                  opacity: hoveredTool === tool.id ? 1 : 0.3,
                  boxShadow: hoveredTool === tool.id ? `0 0 8px ${tool.accentColor}` : 'none',
                }}
              />

              <div className="flex items-start gap-4">
                <div className="text-3xl">{tool.icon}</div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-white mb-2">{tool.title}</h3>
                  <p className="text-sm text-[#8899aa] leading-relaxed">{tool.desc}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="font-mono-tech text-xs tracking-widest uppercase transition-all duration-300"
                  style={{
                    color: tool.color,
                    letterSpacing: hoveredTool === tool.id ? '0.15em' : '0.1em',
                  }}
                >
                  Open tool →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={`relative z-10 text-center pb-12 transition-all duration-1000 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-mono-tech text-xs text-[#2a3840]">
          RIVALEDGE · Pokemon Champions 2026 · Fan-made · Not affiliated with Nintendo or The Pokémon Company
        </p>
      </div>

    </div>
  )
}