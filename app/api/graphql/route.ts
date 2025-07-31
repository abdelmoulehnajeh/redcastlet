import { ApolloServer } from "@apollo/server"
import { startServerAndCreateNextHandler } from "@as-integrations/next"
import { gql } from "graphql-tag"
import { Pool } from "pg"

// Database connection
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_Wf7HhZGIQDX0@ep-curly-tooth-ad2f1fpo-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
})

// GraphQL Schema
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    password: String!
    role: String!
    employee_id: String
    created_at: String
  }

  type Profile {
    first_name: String
    last_name: String
    phone: String
    address: String
    birth_date: String
    emergency_contact: String
  }

  type Employee {
    id: ID!
    username: String
    nom: String!
    prenom: String!
    email: String!
    telephone: String
    job_title: String
    location_id: String
    salaire: Float
    prime: Float
    infractions: Int
    absence: Int
    retard: Int
    bonus: Float
    avance: Float
    tenu_de_travail: Int
    status: String!
    role: String
    created_at: String
    location: Location
    profile: Profile
  }

  type Location {
    id: ID!
    name: String!
    address: String!
    phone: String
    created_at: String
    manager: Employee
    employees: [Employee!]!
  }

  type WorkSchedule {
    id: ID!
    employee_id: String!
    date: String!
    start_time: String
    end_time: String
    shift_type: String!
    job_position: String
    is_working: Boolean!
    created_at: String
    employee: Employee
  }

  type Contract {
    id: ID!
    employee_id: String!
    contract_type: String!
    start_date: String!
    end_date: String
    salary: Float!
    tenu_count: Int!
    documents: [String!]!
    status: String!
    created_at: String
    employee: Employee
  }

  type LeaveRequest {
    id: ID!
    employee_id: String!
    type: String!
    start_date: String!
    end_date: String!
    days_count: Int!
    reason: String
    status: String!
    manager_comment: String
    admin_comment: String
    created_at: String
    approved_by: Employee
    approved_at: String
    employee: Employee
  }

  type TimeEntry {
    id: ID!
    employee_id: String!
    clock_in: String
    clock_out: String
    break_duration: Int
    total_hours: Float
    date: String!
    status: String!
    location: Location
  }

  type DashboardStats {
    monthlyHours: Float
    weeklyHours: Float
    estimatedSalary: Float
    hourlyRate: Float
    remainingLeave: Int
    activeEmployees: Int
    totalEmployees: Int
    totalHours: Float
    pendingRequests: Int
    monthlyRevenue: Float
    revenueGrowth: Float
    recentActivity: [Activity!]!
  }

  type Activity {
    title: String!
    description: String!
    time: String!
    type: String!
  }

  type AdminApproval {
    id: ID!
    type: String!
    reference_id: ID!
    manager_id: ID!
    data: String!
    status: String!
    created_at: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    employees(locationId: ID): [Employee!]!
    employee(id: ID!): Employee
    locations: [Location!]!
    location(id: ID!): Location
    workSchedules(employee_id: ID, date: String): [WorkSchedule!]!
    contracts(employee_id: ID): [Contract!]!
    leaveRequests(employee_id: ID, status: String): [LeaveRequest!]!
    timeEntries(employeeId: ID!, startDate: String, endDate: String): [TimeEntry!]!
    dashboardStats(userId: ID!, role: String!): DashboardStats
    adminApprovals(status: String): [AdminApproval!]!
  }

  type Mutation {
    login(username: String!, password: String!): User
    createUser(username: String!, password: String!, role: String!, employee_id: String): User
    updateEmployee(
      id: ID!
      salaire: Float
      prime: Float
      infractions: Int
      absence: Int
      retard: Int
      bonus: Float
      avance: Float
      tenu_de_travail: Int
      status: String
    ): Employee
    createWorkSchedule(
      employee_id: ID!
      date: String!
      start_time: String
      end_time: String
      shift_type: String!
      job_position: String!
      is_working: Boolean!
    ): WorkSchedule
    updateWorkSchedule(
      id: ID!
      start_time: String
      end_time: String
      shift_type: String
      job_position: String
      is_working: Boolean
    ): WorkSchedule
    createLeaveRequest(
      employee_id: ID!
      type: String!
      start_date: String!
      end_date: String!
      reason: String
    ): LeaveRequest
    approveLeaveRequest(id: ID!, status: String!, comment: String): LeaveRequest
    createContract(
      employee_id: ID!
      contract_type: String!
      start_date: String!
      end_date: String
      salary: Float!
      tenu_count: Int
      documents: [String]
    ): Contract
    createEmployee(
      username: String!
      email: String!
      nom: String!
      prenom: String!
      telephone: String!
      job_title: String!
      salaire: Float
      role: String
      location_id: ID
    ): Employee
    deleteEmployee(id: ID!): Boolean
    clockIn(employeeId: ID!, locationId: ID!): TimeEntry
    clockOut(timeEntryId: ID!): TimeEntry
    createManagerWorkSchedule(
      employee_id: ID!
      shift_type: String!
      job_position: String!
      start_time: String!
      end_time: String!
      date: String!
      is_working: Boolean!
    ): WorkSchedule
    sendApprovalRequest(
      type: String!
      reference_id: ID
      manager_id: ID
      data: String!
    ): Boolean!
    approveManagerSchedule(approval_id: ID!): Boolean!
    rejectManagerSchedule(approval_id: ID!): Boolean!
    approveScheduleChange(approval_id: ID!): Boolean!
    rejectScheduleChange(approval_id: ID!, comment: String): Boolean!
  }
