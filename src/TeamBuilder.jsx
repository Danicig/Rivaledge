import { useState } from 'react'
import TypeChart from './TypeChart'
import RivalAnalysis from './RivalAnalysis'
import TierList from './TierList'
import DamageCalc from './DamageCalc'
import TeamGenerator from './TeamGenerator'
import InGame from './InGame'
import SpeedTiers from './SpeedTiers'
import { useLang, toggleLang } from './lang'

const TABS = [
  { id: 'generator', labelKey: 'tool.generator.title', shortLabel: 'Generator', icon: '🧬', color: '#aa44ff' },
  { id: 'analysis',  labelKey: 'tool.analysis.title',  shortLabel: 'Analysis',  icon: '⚔️', color: '#f0c040' },
  { id: 'ingame',    labelKey: 'tool.ingame.title',     shortLabel: 'In-Game',   icon: '⚡', color: '#ff4422' },
  { id: 'damage',    labelKey: 'tool.damage.title',     shortLabel: 'Damage',    icon: '💥', color: '#ff8844' },
  { id: 'tierlist',  labelKey: 'tool.tierlist.title',   shortLabel: 'Tiers',     icon: '📊', color: '#33aaff' },
  { id: 'speedtiers',labelKey: 'tool.speedtiers.title', shortLabel: 'Speed',     icon: '🏃', color: '#33cc88' },
  { id: 'types',     labelKey: 'tool.types.title',      shortLabel: 'Types',     icon: '🔷', color: '#33aa33' },
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

export default function TeamBuilder({ startTab = 'analysis', onBack }) {
  const { t, lang } = useLang()
  const [activeTab, setActiveTab] = useState(startTab)
  const [contentVisible, setContentVisible] = useState(true)

  const currentTab = TABS.find(tab => tab.id === activeTab)

  function handleTabChange(tabId) {
    if (tabId === activeTab) return
    setContentVisible(false)
    setTimeout(() => { setActiveTab(tabId); setContentVisible(true) }, 150)
  }

  return (
    <div className="min-h-screen bg-[#06080a] text-white">
      <header className="border-b border-[#1c2830] bg-[#0c1015] px-4 py-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${currentTab.color}08 0%, transparent 70%)` }} />
        <button onClick={onBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 font-mono-tech text-xs text-[#4a6070] hover:text-yellow-400 transition-colors tracking-widest uppercase">
          {t('nav.home')}
        </button>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <LangToggle lang={lang} />
        </div>
        <h1 className="font-orbitron text-3xl sm:text-5xl font-black tracking-widest text-white relative z-10">
          RIVAL<span className="text-yellow-400" style={{ textShadow: '0 0 30px rgba(240,192,64,0.4)' }}>EDGE</span>
        </h1>
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest mt-1 relative z-10 uppercase hidden sm:block">
          {t('teambuilder.subtitle')}
        </p>
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

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 transition-opacity duration-150"
        style={{ opacity: contentVisible ? 1 : 0 }}>
        {activeTab === 'generator'  && <TeamGenerator />}
        {activeTab === 'analysis'   && <RivalAnalysis />}
        {activeTab === 'ingame'     && <InGame />}
        {activeTab === 'damage'     && <DamageCalc />}
        {activeTab === 'tierlist'   && <TierList />}
        {activeTab === 'speedtiers' && <SpeedTiers />}
        {activeTab === 'types'      && <TypeChart />}
      </div>
    </div>
  )
}