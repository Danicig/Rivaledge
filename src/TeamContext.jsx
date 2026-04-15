import { createContext, useContext, useState } from 'react'

const TeamContext = createContext(null)

export function TeamProvider({ children }) {
  const [myTeam, setMyTeam] = useState([])

  function addPokemon(p) {
    if (myTeam.length >= 6 || myTeam.find(x => x.name === p.name)) return
    setMyTeam(prev => [...prev, p])
  }

  function removePokemon(name) {
    setMyTeam(prev => prev.filter(p => p.name !== name))
  }

  function clearTeam() {
    setMyTeam([])
  }

  function replaceTeam(newTeam) {
    setMyTeam(newTeam.slice(0, 6))
  }

  return (
    <TeamContext.Provider value={{ myTeam, addPokemon, removePokemon, clearTeam, replaceTeam }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used inside TeamProvider')
  return ctx
}