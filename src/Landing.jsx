import { useState, useEffect, useRef } from 'react'
import { useLang, toggleLang } from './lang'

const TOOLS = [
  { id: 'analysis',   icon: '⚔️', titleKey: 'tool.analysis.title',   descKey: 'tool.analysis.desc',   color: '#f0c040', border: 'border-yellow-400/30',  bg: 'bg-yellow-400/5',  accentColor: 'rgba(240,192,64,0.5)' },
  { id: 'ingame',     icon: '⚡', titleKey: 'tool.ingame.title',     descKey: 'tool.ingame.desc',     color: '#ff4422', border: 'border-red-400/30',     bg: 'bg-red-400/5',     accentColor: 'rgba(255,68,34,0.5)' },
  { id: 'damage',     icon: '💥', titleKey: 'tool.damage.title',     descKey: 'tool.damage.desc',     color: '#ff8844', border: 'border-orange-400/30',  bg: 'bg-orange-400/5',  accentColor: 'rgba(255,136,68,0.5)' },
  { id: 'tierlist',   icon: '📊', titleKey: 'tool.tierlist.title',   descKey: 'tool.tierlist.desc',   color: '#33aaff', border: 'border-blue-400/30',    bg: 'bg-blue-400/5',    accentColor: 'rgba(51,170,255,0.5)' },
  { id: 'speedtiers', icon: '🏃', titleKey: 'tool.speedtiers.title', descKey: 'tool.speedtiers.desc', color: '#33cc88', border: 'border-emerald-400/30', bg: 'bg-emerald-400/5', accentColor: 'rgba(51,204,136,0.5)' },
  { id: 'types',      icon: '🔷', titleKey: 'tool.types.title',      descKey: 'tool.types.desc',      color: '#33aa33', border: 'border-green-400/30',   bg: 'bg-green-400/5',   accentColor: 'rgba(51,170,51,0.5)' },
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

function StatCard({ value, label, isNumber, animate }) {
  const count = useCountUp(isNumber ? value : 0, 1200, animate)
  return (
    <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4 text-center transition-all duration-300 hover:border-yellow-400/20 hover:bg-[#0e1318]">
      <div className="font-orbitron text-3xl font-black text-yellow-400 mb-1">
        {isNumber ? count : value}
      </div>
      <div className="font-mono-tech text-xs text-[#4a6070] uppercase tracking-widest">{label}</div>
    </div>
  )
}

function LangToggle({ lang }) {
  return (
    <button onClick={toggleLang}
      className="flex items-center gap-1 border border-[#1c2830] hover:border-yellow-400/30 px-3 py-1.5 rounded-lg transition-colors">
      <span className="font-mono-tech text-xs transition-all" style={{ color: lang === 'es' ? '#f0c040' : '#4a6070' }}>ES</span>
      <span className="font-mono-tech text-xs text-[#2a3840]">|</span>
      <span className="font-mono-tech text-xs transition-all" style={{ color: lang === 'en' ? '#f0c040' : '#4a6070' }}>EN</span>
    </button>
  )
}

function ContactForm({ lang, onClose }) {
  const [status, setStatus] = useState('idle')
  const [form, setForm] = useState({ type: 'feedback', message: '', email: '' })

  const TYPES = [
    { id: 'feedback', labelES: '💬 Opinión', labelEN: '💬 Feedback' },
    { id: 'bug',      labelES: '🐛 Bug',     labelEN: '🐛 Bug' },
    { id: 'idea',     labelES: '💡 Idea',    labelEN: '💡 Idea' },
    { id: 'other',    labelES: '📩 Otro',    labelEN: '📩 Other' },
  ]

  async function handleSubmit() {
    if (!form.message.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('https://formspree.io/f/xyklebwq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          message: form.message,
          email: form.email || 'No email provided',
          _subject: `RivalEdge — ${form.type.toUpperCase()}`,
        }),
      })
      if (res.ok) { setStatus('success'); setForm({ type: 'feedback', message: '', email: '' }) }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-orbitron text-yellow-400 font-bold tracking-widest text-sm mb-1">
          {lang === 'es' ? '¡Mensaje enviado!' : 'Message sent!'}
        </p>
        <p className="text-xs text-[#8899aa] mb-4">
          {lang === 'es' ? 'Gracias, lo leo todo.' : 'Thanks, I read everything.'}
        </p>
        <button onClick={onClose} className="font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors">
          {lang === 'es' ? 'Cerrar' : 'Close'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(type => (
          <button key={type.id} onClick={() => setForm(f => ({ ...f, type: type.id }))}
            className="px-2.5 py-1.5 rounded-lg font-mono-tech text-xs border transition-all"
            style={form.type === type.id
              ? { borderColor: 'rgba(240,192,64,0.4)', color: '#f0c040', background: 'rgba(240,192,64,0.1)' }
              : { borderColor: '#1c2830', color: '#4a6070', background: '#0c1015' }}>
            {lang === 'es' ? type.labelES : type.labelEN}
          </button>
        ))}
      </div>

      <textarea
        value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        placeholder={lang === 'es' ? 'Bug, idea, opinión...' : 'Bug, idea, feedback...'}
        rows={3}
        className="w-full bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-3 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech text-sm resize-none"
      />

      <input
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder={lang === 'es' ? 'Email (opcional)' : 'Email (optional)'}
        type="email"
        className="w-full bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-2.5 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech text-sm"
      />

      <button
        onClick={handleSubmit}
        disabled={!form.message.trim() || status === 'sending'}
        className="w-full py-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl font-orbitron text-yellow-400 font-bold tracking-widest uppercase text-xs hover:bg-yellow-400/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {status === 'sending'
          ? (lang === 'es' ? 'Enviando...' : 'Sending...')
          : (lang === 'es' ? '📨 Enviar' : '📨 Send')}
      </button>

      {status === 'error' && (
        <p className="text-center font-mono-tech text-xs text-red-400">
          {lang === 'es' ? 'Error al enviar. Inténtalo de nuevo.' : 'Error sending. Please try again.'}
        </p>
      )}
    </div>
  )
}

