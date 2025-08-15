"use client"

import { useQuery, type QueryHookOptions, type DocumentNode } from "@apollo/client"

export function useOptimizedQuery<TData = any, TVariables = any>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVariables>,
) {
  return useQuery(query, {
    ...options,
    fetchPolicy: options?.fetchPolicy || "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
    pollInterval: options?.pollInterval ? Math.max(options.pollInterval, 60000) : undefined, // Minimum 1 minute
  })
}

// Helper function to create optimized query options (not a hook)
export function createOptimizedQueryOptions<TVariables = any>(options?: QueryHookOptions<any, TVariables>) {
  return {
    ...options,
    fetchPolicy: options?.fetchPolicy || ("cache-first" as const),
    nextFetchPolicy: "cache-first" as const,
    notifyOnNetworkStatusChange: false,
    pollInterval: options?.pollInterval ? Math.max(options.pollInterval, 60000) : undefined,
  }
}
