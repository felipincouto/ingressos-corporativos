import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Employee auth
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ic_user')) } catch { return null }
  })

  // Admin auth
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ic_admin')) } catch { return null }
  })

  // Current event (fetched globally)
  const [evento, setEvento] = useState(null)

  const [orderDraft, setOrderDraftRaw] = useState({
    quantity: null, participants: [], transport: null,
  })

  // Fetch event on mount
  useEffect(() => {
    fetch('/api/admin/evento')
      .then(r => r.json())
      .then(data => { if (data.evento) setEvento(data.evento) })
      .catch(() => {})
  }, [])

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

  async function adminLogin(email, senha) {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Credenciais inválidas')
    const adminData = { ...data.admin, token: data.token }
    localStorage.setItem('ic_admin', JSON.stringify(adminData))
    setAdminUser(adminData)
    return adminData
  }

  function adminLogout() {
    localStorage.removeItem('ic_admin')
    setAdminUser(null)
  }

  return (
    <AppContext.Provider value={{
      user, login, logout,
      adminUser, adminLogin, adminLogout,
      evento, setEvento,
      orderDraft, setOrderDraft,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
