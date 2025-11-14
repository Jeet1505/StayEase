"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthUser {
  id: number
  fullName: string
  email: string
  role: "user" | "owner"
}

interface AuthContextType {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user synchronously from localStorage so `isAuthenticated` is correct
  // on first render and we don't prematurely redirect client-only pages.
  // Use cookie-based JWT for authentication
  const [user, setUser] = useState<AuthUser | null>(null)
  useEffect(() => {
    const cookie = document.cookie.match(/(?:^|; )stayease_jwt=([^;]*)/)
    if (cookie) {
      // Optionally decode JWT here to get user info
      setUser({ id: 0, fullName: "", email: "", role: "user" }) // Placeholder, replace with decoded info
    } else {
      setUser(null)
    }
  }, [])

  const login = (userData: AuthUser) => {
    setUser(userData)
    // No localStorage, rely on cookie
  }

  const logout = () => {
    setUser(null)
    // Optionally clear cookie on logout
    document.cookie = "stayease_jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
