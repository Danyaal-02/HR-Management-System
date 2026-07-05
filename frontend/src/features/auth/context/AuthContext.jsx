import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate backend session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('hrms_token')
    const storedUser = localStorage.getItem('hrms_user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('hrms_token')
        localStorage.removeItem('hrms_user')
      }
    }
    setLoading(false)
  }, [])

  /**
   * Called after a successful login API response.
   */
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('hrms_token', jwtToken)
    localStorage.setItem('hrms_user', JSON.stringify(userData))
  }

  /**
   * Clears session
   */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('hrms_token')
    localStorage.removeItem('hrms_user')
  }

  /**
   * Update stored user fields
   */
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updatedFields }
      localStorage.setItem('hrms_user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
