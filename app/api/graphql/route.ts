import { ApolloServer } from "@apollo/server"
import { startServerAndCreateNextHandler } from "@as-integrations/next"
import { gql } from "graphql-tag"
import { Pool } from "pg"

// Database connection
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_Wf7HhZGIQDX0@ep-curly-tooth-ad2f1fpo-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
})

// Ensure payroll and notifications tables exist
async function ensureTables() {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS payroll_payments (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      period TEXT NOT NULL,
      paid BOOLEAN NOT NULL DEFAULT false,
      paid_at TIMESTAMP,
      amount NUMERIC(10,2),
      hours_worked NUMERIC(10,2),
      CONSTRAINT payroll_payments_employee_period_uniq UNIQUE (employee_id, period)
    );
  `)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payroll_payments_period ON payroll_payments (period);`)

    await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT NOT NULL,
      reference_id TEXT,
      seen BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, seen, created_at DESC);`,
    )
  } catch (e) {
    console.error("Failed to ensure tables:", e)
  }
}
ensureTables().catch(console.error)

// Utility
async function logRecentActivity({
  title,
  description,
  type,
  urgent = false,
}: { title: string; description?: string; type: string; urgent?: boolean }) {
  try {
    await pool.query(`INSERT INTO recent_activities (title, description, type, urgent) VALUES ($1, $2, $3, $4)`, [
      title,
      description,
      type,
      urgent,
    ])
  } catch (err) {
    console.error("Failed to log recent activity:", err)
  }
}

async function createNotification({
  user_id,
  role,
  title,
  message,
  type,
  reference_id,
}: {
  user_id: number
  role: string
  title: string
  message?: string
  type: string
  reference_id?: string | number
}) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, role, title, message, type, reference_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, role, title, message ?? null, type, reference_id != null ? String(reference_id) : null],
    )
  } catch (e) {
    console.error("Failed to create notification:", e)
  }
}

// ---- Helpers ----
function fmtMoney(value: any) {
  if (value === null || value === undefined || value === "") return "—"
  const num = Number(value)
  if (Number.isNaN(num)) return "—"
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num) + " DT"
  )
}

function fmtInt(value: any) {
  if (value === null || value === undefined || value === "") return "—"
  return String(value)
}

function arrow(oldVal: string, newVal: string) {
  return `${oldVal} → ${newVal}`
}

async function getLocationNames(oldId?: any, newId?: any) {
  const ids = [oldId, newId].filter(Boolean)
  if (ids.length === 0) {
    return { oldName: "—", newName: "—" }
  }
  const res = await pool.query("SELECT id, name FROM locations WHERE id = ANY($1)", [ids])
  const map = Object.fromEntries(res.rows.map((r: any) => [String(r.id), r.name]))
  const oldName = oldId ? map[String(oldId)] || String(oldId) : "—"
  const newName = newId ? map[String(newId)] || String(newId) : "—"
  return { oldName, newName }
}

function firstAndLastDateOfMonth(ym: string): { start: string; end: string } {
  // ym is "YYYY-MM"
  const first = new Date(`${ym}-01T00:00:00`)
  const last = new Date(first)
  last.setMonth(last.getMonth() + 1)
  last.setDate(0)
  const start = first.toISOString().slice(0, 10)
  const end = last.toISOString().slice(0, 10)
  return { start, end }
}

// Extend schema minimally: add notifyPlanningForEmployee mutation
const typeDefs = gql`
type RecentActivity {
  id: ID!
  title: String!
  description: String
  type: String!
  urgent: Boolean
  created_at: String!
}

