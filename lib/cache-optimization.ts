import { apolloClient } from "./apollo-client"

// Batch cache updates to reduce re-renders
export const batchCacheUpdates = (updates: Array<() => void>) => {
  apolloClient.cache.batch(() => {
    updates.forEach((update) => update())
  })
}

// Preload critical data to reduce initial loading times
export const preloadCriticalData = async (userId: string, role: string) => {
  const queries = [
    {
      query: require("./graphql-queries").GET_DASHBOARD_DATA,
      variables: { userId, role },
    },
  ]

  // Preload in background without blocking UI
  queries.forEach(({ query, variables }) => {
    apolloClient
      .query({
        query,
        variables,
        fetchPolicy: "cache-first",
        errorPolicy: "ignore",
      })
      .catch(() => {
        // Ignore preload errors
      })
  })
}

// Clean up old cache entries to prevent memory leaks
export const cleanupCache = () => {
  const cache = apolloClient.cache

  // Remove entries older than 1 hour
  const oneHourAgo = Date.now() - 60 * 60 * 1000

  cache.modify({
    fields: {
      notifications(existing = [], { readField }) {
        return existing.filter((notif: any) => {
          const createdAt = readField("created_at", notif)
          return createdAt && new Date(createdAt).getTime() > oneHourAgo
        })
      },
    },
  })

  // Run garbage collection
  cache.gc()
}

// Set up periodic cache cleanup
if (typeof window !== "undefined") {
  setInterval(cleanupCache, 30 * 60 * 1000) // Every 30 minutes
}
