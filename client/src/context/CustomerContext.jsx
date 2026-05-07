import { createContext, useContext, useState } from 'react'

const STORAGE_KEY = 'rp_customer'

const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  function login(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setCustomer(data)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setCustomer(null)
  }

  return (
    <CustomerContext.Provider value={{ customer, login, logout }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  return useContext(CustomerContext)
}
