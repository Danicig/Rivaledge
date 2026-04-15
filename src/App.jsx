import { useState } from 'react'
import TeamBuilder from './TeamBuilder'
import Landing from './Landing'
import { TeamProvider } from './TeamContext'

export default function App() {
  const [entered, setEntered] = useState(false)
  const [startTab, setStartTab] = useState('analysis')
  const [visible, setVisible] = useState(true)

  function handleEnter(tab = 'analysis') {
    setVisible(false)
    setTimeout(() => {
      setStartTab(tab)
      setEntered(true)
      setVisible(true)
    }, 300)
  }

  function handleBack() {
    setVisible(false)
    setTimeout(() => {
      setEntered(false)
      setVisible(true)
    }, 300)
  }

  return (
    <TeamProvider>
      <div className="transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }}>
        {!entered
          ? <Landing onEnter={handleEnter} />
          : <TeamBuilder startTab={startTab} onBack={handleBack} />
        }
      </div>
    </TeamProvider>
  )
}