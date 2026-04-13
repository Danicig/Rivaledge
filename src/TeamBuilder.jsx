import { useState, useEffect } from 'react'
import TypeChart from './TypeChart'
import RivalAnalysis from './RivalAnalysis'
import TierList from './TierList'
import DamageCalc from './DamageCalc'

const tabs = [
  { id: 'analysis', label: 'Rival Analysis', shortLabel: 'Analysis', icon: '⚔️', color: '#f0c040' },
  { id: 'damage',   label: 'Damage Calc',    shortLabel: 'Damage',   icon: '💥', color: '#ff4422' },
  { id: 'tierlist', label: 'Tier List',       shortLabel: 'Tiers',    icon: '📊', color: '#33aaff' },
  { id: 'types',    label: 'Type Chart',      shortLabel: 'Types',    icon: '🔷', color: '#33aa33' },
]

export default function TeamBuilder({ startTab = 'analysis', onBack }) {
  const [activeTab, setActiveTab] = useState(startTab)
  const [contentVisible, setContentVisible] = useState(true)

  const currentTab = tabs.find(t => t.id === activeTab)

  function handleTabChange(tabId) {
    if (tabId === activeTab) return
    setContentVisible(false)
    setTimeout(() => {
      setActiveTab(tabId)
      setContentVisible(true)
    }, 150)
  }

  return (
    <div className="min-h-screen bg-[#06080a] text-white">

      {/* Header */}
      <header className="border-b border-[#1c2830] bg-[#0c1015] px-4 py-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none" />

        {/* Subtle color glow matching active tab */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${currentTab.color}08 0%, transparent 70%)` }}
        />

        <button
          onClick={onBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 text-[#4a6070] hover:text-yellow-400 transition-colors font-mono-tech text-xs tracking-widest uppercase"
        >
          ← Home
        </button>

        <h1 className="font-orbitron text-3xl sm:text-5xl font-black tracking-widest text-white relative z-10">
          RIVAL<span className="text-yellow-400" style={{ textShadow: '0 0 30px rgba(240,192,64,0.4)' }}>EDGE</span>
        </h1>
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest mt-1 relative z-10 uppercase hidden sm:block">
          Pokemon Champions 2026 · Competitive Team Builder & Analysis
        </p>
      </header>

      {/* Nav tabs */}
      <nav className="border-b border-[#1c2830] bg-[#0c1015] px-2 flex overflow-x-auto">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 sm:px-6 py-3.5 font-orbitron text-xs font-bold tracking-widest uppercase border-b-2 transition-all duration-200 whitespace-nowrap ${
                isActive ? 'border-current' : 'border-transparent text-[#4a6070] hover:text-white'
              }`}
              style={isActive ? {
                color: tab.color,
                borderColor: tab.color,
                textShadow: `0 0 12px ${tab.color}80`,
              } : {}}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          )
        })}
      </nav>

      {/* Content with fade transition */}
      <div
        className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 transition-opacity duration-150"
        style={{ opacity: contentVisible ? 1 : 0 }}
      >
        {activeTab === 'analysis' && <RivalAnalysis />}
        {activeTab === 'damage'   && <DamageCalc />}
        {activeTab === 'tierlist' && <TierList />}
        {activeTab === 'types'    && <TypeChart />}
      </div>

    </div>
  )
}