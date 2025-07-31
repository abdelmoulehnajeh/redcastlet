export const GET_ADMIN_APPROVALS = gql`
  query GetAdminApprovals($status: String) {
    adminApprovals(status: $status) {
      id
      type
      reference_id
      manager_id
      data
      status
      created_at
    }
  }
`
import { gql } from "@apollo/client"

// Authentication
export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
      role
      employee_id
    }
  }
`

// Dashboard Stats
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($userId: ID!, $role: String!) {
    dashboardStats(userId: $userId, role: $role) {
      monthlyHours
      weeklyHours
      estimatedSalary
      hourlyRate
      remainingLeave
      activeEmployees
      totalEmployees
      totalHours
      pendingRequests
      monthlyRevenue
      revenueGrowth
      recentActivity {
        title
        description
        time
        type
      }
    }
  }
`

// Employee Queries
export const GET_EMPLOYEES = gql`
  query GetEmployees($locationId: ID) {
    employees(locationId: $locationId) {
      id
      username
      email
      nom
      prenom
      telephone
      job_title
      salaire
      prime
      bonus
      avance
      infractions
      absence
      retard
      tenu_de_travail
      status
      created_at
      location {
        id
        name
      }
      profile {
        first_name
        last_name
        phone
        address
      }
    }
  }
`

export const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      username
      email
      nom
      prenom
      telephone
      job_title
      salaire
      prime
      bonus
      avance
      infractions
      absence
      retard
      tenu_de_travail
      status
      created_at
      location {
        id
        name
        address
      }
      profile {
        first_name
        last_name
        phone
        address
        birth_date
        emergency_contact
      }
    }
  }
`

// Time Tracking
export const GET_TIME_ENTRIES = gql`
  query GetTimeEntries($employeeId: ID!, $startDate: String, $endDate: String) {
    timeEntries(employeeId: $employeeId, startDate: $startDate, endDate: $endDate) {
      id
      employee_id
      clock_in
      clock_out
      break_duration
      total_hours
      date
      status
      location {
        id
        name
      }
    }
  }
`

export const CLOCK_IN_MUTATION = gql`
  mutation ClockIn($employeeId: ID!, $locationId: ID!) {
    clockIn(employeeId: $employeeId, locationId: $locationId) {
      id
      clock_in
      status
    }
  }
`

export const CLOCK_OUT_MUTATION = gql`
  mutation ClockOut($timeEntryId: ID!) {
    clockOut(timeEntryId: $timeEntryId) {
      id
      clock_out
      total_hours
      status
    }
  }
`

// Work Schedules
export const GET_WORK_SCHEDULES = gql`
  query GetWorkSchedules($employee_id: ID, $date: String) {
    workSchedules(employee_id: $employee_id, date: $date) {
      id
      employee_id
      date
      start_time
      end_time
      shift_type
      job_position
      is_working
      created_at
    }
  }
`

export const CREATE_WORK_SCHEDULE = gql`
  mutation CreateWorkSchedule(
    $employee_id: ID!
    $date: String!
    $start_time: String
    $end_time: String
    $shift_type: String!
    $job_position: String!
    $is_working: Boolean!
  ) {
    createWorkSchedule(
      employee_id: $employee_id
      date: $date
      start_time: $start_time
      end_time: $end_time
      shift_type: $shift_type
      job_position: $job_position
      is_working: $is_working
    ) {
      id
      employee_id
      date
      start_time
      end_time
      shift_type
      job_position
      is_working
    }
  }
`

export const UPDATE_WORK_SCHEDULE = gql`
  mutation UpdateWorkSchedule(
    $id: ID!
    $start_time: String
    $end_time: String
    $shift_type: String
    $job_position: String
    $is_working: Boolean
  ) {
    updateWorkSchedule(
      id: $id
      start_time: $start_time
      end_time: $end_time
      shift_type: $shift_type
      job_position: $job_position
      is_working: $is_working
    ) {
      id
      start_time
      end_time
      shift_type
      job_position
      is_working
    }
  }
`

// Leave Requests
export const GET_LEAVE_REQUESTS = gql`
  query GetLeaveRequests($employee_id: ID, $status: String) {
    leaveRequests(employee_id: $employee_id, status: $status) {
      id
      employee_id
      type
      start_date
      end_date
      reason
      status
      days_count
      manager_comment
      admin_comment
      created_at
      approved_by {
        id
        username
      }
      approved_at
      employee {
        id
        username
        profile {
          first_name
          last_name
        }
      }
    }
  }
