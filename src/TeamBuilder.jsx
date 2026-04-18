import { useState } from 'react'
import TypeChart from './TypeChart'
import RivalAnalysis from './RivalAnalysis'
import TierList from './TierList'
import DamageCalc from './DamageCalc'
import InGame from './InGame'
import SpeedTiers from './SpeedTiers'
import { useLang, toggleLang } from './lang'

const TABS = [
  { id: 'analysis',   labelKey: 'tool.analysis.title',   shortLabel: 'Analysis',  icon: '⚔️', color: '#f0c040' },
  { id: 'ingame',     labelKey: 'tool.ingame.title',      shortLabel: 'In-Game',   icon: '⚡', color: '#ff4422' },
  { id: 'damage',     labelKey: 'tool.damage.title',      shortLabel: 'Damage',    icon: '💥', color: '#ff8844' },
  { id: 'tierlist',   labelKey: 'tool.tierlist.title',    shortLabel: 'Tiers',     icon: '📊', color: '#33aaff' },
  { id: 'speedtiers', labelKey: 'tool.speedtiers.title',  shortLabel: 'Speed',     icon: '🏃', color: '#33cc88' },
  { id: 'types',      labelKey: 'tool.types.title',       shortLabel: 'Types',     icon: '🔷', color: '#33aa33' },
]

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
        body: JSON.stringify({ type: form.type, message: form.message, email: form.email || 'No email provided', _subject: `RivalEdge — ${form.type.toUpperCase()}` }),
      })
      if (res.ok) { setStatus('success'); setForm({ type: 'feedback', message: '', email: '' }) }
      else setStatus('error')
    } catch { setStatus('error') }
  }
  if (status === 'success') return (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">✅</div>
      <p className="font-orbitron text-yellow-400 font-bold tracking-widest text-sm mb-1">{lang === 'es' ? '¡Mensaje enviado!' : 'Message sent!'}</p>
      <p className="text-xs text-[#8899aa] mb-4">{lang === 'es' ? 'Gracias, lo leo todo.' : 'Thanks, I read everything.'}</p>
      <button onClick={onClose} className="font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors">{lang === 'es' ? 'Cerrar' : 'Close'}</button>
    </div>
  )
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(type => (
          <button key={type.id} onClick={() => setForm(f => ({ ...f, type: type.id }))}
            className="px-2.5 py-1.5 rounded-lg font-mono-tech text-xs border transition-all"
            style={form.type === type.id ? { borderColor: 'rgba(240,192,64,0.4)', color: '#f0c040', background: 'rgba(240,192,64,0.1)' } : { borderColor: '#1c2830', color: '#4a6070', background: '#0c1015' }}>
            {lang === 'es' ? type.labelES : type.labelEN}
          </button>
        ))}
      </div>
      <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        placeholder={lang === 'es' ? 'Bug, idea, opinión...' : 'Bug, idea, feedback...'} rows={3}
        className="w-full bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-3 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech text-sm resize-none" />
      <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder={lang === 'es' ? 'Email (opcional)' : 'Email (optional)'} type="email"
        className="w-full bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-2.5 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech text-sm" />
      <button onClick={handleSubmit} disabled={!form.message.trim() || status === 'sending'}
        className="w-full py-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl font-orbitron text-yellow-400 font-bold tracking-widest uppercase text-xs hover:bg-yellow-400/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {status === 'sending' ? (lang === 'es' ? 'Enviando...' : 'Sending...') : (lang === 'es' ? '📨 Enviar' : '📨 Send')}
      </button>
      {status === 'error' && <p className="text-center font-mono-tech text-xs text-red-400">{lang === 'es' ? 'Error al enviar.' : 'Error sending.'}</p>}
    </div>
  )
}

function FloatingFeedback({ lang }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-[#111820] border border-[#1c2830] rounded-2xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
          <div className="bg-[#0c1015] px-5 py-3.5 border-b border-[#1c2830] flex items-center justify-between">
            <div>
              <p className="font-orbitron text-sm font-bold text-white tracking-widest">{lang === 'es' ? '📬 Contacto' : '📬 Contact'}</p>
              <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">{lang === 'es' ? 'Lo leo todo y respondo.' : 'I read and respond to everything.'}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#4a6070] hover:text-white transition-colors text-xl leading-none ml-3">×</button>
          </div>
          <div className="p-4"><ContactForm lang={lang} onClose={() => setOpen(false)} /></div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105"
        style={{ background: open ? '#111820' : '#0c1015', border: '1px solid rgba(240,192,64,0.3)', color: '#f0c040', boxShadow: '0 0 20px rgba(240,192,64,0.15)' }}>
        <span>{open ? '✕' : '📬'}</span>
        <span className="hidden sm:inline">Feedback</span>
      </button>
    </>
  )
}

export default function TeamBuilder({ startTab = 'analysis', onBack }) {
  const { t, lang } = useLang()
  const [activeTab, setActiveTab] = useState(startTab === 'generator' ? 'analysis' : startTab)
  const [contentVisible, setContentVisible] = useState(true)
  const currentTab = TABS.find(tab => tab.id === activeTab) || TABS[0]

  function handleTabChange(tabId) {
    if (tabId === activeTab) return
    setContentVisible(false)
    setTimeout(() => { setActiveTab(tabId); setContentVisible(true) }, 150)
  }

  return (
    <div className="min-h-screen bg-[#06080a] text-white">
      <header className="border-b border-[#1c2830] bg-[#0c1015] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${currentTab.color}08 0%, transparent 70%)` }} />
        <div className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-[#1c2830]/50">
          <button onClick={onBack} className="font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors tracking-widest uppercase flex-shrink-0">{t("nav.home")}</button>
          <LangToggle lang={lang} />
        </div>
        <div className="relative z-10 text-center px-4 py-3 sm:py-4">
          <h1 className="font-orbitron text-3xl sm:text-5xl font-black tracking-widest text-white">RIVAL<span className="text-yellow-400" style={{ textShadow: "0 0 30px rgba(240,192,64,0.4)" }}>EDGE</span></h1>
          <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest mt-1 uppercase hidden sm:block">{t("teambuilder.subtitle")}</p>
        </div>
      </header>

      <nav className="border-b border-[#1c2830] bg-[#0c1015] px-2 flex overflow-x-auto">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          const label = tab.id === 'ingame' ? 'In-Game' : t(tab.labelKey)
          return (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 sm:px-5 py-3.5 font-orbitron text-xs font-bold tracking-widest uppercase border-b-2 transition-all duration-200 whitespace-nowrap"
              style={isActive
                ? { color: tab.color, borderColor: tab.color, textShadow: `0 0 12px ${tab.color}80` }
                : { color: '#4a6070', borderColor: 'transparent' }
              }>
              <span className="text-sm">{tab.icon}</span>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {tab.id === 'ingame' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse ml-0.5" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-20 transition-opacity duration-150"
        style={{ opacity: contentVisible ? 1 : 0 }}>
        {activeTab === 'analysis'   && <RivalAnalysis />}
        {activeTab === 'ingame'     && <InGame />}
        {activeTab === 'damage'     && <DamageCalc />}
        {activeTab === 'tierlist'   && <TierList />}
        {activeTab === 'speedtiers' && <SpeedTiers />}
        {activeTab === 'types'      && <TypeChart />}
      </div>

      <FloatingFeedback lang={lang} />
    </div>
  )
}