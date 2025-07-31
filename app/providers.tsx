"use client"

import type React from "react"

import { ApolloProvider } from "@apollo/client"
import { AuthProvider } from "@/lib/auth-context"
import { apolloClient } from "@/lib/apollo-client"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ApolloProvider>
  )
}