type User {
  id: ID!
  username: String!
  password: String!
  role: String!
  employee_id: String
  location_id: String
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
  avance: Float
  tenu_de_travail: Int
  status: String!
  role: String
  created_at: String
  price_h: Float
  location: Location
  profile: Profile
  user: User
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

type PayrollPayment {
  id: ID!
  employee_id: ID!
  period: String!
  paid: Boolean!
  paid_at: String
  amount: Float
  hours_worked: Float
}

type Notification {
  id: ID!
  user_id: ID!
  role: String!
  title: String!
  message: String
  type: String!
  reference_id: String
  seen: Boolean!
  created_at: String!
}

type Query {
  recentActivities(limit: Int): [RecentActivity!]!
  users: [User!]!
  user(id: ID!): User
  employees(locationId: ID): [Employee!]!
  employee(id: ID!): Employee
  locations: [Location!]!
  location(id: ID!): Location
  workSchedules(employee_id: ID, date: String): [WorkSchedule!]!
  workSchedulesRange(employee_id: ID!, start: String!, end: String!): [WorkSchedule!]!
  contracts(employee_id: ID): [Contract!]!
  leaveRequests(employee_id: ID, status: String): [LeaveRequest!]!
  timeEntries(employeeId: ID!, startDate: String, endDate: String): [TimeEntry!]!
  payrollPayments(period: String!): [PayrollPayment!]!
  payrollPayment(employee_id: ID!, period: String!): PayrollPayment
  dashboardStats(userId: ID!, role: String!): DashboardStats
  adminApprovals(status: String): [AdminApproval!]!
  notifications(user_id: ID!, role: String, only_unseen: Boolean): [Notification!]!
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
    avance: Float
    tenu_de_travail: Int
    status: String
    price_h: Float
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
    price_h: Float
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
  paySalary(employee_id: ID!, period: String!): PayrollPayment!

  markNotificationSeen(id: ID!): Boolean!
  markAllNotificationsSeen(user_id: ID!): Boolean!
  notifyPlanningForEmployee(employee_id: ID!, month: String!): Boolean!
}
`

// Compose resolvers by extending your previous ones:
const resolvers = {
  Query: {
    recentActivities: async (_: any, { limit = 10 }: { limit?: number } = {}) => {
      try {
        const result = await pool.query(
          `SELECT id, title, description, type, urgent, created_at
         FROM recent_activities
         ORDER BY created_at DESC
         LIMIT $1`,
          [limit],
        )
        return result.rows
      } catch (error) {
        console.error("Error fetching recent activities:", error)
        return []
      }
    },
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
        const params: any[] = []
        if (locationId) {
          query += " WHERE e.location_id = $1"
          params.push(locationId)
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
        const locationsResult = await pool.query("SELECT * FROM locations ORDER BY name")
        const locations = locationsResult.rows
        const locationsWithDetails = await Promise.all(
          locations.map(async (location) => {
            const employeesResult = await pool.query(
              "SELECT id, nom, prenom, email, telephone, job_title, status, salaire FROM employees WHERE location_id = $1",
              [location.id],
            )
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
        const employeesResult = await pool.query(
          "SELECT id, nom, prenom, email, telephone, job_title, status, salaire, created_at FROM employees WHERE location_id = $1",
          [id],
        )
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
    workSchedulesRange: async (
      _: any,
      { employee_id, start, end }: { employee_id: string; start: string; end: string },
    ) => {
      try {
        const result = await pool.query(
          `
          SELECT ws.*, e.nom, e.prenom
          FROM work_schedules ws
          LEFT JOIN employees e ON ws.employee_id = e.id
          WHERE ws.employee_id = $1 AND ws.date BETWEEN $2 AND $3
          ORDER BY ws.date ASC
        `,
          [employee_id, start, end],
        )
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
        console.error("Error fetching work schedules range:", error)
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
        const params: any[] = []
        if (employee_id) {
          query += " WHERE c.employee_id = $1"
          params.push(employee_id)
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
        query += " ORDER BY te.date ASC"
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
    payrollPayments: async (_: any, { period }: { period: string }) => {
      try {
        const res = await pool.query(
          "SELECT id, employee_id, period, paid, paid_at, amount, hours_worked FROM payroll_payments WHERE period = $1",
          [period],
        )
        return res.rows
      } catch (e) {
        console.error("Error fetching payrollPayments:", e)
        return []
      }
    },
    payrollPayment: async (_: any, { employee_id, period }: { employee_id: string; period: string }) => {
      try {
        const res = await pool.query(
          "SELECT id, employee_id, period, paid, paid_at, amount, hours_worked FROM payroll_payments WHERE employee_id = $1 AND period = $2",
          [employee_id, period],
        )
        return res.rows[0] || null
      } catch (e) {
        console.error("Error fetching payrollPayment:", e)
        return null
      }
    },
    dashboardStats: async (_: any, { userId, role }: { userId: string; role: string }) => {
      try {
        const totalEmployeesResult = await pool.query("SELECT COUNT(*) FROM employees")
        const totalEmployees = Number.parseInt(totalEmployeesResult.rows[0].count, 10)
        const activeEmployeesResult = await pool.query("SELECT COUNT(*) FROM employees WHERE status = 'active'")
        const activeEmployees = Number.parseInt(activeEmployeesResult.rows[0].count, 10)
        const pendingRequestsResult = await pool.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'")
        const pendingRequests = Number.parseInt(pendingRequestsResult.rows[0].count, 10)
        const monthlyHoursResult = await pool.query(
          "SELECT SUM(total_hours) as sum_hours FROM time_entries WHERE date >= date_trunc('month', CURRENT_DATE)",
        )
        const monthlyHours = Number.parseFloat(monthlyHoursResult.rows[0].sum_hours) || 0
        const weeklyHoursResult = await pool.query(
          "SELECT SUM(total_hours) as sum_hours FROM time_entries WHERE date >= date_trunc('week', CURRENT_DATE)",
        )
        const weeklyHours = Number.parseFloat(weeklyHoursResult.rows[0].sum_hours) || 0
        const totalHoursResult = await pool.query("SELECT SUM(total_hours) as sum_hours FROM time_entries")
        const totalHours = Number.parseFloat(totalHoursResult.rows[0].sum_hours) || 0
        const estimatedSalaryResult = await pool.query(
          "SELECT SUM(salary) as sum_salary FROM contracts WHERE status = 'active'",
        )
        const estimatedSalary = Number.parseFloat(estimatedSalaryResult.rows[0].sum_salary) || 0
        const hourlyRateResult = await pool.query(
          "SELECT AVG(salary/160) as avg_hourly FROM contracts WHERE status = 'active'",
        )
        const hourlyRate = Number.parseFloat(hourlyRateResult.rows[0].avg_hourly) || 0
        const remainingLeaveResult = await pool.query(`
        SELECT SUM(remaining) as total_remaining FROM (
          SELECT 15 - COALESCE(SUM(days_count),0) AS remaining
          FROM employees e
          LEFT JOIN leave_requests lr ON lr.employee_id = e.id AND lr.status IN ('pending','manager_approved','admin_approved')
          WHERE e.status = 'active'
          GROUP BY e.id
        ) sub
      `)
        const remainingLeave = Number.parseInt(remainingLeaveResult.rows[0].total_remaining, 10) || 0
        const monthlyRevenueResult = await pool.query(
          "SELECT SUM(salary) as revenue FROM contracts WHERE start_date >= date_trunc('month', CURRENT_DATE)",
        )
        const monthlyRevenue = Number.parseFloat(monthlyRevenueResult.rows[0].revenue) || 0
        const prevMonthRevenueResult = await pool.query(
          "SELECT SUM(salary) as revenue FROM contracts WHERE start_date >= date_trunc('month', CURRENT_DATE - interval '1 month') AND start_date < date_trunc('month', CURRENT_DATE)",
        )
        const prevMonthRevenue = Number.parseFloat(prevMonthRevenueResult.rows[0].revenue) || 0
        const revenueGrowth = prevMonthRevenue > 0 ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

        const recentEmployeesResult = await pool.query(
          "SELECT nom, prenom, created_at FROM employees ORDER BY created_at DESC LIMIT 3",
        )
        const recentLeaveRequestsResult = await pool.query(
          "SELECT type, reason, created_at FROM leave_requests ORDER BY created_at DESC LIMIT 2",
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
    notifications: async (_: any, { user_id, only_unseen }: { user_id: string; only_unseen?: boolean }) => {
      try {
        let q = `SELECT * FROM notifications WHERE user_id = $1`
        const params: any[] = [user_id]
        if (only_unseen === true) {
          q += ` AND seen = false`
        }
        q += ` ORDER BY created_at DESC LIMIT 100`
        const res = await pool.query(q, params)
        return res.rows
      } catch (e) {
        console.error("Error fetching notifications:", e)
        return []
      }
    },
  },
  Mutation: {
    createManagerWorkSchedule: async (_: any, args: any) => {
      try {
        const { employee_id, shift_type, job_position, start_time, end_time, date, is_working } = args
        const result = await pool.query(
          "INSERT INTO manager_work_schedules (employee_id, shift_type, job_position, start_time, end_time, date, is_working) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [employee_id, shift_type, job_position, start_time, end_time, date, is_working],
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
        await pool.query("INSERT INTO admin_approvals (type, reference_id, manager_id, data) VALUES ($1, $2, $3, $4)", [
          type,
          reference_id,
          manager_id,
          data,
        ])
        return true
      } catch (error) {
        console.error("Error sending approval request:", error)
        return false
      }
    },
    approveManagerSchedule: async (_: any, { approval_id }: any) => {
      try {
        const approvalRes = await pool.query("SELECT * FROM admin_approvals WHERE id = $1", [approval_id])
        if (!approvalRes.rows.length) return false
        const { reference_id, data: raw } = approvalRes.rows[0]
        const scheduleRes = await pool.query("SELECT * FROM manager_work_schedules WHERE id = $1", [reference_id])
        if (!scheduleRes.rows.length) return false

        const s = scheduleRes.rows[0]
        await pool.query(
          "INSERT INTO work_schedules (employee_id, shift_type, job_position, start_time, end_time, date, is_working) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [s.employee_id, s.shift_type, s.job_position, s.start_time, s.end_time, s.date, s.is_working],
        )
        await pool.query("UPDATE admin_approvals SET status = 'approved', reviewed_at = NOW() WHERE id = $1", [
          approval_id,
        ])
        await pool.query("DELETE FROM manager_work_schedules WHERE id = $1", [reference_id])

        // Notify employee and their manager
        const empUserRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [s.employee_id])
        const empUser = empUserRes.rows[0]
        const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [s.employee_id])
        const location_id = empRes.rows[0]?.location_id
        const mgrEmpRes = await pool.query(
          "SELECT id FROM employees WHERE location_id = $1 AND job_title ILIKE '%manager%' LIMIT 1",
          [location_id],
        )
        const mgrEmp = mgrEmpRes.rows[0]
        const mgrUserRes = mgrEmp
          ? await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [mgrEmp.id])
          : { rows: [] as any[] }
        const mgrUser = mgrUserRes.rows[0]

        const schedule =
          typeof raw === "string"
            ? (() => {
                try {
                  return JSON.parse(raw)
                } catch {
                  return s
                }
              })()
            : s
        const title = "📅 Planning approuvé"
        const message = `Votre planning du ${schedule?.date ?? s.date} a été mis à jour.`
        if (empUser)
          await createNotification({
            user_id: empUser.id,
            role: "employee",
            title,
            message,
            type: "schedule_change",
            reference_id: approval_id,
          })
        if (mgrUser)
          await createNotification({
            user_id: mgrUser.id,
            role: "manager",
            title,
            message: "Planning d'un employé mis à jour.",
            type: "schedule_change",
            reference_id: approval_id,
          })

        return true
      } catch (error) {
        console.error("Error approving manager schedule:", error)
        return false
      }
    },
    rejectManagerSchedule: async (_: any, { approval_id }: any) => {
      try {
        await pool.query("UPDATE admin_approvals SET status = 'rejected', reviewed_at = NOW() WHERE id = $1", [
          approval_id,
        ])
        return true
      } catch (error) {
        console.error("Error rejecting manager schedule:", error)
        return false
      }
    },
    approveScheduleChange: async (_: any, { approval_id }: { approval_id: string }) => {
      try {
        const approvalRes = await pool.query("SELECT * FROM admin_approvals WHERE id = $1 AND status = 'pending'", [
          approval_id,
        ])
        if (!approvalRes.rows.length) return false
        const approval = approvalRes.rows[0]

        let schedule: any
        try {
          schedule = JSON.parse(approval.data)
        } catch {
          return false
        }

        await pool.query(
          "INSERT INTO work_schedules (employee_id, date, start_time, end_time, shift_type, job_position, is_working) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [
            schedule.employee_id,
            schedule.date,
            schedule.start_time,
            schedule.end_time,
            schedule.shift_type,
            schedule.job_position,
            schedule.is_working,
          ],
        )
        await pool.query("UPDATE admin_approvals SET status = 'approved', reviewed_at = NOW() WHERE id = $1", [
          approval_id,
        ])

        // Notify employee and their manager
        const empUserRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [
          schedule.employee_id,
        ])
        const empUser = empUserRes.rows[0]
        const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [schedule.employee_id])
        const location_id = empRes.rows[0]?.location_id
        const mgrEmpRes = await pool.query(
          "SELECT id FROM employees WHERE location_id = $1 AND job_title ILIKE '%manager%' LIMIT 1",
          [location_id],
        )
        const mgrEmp = mgrEmpRes.rows[0]
        const mgrUserRes = mgrEmp
          ? await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [mgrEmp.id])
          : { rows: [] as any[] }
        const mgrUser = mgrUserRes.rows[0]

        const title = "📅 Planning mis à jour"
        const message = `Votre planning du ${schedule.date} a été approuvé.`
        if (empUser)
          await createNotification({
            user_id: empUser.id,
            role: "employee",
            title,
            message,
            type: "schedule_change",
            reference_id: approval_id,
          })
        if (mgrUser)
          await createNotification({
            user_id: mgrUser.id,
            role: "manager",
            title: "Planning employé approuvé",
            message: `Changement du ${schedule.date} approuvé.`,
            type: "schedule_change",
            reference_id: approval_id,
          })

        return true
      } catch (error) {
        console.error("Error approving schedule change:", error)
        return false
      }
    },
    rejectScheduleChange: async (_: any, { approval_id, comment }: { approval_id: string; comment?: string }) => {
      try {
        const approvalRes = await pool.query("SELECT * FROM admin_approvals WHERE id = $1 AND status = 'pending'", [
          approval_id,
        ])
        if (!approvalRes.rows.length) return false
        const approval = approvalRes.rows[0]
        await pool.query(
          "UPDATE admin_approvals SET status = 'rejected', reviewed_at = NOW(), admin_comment = $2 WHERE id = $1",
          [approval_id, comment || null],
        )

        // Inform employee and manager (parsed data has employee_id)
        let schedule: any
        try {
          schedule = JSON.parse(approval.data)
        } catch {
          schedule = null
        }
        if (schedule?.employee_id) {
          const empUserRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [
            schedule.employee_id,
          ])
          const empUser = empUserRes.rows[0]
          const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [schedule.employee_id])
          const location_id = empRes.rows[0]?.location_id
          const mgrEmpRes = await pool.query(
            "SELECT id FROM employees WHERE location_id = $1 AND job_title ILIKE '%manager%' LIMIT 1",
            [location_id],
          )
          const mgrEmp = mgrEmpRes.rows[0]
          const mgrUserRes = mgrEmp
            ? await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [mgrEmp.id])
            : { rows: [] as any[] }
          const mgrUser = mgrUserRes.rows[0]

          const title = "❌ Changement de planning rejeté"
          const message = comment ? `Raison: ${comment}` : "Veuillez contacter votre manager."
          if (empUser)
            await createNotification({
              user_id: empUser.id,
              role: "employee",
              title,
              message,
              type: "schedule_change",
              reference_id: approval_id,
            })
          if (mgrUser)
            await createNotification({
              user_id: mgrUser.id,
              role: "manager",
              title: "Rejet de planning",
              message,
              type: "schedule_change",
              reference_id: approval_id,
            })
        }

        return true
      } catch (error) {
        console.error("Error rejecting schedule change:", error)
        return false
      }
    },
    login: async (_: any, { username, password }: { username: string; password: string }) => {
      try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2", [
          username,
          password,
        ])
        const user = result.rows[0]
        if (!user) return null

        let location_id = null
        if (user.employee_id) {
          const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [user.employee_id])
          if (empRes.rows.length > 0) {
            location_id = empRes.rows[0].location_id
          }
        }

        return { ...user, location_id: location_id || user.location_id || null }
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
        const beforeRes = await pool.query("SELECT * FROM employees WHERE id = $1", [id])
        if (beforeRes.rows.length === 0) throw new Error("Employee not found")
        const before = beforeRes.rows[0]

        const fields = Object.keys(updates).filter((key) => updates[key] !== undefined)
        const values = fields.map((key) => updates[key])
        if (fields.length === 0) throw new Error("No fields to update")

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(", ")
        const query = `UPDATE employees SET ${setClause} WHERE id = $1 RETURNING *`

        const result = await pool.query(query, [id, ...values])
        if (result.rows.length === 0) throw new Error("Employee not found after update")
        const employee = result.rows[0]

        const actuallyChanged = fields.filter((f) => String(before[f] ?? "") !== String(employee[f] ?? ""))

        const changes: string[] = []
        for (const field of actuallyChanged) {
          switch (field) {
            case "salaire":
              changes.push(`Salaire: ${arrow(fmtMoney(before.salaire), fmtMoney(employee.salaire))}`)
              break
            case "prime":
              changes.push(`Prime: ${arrow(fmtMoney(before.prime), fmtMoney(employee.prime))}`)
              break
            case "avance":
              changes.push(`Avance: ${arrow(fmtMoney(before.avance), fmtMoney(employee.avance))}`)
              break
            case "infractions":
              changes.push(`Infractions: ${arrow(fmtInt(before.infractions), fmtInt(employee.infractions))}`)
              break
            case "absence":
              changes.push(`Absences: ${arrow(fmtInt(before.absence), fmtInt(employee.absence))}`)
              break
            case "retard":
              changes.push(`Retards: ${arrow(fmtInt(before.retard), fmtInt(employee.retard))}`)
              break
            case "tenu_de_travail":
              changes.push(
                `Tenue de travail: ${arrow(fmtInt(before.tenu_de_travail), fmtInt(employee.tenu_de_travail))}`,
              )
              break
            case "status":
              changes.push(`Statut: ${arrow(String(before.status ?? "—"), String(employee.status ?? "—"))}`)
              break
            case "job_title":
              changes.push(`Poste: ${arrow(String(before.job_title ?? "—"), String(employee.job_title ?? "—"))}`)
              break
            case "location_id": {
              const { oldName, newName } = await getLocationNames(before.location_id, employee.location_id)
              changes.push(`Restaurant: ${arrow(oldName, newName)}`)
              break
            }
            case "price_h":
              changes.push(`Prix/heure: ${arrow(fmtMoney(before.price_h), fmtMoney(employee.price_h))}`)
              break
            default:
              changes.push(`${field}: ${arrow(String(before[field] ?? "—"), String(employee[field] ?? "—"))}`)
          }
        }

        if (changes.length > 0) {
          const summary = changes.join(" • ")
          await logRecentActivity({
            title: "Employé modifié",
            description: `${employee.prenom} ${employee.nom} (${employee.email}) — ${summary}`,
            type: "employee",
            urgent: false,
          })
        }

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
          if (error.code === "23505") {
            const updateResult = await pool.query(
              "UPDATE work_schedules SET start_time = $1, end_time = $2, shift_type = $3, job_position = $4, is_working = $5 WHERE employee_id = $6 AND date = $7 RETURNING *",
              [start_time, end_time, shift_type, job_position, is_working, employee_id, date],
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
          "UPDATE leave_requests SET status = $1, admin_comment = $2, approved_at = NOW() WHERE id = $3 RETURNING *",
          [status, comment || null, id],
        )
        const lr = result.rows[0]

        // Notify employee and manager (location manager)
        if (lr) {
          const empUserRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [lr.employee_id])
          const empUser = empUserRes.rows[0]
          const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [lr.employee_id])
          const location_id = empRes.rows[0]?.location_id
          const mgrEmpRes = await pool.query(
            "SELECT id FROM employees WHERE location_id = $1 AND job_title ILIKE '%manager%' LIMIT 1",
            [location_id],
          )
          const mgrEmp = mgrEmpRes.rows[0]
          const mgrUserRes = mgrEmp
            ? await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [mgrEmp.id])
            : { rows: [] as any[] }
          const mgrUser = mgrUserRes.rows[0]

          const accepted = status === "approved"
          const title = accepted ? "✅ Demande de congé acceptée" : "❌ Demande de congé refusée"
          const message = comment ? `Commentaire: ${comment}` : undefined
          if (empUser)
            await createNotification({
              user_id: empUser.id,
              role: "employee",
              title,
              message,
              type: "leave_request",
              reference_id: id,
            })
          if (mgrUser)
            await createNotification({
              user_id: mgrUser.id,
              role: "manager",
              title: accepted ? "Congé employé accepté" : "Congé employé refusé",
              message,
              type: "leave_request",
              reference_id: id,
            })
        }

        return lr
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
        const { username, email, nom, prenom, telephone, job_title, salaire, role, location_id, price_h } = args
        const employeeResult = await pool.query(
          "INSERT INTO employees (nom, prenom, email, telephone, job_title, salaire, location_id, status, price_h) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8) RETURNING *",
          [nom, prenom, email, telephone, job_title, salaire || 0, location_id, price_h ?? 0],
        )
        const employee = employeeResult.rows[0]

        await pool.query("INSERT INTO users (username, password, role, employee_id) VALUES ($1, $2, $3, $4)", [
          username,
          "password123",
          role || "employee",
          employee.id,
        ])

        await logRecentActivity({
          title: "Nouvel employé ajouté",
          description: `${prenom} ${nom} (${email})`,
          type: "employee",
          urgent: false,
        })

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
        const empRes = await pool.query("SELECT nom, prenom, email FROM employees WHERE id = $1", [id])
        const emp = empRes.rows[0]
        await pool.query("DELETE FROM users WHERE employee_id = $1", [id])
        const result = await pool.query("DELETE FROM employees WHERE id = $1", [id])
        if (result.rowCount > 0 && emp) {
          await logRecentActivity({
            title: "Employé supprimé",
            description: `${emp.prenom} ${emp.nom} (${emp.email})`,
            type: "employee",
            urgent: false,
          })
        }
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
    paySalary: async (_: any, { employee_id, period }: { employee_id: string; period: string }) => {
      try {
        const { start, end } = firstAndLastDateOfMonth(period)

        const hoursRes = await pool.query(
          `
        SELECT COALESCE(SUM(total_hours), 0) AS hours_worked
        FROM time_entries
        WHERE employee_id = $1
          AND status = 'completed'
          AND date BETWEEN $2 AND $3
      `,
          [employee_id, start, end],
        )
        const hours_worked = Number(hoursRes.rows[0]?.hours_worked ?? 0)

        const rateRes = await pool.query("SELECT price_h, nom, prenom, email FROM employees WHERE id = $1", [
          employee_id,
        ])
        const price_h = Number(rateRes.rows[0]?.price_h ?? 0)
        const amount = Math.round(hours_worked * price_h * 100) / 100

        const upsert = await pool.query(
          `INSERT INTO payroll_payments (employee_id, period, paid, paid_at, amount, hours_worked)
         VALUES ($1, $2, true, NOW(), $3, $4)
         ON CONFLICT (employee_id, period)
         DO UPDATE SET paid = EXCLUDED.paid,
                       paid_at = EXCLUDED.paid_at,
                       amount = EXCLUDED.amount,
                       hours_worked = EXCLUDED.hours_worked
         RETURNING id, employee_id, period, paid, paid_at, amount, hours_worked`,
          [employee_id, period, amount, hours_worked],
        )

        await pool.query("UPDATE employees SET prime = NULL, avance = NULL WHERE id = $1", [employee_id])

        try {
          const e = rateRes.rows[0]
          await logRecentActivity({
            title: "Salaire payé",
            description: `${e?.prenom ?? ""} ${e?.nom ?? ""} — Période ${period} • ${hours_worked.toFixed(
              2,
            )}h × ${fmtMoney(price_h)} = ${fmtMoney(amount)}`,
            type: "finance",
            urgent: false,
          })
        } catch (e) {
          console.error("Failed to log payment activity:", e)
        }

        return upsert.rows[0]
      } catch (e) {
        console.error("Error in paySalary:", e)
        throw new Error("Failed to mark salary as paid")
      }
    },
    markNotificationSeen: async (_: any, { id }: { id: string }) => {
      try {
        await pool.query("UPDATE notifications SET seen = true WHERE id = $1", [id])
        return true
      } catch (e) {
        console.error("Failed to mark notification seen:", e)
        return false
      }
    },
    markAllNotificationsSeen: async (_: any, { user_id }: { user_id: string }) => {
      try {
        await pool.query("UPDATE notifications SET seen = true WHERE user_id = $1", [user_id])
        return true
      } catch (e) {
        console.error("Failed to mark all notifications seen:", e)
        return false
      }
    },
    notifyPlanningForEmployee: async (_: any, { employee_id, month }: { employee_id: string; month: string }) => {
      try {
        // find user_id for employee
        const userRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [employee_id])
        const user = userRes.rows[0]
        if (!user) return false
        await createNotification({
          user_id: user.id,
          role: "employee",
          title: "📅 Planning mis à jour",
          message: `Votre planning de ${month} est disponible.`,
          type: "planning",
          reference_id: month,
        })
        return true
      } catch (e) {
        console.error("notifyPlanningForEmployee failed:", e)
        return false
      }
    },
  },
  Employee: {
    user: async (parent: any) => {
      try {
        const res = await pool.query("SELECT * FROM users WHERE employee_id = $1 LIMIT 1", [parent.id])
        return res.rows[0] || null
      } catch (e) {
        console.error("Employee.user resolver failed:", e)
        return null
      }
    },
  },
}

// Create server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (err) => {
    console.error("GraphQL Error:", err)
    return { message: err.message, locations: err.locations, path: err.path }
  },
})

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => ({ req, res }),
})

export { handler as GET, handler as POST }
