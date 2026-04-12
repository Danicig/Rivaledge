import { useState } from 'react'
import TypeChart from './TypeChart'
import RivalAnalysis from './RivalAnalysis'
import TierList from './TierList'
import DamageCalc from './DamageCalc'

export default function TeamBuilder({ startTab = 'analysis', onBack }) {
  const [activeTab, setActiveTab] = useState(startTab)

  const tabs = [
    { id: 'analysis', label: 'Rival Analysis' },
    { id: 'damage', label: 'Damage Calc' },
    { id: 'tierlist', label: 'Tier List' },
    { id: 'types', label: 'Type Chart' },
  ]

  return (
    <div className="min-h-screen bg-[#06080a] text-white">

      <header className="border-b border-[#1c2830] bg-[#0c1015] px-4 py-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none" />
        <button onClick={onBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 text-[#4a6070] hover:text-yellow-400 transition-colors font-mono-tech text-xs tracking-widest uppercase">
          ← Home
        </button>
        <h1 className="font-orbitron text-3xl sm:text-5xl font-black tracking-widest text-white relative z-10">
          RIVAL<span className="text-yellow-400">EDGE</span>
        </h1>
        <p className="font-mono-tech text-xs text-[#4a6070] tracking-widest mt-1 relative z-10 uppercase hidden sm:block">
          Pokemon Champions 2026 · Competitive Team Builder & Analysis
        </p>
      </header>

      <nav className="border-b border-[#1c2830] bg-[#0c1015] px-2 flex overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 sm:px-6 py-3.5 font-orbitron text-xs font-bold tracking-widest uppercase border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-[#4a6070] hover:text-white'
            }`}>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {activeTab === 'analysis' && <div className="animate-fade-in"><RivalAnalysis /></div>}
        {activeTab === 'damage' && <div className="animate-fade-in"><DamageCalc /></div>}
        {activeTab === 'tierlist' && <div className="animate-fade-in"><TierList /></div>}
        {activeTab === 'types' && <div className="animate-fade-in"><TypeChart /></div>}
      </div>

    </div>
  )
}