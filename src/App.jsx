import { useState, useEffect } from 'react'
import TeamBuilder from './TeamBuilder'
import Landing from './Landing'
import { TeamProvider } from './TeamContext'

export default function App() {
  const [entered, setEntered] = useState(false)
  const [startTab, setStartTab] = useState('analysis')
  const [visible, setVisible] = useState(true)

  // Cuando entramos a las herramientas, añadimos un estado al historial
  // para que el botón atrás del navegador vuelva a la landing
  useEffect(() => {
    function handlePopState() {
      if (entered) {
        setVisible(false)
        setTimeout(() => {
          setEntered(false)
          setVisible(true)
        }, 300)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [entered])

  function handleEnter(tab = 'analysis') {
    setVisible(false)
    setTimeout(() => {
      setStartTab(tab)
      setEntered(true)
      setVisible(true)
      // Añadir estado al historial para que el botón atrás funcione
      window.history.pushState({ page: 'tools' }, '', window.location.href)
    }, 300)
  }

  function handleBack() {
    setVisible(false)
    setTimeout(() => {
      setEntered(false)
      setVisible(true)
      window.history.back()
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