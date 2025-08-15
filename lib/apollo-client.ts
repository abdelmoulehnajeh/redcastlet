import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client"

const httpLink = createHttpLink({
  uri: "/api/graphql",
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Cache employees by location
          employees: {
            keyArgs: ["locationId"],
            merge(existing = [], incoming) {
              return incoming
            },
          },
          // Cache work schedules by employee and date range
          workSchedules: {
            keyArgs: ["employee_id", "date"],
            merge(existing = [], incoming) {
              return incoming
            },
          },
          workSchedulesRange: {
            keyArgs: ["employee_id", "start", "end"],
            merge(existing = [], incoming) {
              return incoming
            },
          },
          // Cache leave requests by employee and status
          leaveRequests: {
            keyArgs: ["employee_id", "status"],
            merge(existing = [], incoming) {
              return incoming
            },
          },
          // Cache contracts by employee
          contracts: {
            keyArgs: ["employee_id"],
            merge(existing = [], incoming) {
              return incoming
            },
          },
          // Cache time entries by employee and date range
          timeEntries: {
            keyArgs: ["employeeId", "startDate", "endDate"],
            merge(existing = [], incoming) {
              return incoming
            },
          },
          // Cache notifications by user
          notifications: {
            keyArgs: ["user_id", "role", "only_unseen"],
            merge(existing = [], incoming) {
              return incoming
            },
          },
          // Cache admin approvals by status
          adminApprovals: {
            keyArgs: ["status"],
            merge(existing = [], incoming) {
              return incoming
            },
          },
          // Cache payroll payments by period
          payrollPayments: {
            keyArgs: ["period"],
            merge(existing = [], incoming) {
              return incoming
            },
          },
          // Cache dashboard stats by user and role
          dashboardStats: {
            keyArgs: ["userId", "role"],
            merge(existing, incoming) {
              return { ...existing, ...incoming }
            },
          },
          // Cache locations
          locations: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
          // Cache employee details
          employee: {
            keyArgs: ["id"],
            merge(existing, incoming) {
              return { ...existing, ...incoming }
            },
          },
        },
      },
      Employee: {
        fields: {
          // Merge employee profile data
          profile: {
            merge(existing, incoming) {
              return { ...existing, ...incoming }
            },
          },
        },
      },
      Location: {
        fields: {
          // Cache employees within location
          employees: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "cache-first", // Use cache first, then network
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: false, // Reduce unnecessary re-renders
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first", // Use cache first for queries
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: false,
    },
    mutate: {
      errorPolicy: "all",
      refetchQueries: "none", // Don't refetch automatically
      awaitRefetchQueries: false,
      // Add update function to intelligently update cache instead of refetching
      update: (cache, { data }) => {
        // Cache will be updated by individual mutation handlers
      },
    },
  },
})

export const cacheUpdateHelpers = {
  // Update employee in cache after mutation
  updateEmployee: (cache: any, employee: any) => {
    cache.modify({
      fields: {
        employees(existingEmployees = []) {
          const index = existingEmployees.findIndex((emp: any) => emp.id === employee.id)
          if (index >= 0) {
            const newEmployees = [...existingEmployees]
            newEmployees[index] = employee
            return newEmployees
          }
          return [...existingEmployees, employee]
        },
      },
    })
  },

  // Update location in cache after mutation
  updateLocation: (cache: any, location: any) => {
    cache.modify({
      fields: {
        locations(existingLocations = []) {
          const index = existingLocations.findIndex((loc: any) => loc.id === location.id)
          if (index >= 0) {
            const newLocations = [...existingLocations]
            newLocations[index] = location
            return newLocations
          }
          return [...existingLocations, location]
        },
      },
    })
  },

  // Remove item from cache after deletion
  removeFromCache: (cache: any, typename: string, id: string) => {
    cache.evict({ id: cache.identify({ __typename: typename, id }) })
    cache.gc()
  },
}