// Botón flotante de feedback — visible siempre en esquina inferior derecha
function FloatingFeedback({ lang }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-[#111820] border border-[#1c2830] rounded-2xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 20px rgba(240,192,64,0.05)' }}>
          <div className="bg-[#0c1015] px-5 py-3.5 border-b border-[#1c2830] flex items-center justify-between">
            <div>
              <p className="font-orbitron text-sm font-bold text-white tracking-widest">
                {lang === 'es' ? '📬 Contacto' : '📬 Contact'}
              </p>
              <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">
                {lang === 'es' ? 'Lo leo todo y respondo.' : 'I read and respond to everything.'}
              </p>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-[#4a6070] hover:text-white transition-colors text-xl leading-none ml-3">×</button>
          </div>
          <div className="p-4">
            <ContactForm lang={lang} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105"
        style={{
          background: open ? '#111820' : '#0c1015',
          border: '1px solid rgba(240,192,64,0.3)',
          color: '#f0c040',
          boxShadow: '0 0 20px rgba(240,192,64,0.15)',
        }}>
        <span>{open ? '✕' : '📬'}</span>
        <span className="hidden sm:inline">{lang === 'es' ? 'Feedback' : 'Feedback'}</span>
      </button>
    </>
  )
}

export default function Landing({ onEnter }) {
  const { t, lang } = useLang()
  const [visible, setVisible] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [hoveredTool, setHoveredTool] = useState(null)
  const statsRef = useRef(null)

  const STATS = [
    { value: 187,   labelKey: 'landing.stat.pokemon', isNumber: true },
    { value: 59,    labelKey: 'landing.stat.megas',   isNumber: true },
    { value: 6,     labelKey: 'landing.stat.tools',   isNumber: true },
    { value: 'M-A', labelKey: 'landing.stat.reg',     isNumber: false },
  ]

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

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

      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(240,192,64,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(240,192,64,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(240,192,64,0.08) 0%, transparent 70%)' }} />

      <div className="absolute top-4 right-4 z-20">
        <LangToggle lang={lang} />
      </div>

      {/* Hero */}
      <div className={`relative z-10 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono-tech text-xs text-yellow-400 tracking-widest uppercase">{t('global.regulation')}</span>
        </div>

        <h1 className="font-orbitron text-4xl sm:text-7xl lg:text-8xl font-black tracking-widest mb-4 leading-none">
          RIVAL<span className="text-yellow-400" style={{ textShadow: '0 0 40px rgba(240,192,64,0.5)' }}>EDGE</span>
        </h1>

        <p className="font-mono-tech text-lg text-[#8899aa] mb-4 tracking-wide max-w-xl">{t('landing.tagline')}</p>
        <p className="text-[#4a6070] text-sm max-w-lg mb-12 leading-relaxed">{t('landing.desc')}</p>

        <button onClick={() => onEnter('analysis')}
          className="group relative px-12 py-4 bg-yellow-400 text-black font-orbitron font-black text-sm tracking-widest uppercase rounded-xl transition-all duration-300 hover:scale-105 active:scale-100 mb-4 overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(240,192,64,0.4)' }}>
          <span className="relative z-10">{t('landing.cta')}</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
        </button>

        <p className="text-xs text-[#4a6070] font-mono-tech mb-8">{t('global.free')}</p>

        <div className="flex flex-col items-center gap-1 opacity-40">
          <span className="font-mono-tech text-[10px] text-[#4a6070] tracking-widest uppercase">{t('global.scroll')}</span>
          <div className="w-px h-6 bg-gradient-to-b from-yellow-400/50 to-transparent animate-bounce" />
        </div>
      </div>

      {/* Stats */}
      <div ref={statsRef}
        className={`relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto px-6 mb-16 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {STATS.map(s => (
          <StatCard key={s.labelKey} value={s.value} label={t(s.labelKey)} isNumber={s.isNumber} animate={statsVisible} />
        ))}
      </div>

      {/* Tools */}
      <div className={`relative z-10 max-w-5xl mx-auto px-6 mb-20 transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest uppercase text-center mb-8">{t('global.available_tools')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool, i) => (
            <div key={tool.id}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => onEnter(tool.id)}
              className={`cursor-pointer rounded-xl border p-6 transition-all duration-300 ${tool.border} ${tool.bg} relative overflow-hidden`}
              style={{
                transitionDelay: `${i * 60}ms`,
                boxShadow: hoveredTool === tool.id ? `0 0 24px ${tool.accentColor}` : 'none',
                transform: hoveredTool === tool.id ? 'scale(1.02) translateY(-2px)' : 'scale(1) translateY(0)',
              }}>
              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl transition-all duration-300"
                style={{ background: tool.color, opacity: hoveredTool === tool.id ? 1 : 0.3, boxShadow: hoveredTool === tool.id ? `0 0 8px ${tool.accentColor}` : 'none' }} />
              <div className="flex items-start gap-4">
                <div className="text-3xl">{tool.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-orbitron text-base font-bold text-white">{t(tool.titleKey)}</h3>
                    {tool.id === 'ingame' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-[#8899aa] leading-relaxed">{t(tool.descKey)}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: tool.color }}>{t('global.open_tool')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={`relative z-10 text-center pb-20 transition-all duration-1000 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-mono-tech text-xs text-[#2a3840]">{t('global.footer')}</p>
      </div>

      {/* Floating feedback button — siempre visible */}
      <FloatingFeedback lang={lang} />

    </div>
  )
}