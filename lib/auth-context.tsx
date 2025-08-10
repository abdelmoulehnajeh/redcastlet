"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  role: string
  employee_id?: string
  location_id?: string | number
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("restaurant_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("restaurant_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    // Ensure location_id is always present (even if undefined, but not null)
    const userWithLocation: User = {
      ...userData,
      location_id: userData.location_id !== undefined && userData.location_id !== null ? userData.location_id : undefined,
    }
    setUser(userWithLocation)
    localStorage.setItem("restaurant_user", JSON.stringify(userWithLocation))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("restaurant_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
