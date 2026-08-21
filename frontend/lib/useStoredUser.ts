'use client'

import { useEffect, useState } from 'react'
import { getStoredUser, type PrathomixUser } from '@/lib/auth'

export function useStoredUser() {
  const [user, setUser] = useState<PrathomixUser | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  return user
}