`

// GraphQL Resolvers
const resolvers = {
  Query: {
    adminApprovals: async (_: any, { status }: { status?: string }) => {
      try {
        let query = "SELECT * FROM admin_approvals"
        const params: any[] = []
        if (status) {
          query += " WHERE status = $1"
          params.push(status)
        }
        query += " ORDER BY created_at DESC"
        const result = await pool.query(query, params)
        return result.rows
      } catch (error) {
        console.error("Error fetching admin approvals:", error)
        return []
      }
    },
    users: async () => {
      try {
        const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC")
        return result.rows
      } catch (error) {
        console.error("Error fetching users:", error)
        return []
      }
    },
    user: async (_: any, { id }: { id: string }) => {
      try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])
        return result.rows[0]
      } catch (error) {
        console.error("Error fetching user:", error)
        return null
      }
    },
    employees: async (_: any, { locationId }: { locationId?: string }) => {
      try {
        let query = `
          SELECT e.*, l.name as location_name, l.address as location_address 
          FROM employees e 
          LEFT JOIN locations l ON e.location_id = l.id
        `
        let params: any[] = []

        if (locationId) {
          query += " WHERE e.location_id = $1"
          params = [locationId]
        }

        query += " ORDER BY e.created_at DESC"

        const result = await pool.query(query, params)
        return result.rows.map((row) => ({
          ...row,
          location: row.location_name
            ? {
                id: row.location_id,
                name: row.location_name,
                address: row.location_address,
              }
            : null,
          profile: {
            first_name: row.prenom,
            last_name: row.nom,
            phone: row.telephone,
            address: null,
          },
        }))
      } catch (error) {
        console.error("Error fetching employees:", error)
        return []
      }
    },
    employee: async (_: any, { id }: { id: string }) => {
      try {
        const result = await pool.query(
          `
          SELECT e.*, l.name as location_name, l.address as location_address 
          FROM employees e 
          LEFT JOIN locations l ON e.location_id = l.id 
          WHERE e.id = $1
        `,
          [id],
        )

        if (result.rows.length === 0) return null

        const row = result.rows[0]
        return {
          ...row,
          location: row.location_name
            ? {
                id: row.location_id,
                name: row.location_name,
                address: row.location_address,
              }
            : null,
          profile: {
            first_name: row.prenom,
            last_name: row.nom,
            phone: row.telephone,
            address: null,
          },
        }
      } catch (error) {
        console.error("Error fetching employee:", error)
        return null
      }
    },
    locations: async () => {
      try {
        // First get all locations
        const locationsResult = await pool.query("SELECT * FROM locations ORDER BY name")
        const locations = locationsResult.rows

        // For each location, get employees and manager info
        const locationsWithDetails = await Promise.all(
          locations.map(async (location) => {
            // Get employees for this location
            const employeesResult = await pool.query(
              "SELECT id, nom, prenom, email, telephone, job_title, status, salaire FROM employees WHERE location_id = $1",
              [location.id],
            )

            // Get manager info
            const managerResult = await pool.query(
              "SELECT id, nom, prenom, email FROM employees WHERE location_id = $1 AND job_title LIKE '%manager%' LIMIT 1",
              [location.id],
            )

            const manager = managerResult.rows[0]
              ? {
                  id: managerResult.rows[0].id,
                  profile: {
                    first_name: managerResult.rows[0].prenom,
                    last_name: managerResult.rows[0].nom,
                  },
                }
              : null

            return {
              ...location,
              employees: employeesResult.rows.map((emp) => ({
                ...emp,
                profile: {
                  first_name: emp.prenom,
                  last_name: emp.nom,
                  phone: emp.telephone,
                },
              })),
              manager,
            }
          }),
        )

        return locationsWithDetails
      } catch (error) {
        console.error("Error fetching locations:", error)
        return []
      }
    },
    location: async (_: any, { id }: { id: string }) => {
      try {
        const locationResult = await pool.query("SELECT * FROM locations WHERE id = $1", [id])
        if (locationResult.rows.length === 0) return null

        const location = locationResult.rows[0]

        // Get employees for this location
        const employeesResult = await pool.query(
          "SELECT id, nom, prenom, email, telephone, job_title, status, salaire, created_at FROM employees WHERE location_id = $1",
          [id],
        )

        // Get manager info
        const managerResult = await pool.query(
          "SELECT id, nom, prenom, email FROM employees WHERE location_id = $1 AND job_title LIKE '%manager%' LIMIT 1",
          [id],
        )

        const manager = managerResult.rows[0]
          ? {
              id: managerResult.rows[0].id,
              profile: {
                first_name: managerResult.rows[0].prenom,
                last_name: managerResult.rows[0].nom,
              },
            }
          : null

        return {
          ...location,
          employees: employeesResult.rows.map((emp) => ({
            ...emp,
            profile: {
              first_name: emp.prenom,
              last_name: emp.nom,
              phone: emp.telephone,
            },
          })),
          manager,
        }
      } catch (error) {
        console.error("Error fetching location:", error)
        return null
      }
    },
    workSchedules: async (_: any, { employee_id, date }: { employee_id?: string; date?: string }) => {
      try {
        let query = `
          SELECT ws.*, e.nom, e.prenom 
          FROM work_schedules ws 
          LEFT JOIN employees e ON ws.employee_id = e.id
        `
        const params: any[] = []
        const conditions: string[] = []

        if (employee_id) {
          conditions.push(`ws.employee_id = $${params.length + 1}`)
          params.push(employee_id)
        }

        if (date) {
          conditions.push(`ws.date = $${params.length + 1}`)
          params.push(date)
        }

        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ")
        }

        query += " ORDER BY ws.date DESC, ws.created_at DESC"

        const result = await pool.query(query, params)
        return result.rows.map((row) => ({
          ...row,
          employee: row.nom
            ? {
                id: row.employee_id,
                nom: row.nom,
                prenom: row.prenom,
              }
            : null,
        }))
      } catch (error) {
        console.error("Error fetching work schedules:", error)
        return []
      }
    },
    contracts: async (_: any, { employee_id }: { employee_id?: string }) => {
      try {
        let query = `
          SELECT c.*, e.nom, e.prenom 
          FROM contracts c 
          LEFT JOIN employees e ON c.employee_id = e.id
        `
        let params: any[] = []

        if (employee_id) {
          query += " WHERE c.employee_id = $1"
          params = [employee_id]
        }

        query += " ORDER BY c.created_at DESC"

        const result = await pool.query(query, params)
        return result.rows.map((row) => ({
          ...row,
          documents: row.documents || [],
          employee: row.nom
            ? {
                id: row.employee_id,
                nom: row.nom,
                prenom: row.prenom,
                profile: {
                  first_name: row.prenom,
                  last_name: row.nom,
                },
              }
            : null,
        }))
      } catch (error) {
        console.error("Error fetching contracts:", error)
        return []
      }
    },
    leaveRequests: async (_: any, { employee_id, status }: { employee_id?: string; status?: string }) => {
      try {
        let query = `
          SELECT lr.*, e.nom, e.prenom 
          FROM leave_requests lr 
          LEFT JOIN employees e ON lr.employee_id = e.id
        `
        const params: any[] = []
        const conditions: string[] = []

        if (employee_id) {
          conditions.push(`lr.employee_id = $${params.length + 1}`)
          params.push(employee_id)
        }

        if (status) {
          conditions.push(`lr.status = $${params.length + 1}`)
          params.push(status)
        }

        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ")
        }

        query += " ORDER BY lr.created_at DESC"

        const result = await pool.query(query, params)
        return result.rows.map((row) => ({
          ...row,
          employee: row.nom
            ? {
                id: row.employee_id,
                nom: row.nom,
                prenom: row.prenom,
                profile: {
                  first_name: row.prenom,
                  last_name: row.nom,
                },
              }
            : null,
        }))
      } catch (error) {
        console.error("Error fetching leave requests:", error)
        return []
      }
    },
    timeEntries: async (
      _: any,
      { employeeId, startDate, endDate }: { employeeId: string; startDate?: string; endDate?: string },
    ) => {
      try {
        let query = `
          SELECT te.*, l.name as location_name 
          FROM time_entries te 
          LEFT JOIN locations l ON te.location_id = l.id 
          WHERE te.employee_id = $1
        `
        const params: any[] = [employeeId]

        if (startDate && endDate) {
          query += " AND te.date BETWEEN $2 AND $3"
          params.push(startDate, endDate)
        }

        query += " ORDER BY te.date DESC"

        const result = await pool.query(query, params)
        return result.rows.map((row) => ({
          ...row,
          location: row.location_name
            ? {
                id: row.location_id,
                name: row.location_name,
              }
            : null,
        }))
      } catch (error) {
        console.error("Error fetching time entries:", error)
        return []
      }
    },
    dashboardStats: async (_: any, { userId, role }: { userId: string; role: string }) => {
      try {
        // Total employees
        const totalEmployeesResult = await pool.query("SELECT COUNT(*) FROM employees")
        const totalEmployees = parseInt(totalEmployeesResult.rows[0].count, 10)

        // Active employees
        const activeEmployeesResult = await pool.query("SELECT COUNT(*) FROM employees WHERE status = 'active'")
        const activeEmployees = parseInt(activeEmployeesResult.rows[0].count, 10)

        // Pending leave requests
        const pendingRequestsResult = await pool.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'")
        const pendingRequests = parseInt(pendingRequestsResult.rows[0].count, 10)

        // Monthly hours (from time_entries)
        const monthlyHoursResult = await pool.query(
          "SELECT SUM(total_hours) as sum_hours FROM time_entries WHERE date >= date_trunc('month', CURRENT_DATE)"
        )
        const monthlyHours = parseFloat(monthlyHoursResult.rows[0].sum_hours) || 0

        // Weekly hours (from time_entries)
        const weeklyHoursResult = await pool.query(
          "SELECT SUM(total_hours) as sum_hours FROM time_entries WHERE date >= date_trunc('week', CURRENT_DATE)"
        )
        const weeklyHours = parseFloat(weeklyHoursResult.rows[0].sum_hours) || 0

        // Total hours (all time_entries)
        const totalHoursResult = await pool.query("SELECT SUM(total_hours) as sum_hours FROM time_entries")
        const totalHours = parseFloat(totalHoursResult.rows[0].sum_hours) || 0

        // Estimated salary (sum of active contracts)
        const estimatedSalaryResult = await pool.query(
          "SELECT SUM(salary) as sum_salary FROM contracts WHERE status = 'active'"
        )
        const estimatedSalary = parseFloat(estimatedSalaryResult.rows[0].sum_salary) || 0

        // Hourly rate (average from contracts)
        const hourlyRateResult = await pool.query(
          "SELECT AVG(salary/160) as avg_hourly FROM contracts WHERE status = 'active'"
        )
        const hourlyRate = parseFloat(hourlyRateResult.rows[0].avg_hourly) || 0

        // Remaining leave: For each active employee, 15 - SUM(days_count) for approved/pending requests, then sum
        const remainingLeaveResult = await pool.query(`
          SELECT SUM(remaining) as total_remaining FROM (
            SELECT 15 - COALESCE(SUM(days_count),0) AS remaining
            FROM employees e
            LEFT JOIN leave_requests lr ON lr.employee_id = e.id AND lr.status IN ('pending','manager_approved','admin_approved')
            WHERE e.status = 'active'
            GROUP BY e.id
          ) sub
        `)
        const remainingLeave = parseInt(remainingLeaveResult.rows[0].total_remaining, 10) || 0

        // Monthly revenue (sum of salaries for current month)
        const monthlyRevenueResult = await pool.query(
          "SELECT SUM(salary) as revenue FROM contracts WHERE start_date >= date_trunc('month', CURRENT_DATE)"
        )
        const monthlyRevenue = parseFloat(monthlyRevenueResult.rows[0].revenue) || 0

        // Revenue growth (compare current month to previous month)
        const prevMonthRevenueResult = await pool.query(
          "SELECT SUM(salary) as revenue FROM contracts WHERE start_date >= date_trunc('month', CURRENT_DATE - interval '1 month') AND start_date < date_trunc('month', CURRENT_DATE)"
        )
        const prevMonthRevenue = parseFloat(prevMonthRevenueResult.rows[0].revenue) || 0
        const revenueGrowth = prevMonthRevenue > 0 ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

        // Recent activity (last 5 leave requests and employees)
        const recentEmployeesResult = await pool.query(
          "SELECT nom, prenom, created_at FROM employees ORDER BY created_at DESC LIMIT 3"
        )
        const recentLeaveRequestsResult = await pool.query(
          "SELECT type, reason, created_at FROM leave_requests ORDER BY created_at DESC LIMIT 2"
        )
        const recentActivity = [
          ...recentEmployeesResult.rows.map((row) => ({
            title: "Nouvel employé ajouté",
            description: `${row.prenom} ${row.nom}`,
            time: row.created_at,
            type: "employee",
          })),
          ...recentLeaveRequestsResult.rows.map((row) => ({
            title: `Demande de congé (${row.type})`,
            description: row.reason || "--",
            time: row.created_at,
            type: "leave_request",
          })),
        ]

        return {
          monthlyHours,
          weeklyHours,
          estimatedSalary,
          hourlyRate,
          remainingLeave,
          activeEmployees,
          totalEmployees,
          totalHours,
          pendingRequests,
          monthlyRevenue,
          revenueGrowth,
          recentActivity,
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return null
      }
    },
  },
  Mutation: {
    createManagerWorkSchedule: async (_: any, args: any) => {
      try {
        const { employee_id, shift_type, job_position, start_time, end_time, date, is_working } = args
        const result = await pool.query(
          "INSERT INTO manager_work_schedules (employee_id, shift_type, job_position, start_time, end_time, date, is_working) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [employee_id, shift_type, job_position, start_time, end_time, date, is_working]
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error creating manager work schedule:", error)
        throw new Error("Failed to create manager work schedule")
      }
    },
    sendApprovalRequest: async (_: any, args: any) => {
      try {
        const { type, reference_id, manager_id, data } = args
        await pool.query(
          "INSERT INTO admin_approvals (type, reference_id, manager_id, data) VALUES ($1, $2, $3, $4)",
          [type, reference_id, manager_id, data]
        )
        return true
      } catch (error) {
        console.error("Error sending approval request:", error)
        return false
      }
    },
    approveManagerSchedule: async (_: any, { approval_id }: any) => {
      try {
        // Get approval data
        const approvalRes = await pool.query("SELECT * FROM admin_approvals WHERE id = $1", [approval_id])
        if (!approvalRes.rows.length) return false
        const { reference_id, data } = approvalRes.rows[0]
        const scheduleRes = await pool.query("SELECT * FROM manager_work_schedules WHERE id = $1", [reference_id])
        if (!scheduleRes.rows.length) return false
        // Move to main work_schedules
        const s = scheduleRes.rows[0]
        await pool.query(
          "INSERT INTO work_schedules (employee_id, shift_type, job_position, start_time, end_time, date, is_working) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [s.employee_id, s.shift_type, s.job_position, s.start_time, s.end_time, s.date, s.is_working]
        )
        // Update approval status
        await pool.query("UPDATE admin_approvals SET status = 'approved', reviewed_at = NOW() WHERE id = $1", [approval_id])
        // Remove from temp table
        await pool.query("DELETE FROM manager_work_schedules WHERE id = $1", [reference_id])
        return true
      } catch (error) {
        console.error("Error approving manager schedule:", error)
        return false
      }
    },
    rejectManagerSchedule: async (_: any, { approval_id }: any) => {
      try {
        await pool.query("UPDATE admin_approvals SET status = 'rejected', reviewed_at = NOW() WHERE id = $1", [approval_id])
        return true
      } catch (error) {
        console.error("Error rejecting manager schedule:", error)
        return false
      }
    },
    createManagerWorkSchedule: async (_: any, args: any) => {
      try {
        const { employee_id, shift_type, job_position, start_time, end_time, date, is_working } = args
        const result = await pool.query(
          "INSERT INTO manager_work_schedules (employee_id, shift_type, job_position, start_time, end_time, date, is_working) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [employee_id, shift_type, job_position, start_time, end_time, date, is_working]
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error creating manager work schedule:", error)
        throw new Error("Failed to create manager work schedule")
      }
    },
    sendApprovalRequest: async (_: any, args: any) => {
      try {
        const { type, reference_id, manager_id, data } = args
        await pool.query(
          "INSERT INTO admin_approvals (type, reference_id, manager_id, data) VALUES ($1, $2, $3, $4)",
          [type, reference_id, manager_id, data]
        )
        return true
      } catch (error) {
        console.error("Error sending approval request:", error)
        return false
      }
    },
    approveScheduleChange: async (_: any, { approval_id }: { approval_id: string }) => {
      try {
        // Get approval data
        const approvalRes = await pool.query("SELECT * FROM admin_approvals WHERE id = $1 AND status = 'pending'", [approval_id])
        if (!approvalRes.rows.length) return false
        const approval = approvalRes.rows[0]
        // Parse JSON data
        let schedule
        try {
          schedule = JSON.parse(approval.data)
        } catch (e) {
          return false
        }
        // Insert into work_schedules
        await pool.query(
          "INSERT INTO work_schedules (employee_id, date, start_time, end_time, shift_type, job_position, is_working) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [schedule.employee_id, schedule.date, schedule.start_time, schedule.end_time, schedule.shift_type, schedule.job_position, schedule.is_working]
        )
        // Update approval status
        await pool.query("UPDATE admin_approvals SET status = 'approved', reviewed_at = NOW() WHERE id = $1", [approval_id])
        return true
      } catch (error) {
        console.error("Error approving schedule change:", error)
        return false
      }
    },
    rejectScheduleChange: async (_: any, { approval_id, comment }: { approval_id: string; comment?: string }) => {
      try {
        await pool.query("UPDATE admin_approvals SET status = 'rejected', reviewed_at = NOW(), admin_comment = $2 WHERE id = $1", [approval_id, comment || null])
        return true
      } catch (error) {
        console.error("Error rejecting schedule change:", error)
        return false
      }
    },
    login: async (_: any, { username, password }: { username: string; password: string }) => {
      try {
        console.log("Login attempt:", { username, password })
        const result = await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2", [
          username,
          password,
        ])
        console.log("Login result:", result.rows)
        return result.rows[0] || null
      } catch (error) {
        console.error("Error during login:", error)
        throw new Error("Login failed")
      }
    },
    createUser: async (
      _: any,
      {
        username,
        password,
        role,
        employee_id,
      }: { username: string; password: string; role: string; employee_id?: string },
    ) => {
      try {
        const result = await pool.query(
          "INSERT INTO users (username, password, role, employee_id) VALUES ($1, $2, $3, $4) RETURNING *",
          [username, password, role, employee_id],
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error creating user:", error)
        throw new Error("Failed to create user")
      }
    },
    updateEmployee: async (_: any, { id, ...updates }: any) => {
      try {
        const fields = Object.keys(updates).filter((key) => updates[key] !== undefined)
        const values = fields.map((key) => updates[key])

        if (fields.length === 0) {
          throw new Error("No fields to update")
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(", ")
        const query = `UPDATE employees SET ${setClause} WHERE id = $1 RETURNING *`

        const result = await pool.query(query, [id, ...values])

        if (result.rows.length === 0) {
          throw new Error("Employee not found")
        }

        const employee = result.rows[0]
        return {
          ...employee,
          profile: {
            first_name: employee.prenom,
            last_name: employee.nom,
            phone: employee.telephone,
          },
        }
      } catch (error) {
        console.error("Error updating employee:", error)
        throw new Error("Failed to update employee")
      }
    },
    createWorkSchedule: async (_: any, args: any) => {
      try {
        const { employee_id, date, start_time, end_time, shift_type, job_position, is_working } = args
        try {
          const result = await pool.query(
            "INSERT INTO work_schedules (employee_id, date, start_time, end_time, shift_type, job_position, is_working) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [employee_id, date, start_time, end_time, shift_type, job_position, is_working],
          )
          return result.rows[0]
        } catch (error: any) {
          // If duplicate key error, update instead
          if (error.code === '23505') {
            const updateResult = await pool.query(
              "UPDATE work_schedules SET start_time = $1, end_time = $2, shift_type = $3, job_position = $4, is_working = $5 WHERE employee_id = $6 AND date = $7 RETURNING *",
              [start_time, end_time, shift_type, job_position, is_working, employee_id, date]
            )
            return updateResult.rows[0]
          }
          console.error("Error creating work schedule:", error)
          throw new Error("Failed to create work schedule")
        }
      } catch (error) {
        console.error("Error creating work schedule:", error)
        throw new Error("Failed to create work schedule")
      }
    },
    updateWorkSchedule: async (_: any, { id, ...updates }: any) => {
      try {
        const fields = Object.keys(updates).filter((key) => updates[key] !== undefined)
        const values = fields.map((key) => updates[key])

        if (fields.length === 0) {
          throw new Error("No fields to update")
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(", ")
        const query = `UPDATE work_schedules SET ${setClause} WHERE id = $1 RETURNING *`

        const result = await pool.query(query, [id, ...values])
        return result.rows[0]
      } catch (error) {
        console.error("Error updating work schedule:", error)
        throw new Error("Failed to update work schedule")
      }
    },
    createLeaveRequest: async (_: any, args: any) => {
      try {
        const { employee_id, type, start_date, end_date, reason } = args

        // Calculate days count
        const startDate = new Date(start_date)
        const endDate = new Date(end_date)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const days_count = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

        const result = await pool.query(
          "INSERT INTO leave_requests (employee_id, type, start_date, end_date, days_count, reason, status) VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *",
          [employee_id, type, start_date, end_date, days_count, reason],
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error creating leave request:", error)
        throw new Error("Failed to create leave request")
      }
    },
    approveLeaveRequest: async (_: any, { id, status, comment }: { id: string; status: string; comment?: string }) => {
      try {
        const result = await pool.query(
          "UPDATE leave_requests SET status = $1, admin_comment = $2 WHERE id = $3 RETURNING *",
          [status, comment, id],
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error approving leave request:", error)
        throw new Error("Failed to approve leave request")
      }
    },
    createContract: async (_: any, args: any) => {
      try {
        const { employee_id, contract_type, start_date, end_date, salary, tenu_count, documents } = args
        const result = await pool.query(
          "INSERT INTO contracts (employee_id, contract_type, start_date, end_date, salary, tenu_count, documents, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *",
          [employee_id, contract_type, start_date, end_date, salary, tenu_count || 0, documents || []],
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error creating contract:", error)
        throw new Error("Failed to create contract")
      }
    },
    createEmployee: async (_: any, args: any) => {
      try {
        const { username, email, nom, prenom, telephone, job_title, salaire, role, location_id } = args

        // First create the employee
        const employeeResult = await pool.query(
          "INSERT INTO employees (nom, prenom, email, telephone, job_title, salaire, location_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *",
          [nom, prenom, email, telephone, job_title, salaire || 0, location_id],
        )

        const employee = employeeResult.rows[0]

        // Then create the user account
        await pool.query("INSERT INTO users (username, password, role, employee_id) VALUES ($1, $2, $3, $4)", [
          username,
          "password123", // Default password
          role || "employee",
          employee.id,
        ])

        return {
          ...employee,
          profile: {
            first_name: employee.prenom,
            last_name: employee.nom,
            phone: employee.telephone,
          },
        }
      } catch (error) {
        console.error("Error creating employee:", error)
        throw new Error("Failed to create employee")
      }
    },
    deleteEmployee: async (_: any, { id }: { id: string }) => {
      try {
        // Delete user account first
        await pool.query("DELETE FROM users WHERE employee_id = $1", [id])

        // Then delete employee
        const result = await pool.query("DELETE FROM employees WHERE id = $1", [id])
        return result.rowCount > 0
      } catch (error) {
        console.error("Error deleting employee:", error)
        throw new Error("Failed to delete employee")
      }
    },
    clockIn: async (_: any, { employeeId, locationId }: { employeeId: string; locationId: string }) => {
      try {
        const result = await pool.query(
          "INSERT INTO time_entries (employee_id, location_id, clock_in, date, status) VALUES ($1, $2, NOW(), CURRENT_DATE, 'active') RETURNING *",
          [employeeId, locationId],
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error clocking in:", error)
        throw new Error("Failed to clock in")
      }
    },
    clockOut: async (_: any, { timeEntryId }: { timeEntryId: string }) => {
      try {
        const result = await pool.query(
          "UPDATE time_entries SET clock_out = NOW(), status = 'completed', total_hours = EXTRACT(EPOCH FROM (NOW() - clock_in))/3600 WHERE id = $1 RETURNING *",
          [timeEntryId],
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error clocking out:", error)
        throw new Error("Failed to clock out")
      }
    },
  },
}

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (err) => {
    console.error("GraphQL Error:", err)
    return {
      message: err.message,
      locations: err.locations,
      path: err.path,
    }
  },
})

// Create Next.js handler
const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => ({ req, res }),
})

export { handler as GET, handler as POST }
