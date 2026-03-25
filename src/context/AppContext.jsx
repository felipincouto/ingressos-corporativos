import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ic_user')) } catch { return null }
  })
  const [orderDraft, setOrderDraftRaw] = useState({
    quantity: null,
    participants: [],
    transport: null,
  })

  function setOrderDraft(update) {
    setOrderDraftRaw(prev => ({ ...prev, ...update }))
  }

  async function login(email, data_nascimento) {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, data_nascimento }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Credenciais inválidas')
    localStorage.setItem('ic_user', JSON.stringify(data.funcionario))
    setUser(data.funcionario)
    return data.funcionario
  }

  function logout() {
    localStorage.removeItem('ic_user')
    setUser(null)
    setOrderDraftRaw({ quantity: null, participants: [], transport: null })
  }

  return (
    <AppContext.Provider value={{ user, login, logout, orderDraft, setOrderDraft }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
