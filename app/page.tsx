
"use client"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (user === undefined) return
    if (user) {
      router.replace("/dashboard")
    } else {
      router.replace("/login")
    }
  }, [user, router])
  return null
}
