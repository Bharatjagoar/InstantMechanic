import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

function getInitialAuth() {
  try {
    return JSON.parse(localStorage.getItem('auth')) ?? { user: null, token: null }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuth)

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem('auth', JSON.stringify(auth))
    } else {
      localStorage.removeItem('auth')
    }
  }, [auth])

  const login = (user, token) => setAuth({ user, token })
  const logout = () => setAuth({ user: null, token: null })

  return <AuthContext.Provider value={{ ...auth, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
