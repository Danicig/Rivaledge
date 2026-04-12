import { useState } from 'react'
import TeamBuilder from './TeamBuilder'
import Landing from './Landing'

export default function App() {
  const [entered, setEntered] = useState(false)
  const [startTab, setStartTab] = useState('analysis')

  function handleEnter(tab = 'analysis') {
    setStartTab(tab)
    setEntered(true)
  }

  function handleBack() {
    setEntered(false)
  }

  if (!entered) return <Landing onEnter={handleEnter} />
  return <TeamBuilder startTab={startTab} onBack={handleBack} />
}