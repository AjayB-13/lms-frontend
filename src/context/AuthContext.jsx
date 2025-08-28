import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      api('/api/auth/me', { token }).then(setUser).catch(() => logout())
    }
  }, [token])

  function login(token) {
    setToken(token)
    localStorage.setItem('token', token)
  }
  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  return <AuthContext.Provider value={{ token, user, setUser, login, logout }}>{children}</AuthContext.Provider>
}