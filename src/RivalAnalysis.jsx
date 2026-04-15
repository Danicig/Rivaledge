import { useState } from 'react'
import PokemonSearch from './PokemonSearch'
import TypeBadge from './TypeBadge'
import { getEff, TIPOS, getSpriteUrl } from './data'
import { useLang } from './lang'
import { useTeam } from './TeamContext'

function PokemonSprite({ pokemon, size = 48 }) {
  const url = getSpriteUrl(pokemon.spriteId)
  if (!url) return null
  return (
    <img
      src={url}
      alt={pokemon.name}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', flexShrink: 0 }}
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}

export default function RivalAnalysis() {
  const { t } = useLang()
  const { myTeam, addPokemon, removePokemon, clearTeam } = useTeam()

  const [format, setFormat] = useState('doubles')
  const [rival, setRival] = useState([])
  const [analyzed, setAnalyzed] = useState(false)
  const [scores, setScores] = useState([])
  const [bestLead, setBestLead] = useState(null)
  const [copied, setCopied] = useState(false)

  const bringCount = format === 'doubles' ? 4 : 3

  function addToRival(p) {
    if (rival.length >= 6 || rival.find(x => x.name === p.name)) return
    setRival([...rival, p])
    setAnalyzed(false)
  }

  function removeRival(name) {
    setRival(rival.filter(p => p.name !== name))
    setAnalyzed(false)
  }

  function clearRival() {
    setRival([])
    setAnalyzed(false)
  }

  function getTeamWeaknesses() {
    const counts = {}
    TIPOS.forEach(type => {
      const total = myTeam.reduce((sum, p) => sum + (getEff(type, p.types) >= 2 ? 1 : 0), 0)
      if (total > 0) counts[type] = total
    })
    return counts
  }

  function getTeamResistances() {
    const counts = {}
    TIPOS.forEach(type => {
      const total = myTeam.reduce((sum, p) => {
        const e = getEff(type, p.types)
        return sum + (e <= 0.5 && e > 0 ? 1 : 0)
      }, 0)
      if (total > 0) counts[type] = total
    })
    return counts
  }

  function getTeamImmunities() {
    const counts = {}
    TIPOS.forEach(type => {
      const total = myTeam.reduce((sum, p) => sum + (getEff(type, p.types) === 0 ? 1 : 0), 0)
      if (total > 0) counts[type] = total
    })
    return counts
  }

  function scorePair(p1, p2, rivalTeam) {
    let score = 0
    rivalTeam.forEach(rp => {
      const best1 = Math.max(...p1.types.map(t => getEff(t, rp.types)))
      const best2 = Math.max(...p2.types.map(t => getEff(t, rp.types)))

      score += Math.max(best1, best2) >= 4 ? 40 : Math.max(best1, best2) >= 2 ? 20 : 5

      const def1 = Math.max(...rp.types.map(t => getEff(t, p1.types)))
      const def2 = Math.max(...rp.types.map(t => getEff(t, p2.types)))

      if (def1 >= 4) score -= 30
      else if (def1 >= 2) score -= 10

      if (def2 >= 4) score -= 30
      else if (def2 >= 2) score -= 10

      if (def1 >= 2 && def2 <= 0.5) score += 15
      if (def2 >= 2 && def1 <= 0.5) score += 15
    })

    return Math.max(0, score)
  }

  function analyze() {
    if (myTeam.length === 0 || rival.length === 0) return

    const scored = myTeam.map(mp => {
      let score = 0
      const offensiveWins = []
      const dangers = []

      rival.forEach(rp => {
        const bestOff = Math.max(...mp.types.map(mt => getEff(mt, rp.types)))

        if (bestOff >= 4) {
          score += 40
          offensiveWins.push({ name: rp.name, mult: 4 })
        } else if (bestOff >= 2) {
          score += 20
          offensiveWins.push({ name: rp.name, mult: 2 })
        } else if (bestOff === 1) {
          score += 5
        } else {
          score -= 5
        }

        const worstDef = Math.max(...rp.types.map(rt => getEff(rt, mp.types)))

        if (worstDef >= 4) {
          score -= 35
          dangers.push({ name: rp.name, mult: 4 })
        } else if (worstDef >= 2) {
          score -= 12
          dangers.push({ name: rp.name, mult: 2 })
        } else if (worstDef <= 0) {
          score += 15
        } else if (worstDef <= 0.5) {
          score += 8
        }
      })

      return {
        pokemon: mp,
        score: Math.max(0, score),
        offensiveWins,
        dangers
      }
    })

    const sorted = [...scored].sort((a, b) => b.score - a.score)
    setScores(sorted)

    if (format === 'doubles') {
      const topN = sorted.slice(0, bringCount)
      let bestPair = null
      let bestPairScore = -1

      for (let i = 0; i < topN.length; i++) {
        for (let j = i + 1; j < topN.length; j++) {
          const s = scorePair(topN[i].pokemon, topN[j].pokemon, rival)
          if (s > bestPairScore) {
            bestPairScore = s
            bestPair = {
              p1: topN[i].pokemon,
              p2: topN[j].pokemon
            }
          }
        }
      }

      setBestLead(bestPair)
    }

    setAnalyzed(true)
  }

  function copyResults() {
    if (!analyzed || scores.length === 0) return

    const top = scores.slice(0, bringCount)

    let text = `RivalEdge — ${format === 'doubles' ? 'Doubles' : 'Singles'}\n`
    text += `Bring: ${top.map(s => s.pokemon.name).join(', ')}\n`

    if (bestLead && format === 'doubles') {
      text += `Lead: ${bestLead.p1.name} + ${bestLead.p2.name}\n`
    }

    text += `\nrivaledge.net`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const weaknesses = getTeamWeaknesses()
  const resistances = getTeamResistances()
  const immunities = getTeamImmunities()
  const maxScore = scores[0]?.score || 1

  return (
    <div>
      {/* El resto del JSX lo mantienes igual (ya no tenía errores estructurales) */}
    </div>
  )
}