`

export const CREATE_LEAVE_REQUEST = gql`
  mutation CreateLeaveRequest(
    $employee_id: ID!
    $type: String!
    $start_date: String!
    $end_date: String!
    $reason: String
  ) {
    createLeaveRequest(
      employee_id: $employee_id
      type: $type
      start_date: $start_date
      end_date: $end_date
      reason: $reason
    ) {
      id
      type
      start_date
      end_date
      reason
      status
      days_count
    }
  }
`

export const APPROVE_LEAVE_REQUEST = gql`
  mutation ApproveLeaveRequest($id: ID!, $status: String!, $comment: String) {
    approveLeaveRequest(id: $id, status: $status, comment: $comment) {
      id
      status
      approved_at
      approved_by {
        id
        username
      }
    }
  }
`

// Locations
export const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      address
      phone
      manager {
        id
        username
        profile {
          first_name
          last_name
        }
      }
      employees {
        id
        username
        status
      }
    }
  }
`

export const GET_LOCATION = gql`
  query GetLocation($id: ID!) {
    location(id: $id) {
      id
      name
      address
      phone
      manager {
        id
        username
        profile {
          first_name
          last_name
        }
      }
      employees {
        id
        username
        email
        nom
        prenom
        telephone
        job_title
        salaire
        status
        created_at
        profile {
          first_name
          last_name
          phone
        }
      }
    }
  }
`

export const GET_LOCATION_DETAILS = gql`
  query GetLocationDetails($id: ID!) {
    location(id: $id) {
      id
      name
      address
      phone
      manager {
        id
        username
        profile {
          first_name
          last_name
        }
      }
      employees {
        id
        username
        email
        status
        created_at
        profile {
          first_name
          last_name
          phone
        }
      }
    }
  }
`

// Contracts
export const GET_CONTRACTS = gql`
  query GetContracts($employee_id: ID) {
    contracts(employee_id: $employee_id) {
      id
      employee_id
      contract_type
      start_date
      end_date
      salary
      tenu_count
      documents
      created_at
      employee {
        id
        username
        profile {
          first_name
          last_name
        }
      }
    }
  }
`

export const CREATE_CONTRACT = gql`
  mutation CreateContract(
    $employee_id: ID!
    $contract_type: String!
    $start_date: String!
    $end_date: String
    $salary: Float!
    $tenu_count: Int
    $documents: [String]
  ) {
    createContract(
      employee_id: $employee_id
      contract_type: $contract_type
      start_date: $start_date
      end_date: $end_date
      salary: $salary
      tenu_count: $tenu_count
      documents: $documents
    ) {
      id
      contract_type
      start_date
      end_date
      salary
      tenu_count
    }
  }
`

// Employee CRUD
export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee(
    $username: String!
    $email: String!
    $nom: String!
    $prenom: String!
    $telephone: String!
    $job_title: String!
    $salaire: Float
    $location_id: ID
  ) {
    createEmployee(
      username: $username
      email: $email
      nom: $nom
      prenom: $prenom
      telephone: $telephone
      job_title: $job_title
      salaire: $salaire
      location_id: $location_id
    ) {
      id
      username
      email
      nom
      prenom
      job_title
      status
    }
  }
`

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee(
    $id: ID!
    $salaire: Float
    $prime: Float
    $bonus: Float
    $avance: Float
    $infractions: Int
    $absence: Int
    $retard: Int
    $tenu_de_travail: Int
    $status: String
  ) {
    updateEmployee(
      id: $id
      salaire: $salaire
      prime: $prime
      bonus: $bonus
      avance: $avance
      infractions: $infractions
      absence: $absence
      retard: $retard
      tenu_de_travail: $tenu_de_travail
      status: $status
    ) {
      id
      salaire
      prime
      bonus
      avance
      infractions
      absence
      retard
      tenu_de_travail
      status
    }
  }
`

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`

export const CREATE_MANAGER_WORK_SCHEDULE = gql`
  mutation CreateManagerWorkSchedule(
    $employee_id: ID!
    $shift_type: String!
    $job_position: String!
    $start_time: String!
    $end_time: String!
    $date: String!
    $is_working: Boolean!
  ) {
    createManagerWorkSchedule(
      employee_id: $employee_id
      shift_type: $shift_type
      job_position: $job_position
      start_time: $start_time
      end_time: $end_time
      date: $date
      is_working: $is_working
    ) {
      id
      employee_id
      shift_type
      job_position
      start_time
      end_time
      date
      is_working
      created_at
    }
  }
`;

export const SEND_APPROVAL_REQUEST = gql`
  mutation SendApprovalRequest(
    $type: String!
    $reference_id: ID
    $manager_id: ID
    $data: String!
  ) {
    sendApprovalRequest(
      type: $type
      reference_id: $reference_id
      manager_id: $manager_id
      data: $data
    )
  }
`;