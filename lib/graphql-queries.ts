import { gql } from "@apollo/client"

// Authentication
export const LOGIN_MUTATION = gql`
 mutation Login($username: String!, $password: String!) {
   login(username: $username, password: $password) {
     id
     username
     role
     employee_id
     location_id
   }
 }
`

// Combined Dashboard Data Query - Gets all dashboard data in one request
export const GET_DASHBOARD_DATA = gql`
 query GetDashboardData($userId: ID!, $role: String!) {
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
   employees {
     id
     username
     email
     nom
     prenom
     telephone
     job_title
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
     }
     user {
       id
       username
       password
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

// Dashboard Stats (fallback for individual use)
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

// Combined Employee Details Query - Gets all employee data in one request
export const GET_EMPLOYEE_DETAILS = gql`
 query GetEmployeeDetails($id: ID!) {
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
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
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
     user {
       id
       username
       password
     }
   }
   workSchedules(employee_id: $id) {
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
   contracts(employee_id: $id) {
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

// Combined Admin Data Query - Gets all admin-related data in one request
export const GET_ADMIN_DATA = gql`
 query GetAdminData($userId: ID!, $role: String!, $approvalStatus: String) {
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
   employees {
     id
     username
     email
     nom
     prenom
     telephone
     job_title
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
     }
     user {
       id
       username
       password
     }
     profile {
       first_name
       last_name
       phone
       address
     }
   }
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
   adminApprovals(status: $approvalStatus) {
     id
     type
     reference_id
     manager_id
     data
     status
     created_at
   }
   leaveRequests {
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

// Combined Finance Data Query
export const GET_FINANCE_DATA = gql`
 query GetFinanceData($period: String!) {
   employees {
     id
     username
     email
     nom
     prenom
     telephone
     job_title
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
     }
   }
   locations {
     id
     name
     address
   }
   payrollPayments(period: $period) {
     id
     employee_id
     period
     paid
     paid_at
     amount
     hours_worked
   }
 }
`

// Combined Journal Data Query
export const GET_JOURNAL_DATA = gql`
 query GetJournalData {
   employees {
     id
     username
     email
     nom
     prenom
     job_title
     status
     location {
       id
       name
     }
     profile {
       first_name
       last_name
     }
   }
   locations {
     id
     name
   }
   workSchedules {
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

// Employees
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
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
     }
     user {
       id
       username
       password
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
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
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

// Time tracking
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

// Work schedules
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
     location_id
     location {
       id
       name
       address
     }
     created_at
   }
 }
`

export const GET_WORK_SCHEDULES_RANGE = gql`
 query GetWorkSchedulesRange($employee_id: ID!, $start: String!, $end: String!) {
   workSchedulesRange(employee_id: $employee_id, start: $start, end: $end) {
     id
     employee_id
     date
     shift_type
     is_working
     location_id
     location {
       id
       name
     }
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
   $location_id: ID!
 ) {
   createWorkSchedule(
     employee_id: $employee_id
     date: $date
     start_time: $start_time
     end_time: $end_time
     shift_type: $shift_type
     job_position: $job_position
     is_working: $is_working
     location_id: $location_id
   ) {
     id
     employee_id
     date
     start_time
     end_time
     shift_type
     job_position
     is_working
     location_id
     location {
       id
       name
     }
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
   $location_id: ID
 ) {
   updateWorkSchedule(
     id: $id
     start_time: $start_time
     end_time: $end_time
     shift_type: $shift_type
     job_position: $job_position
     is_working: $is_working
     location_id: $location_id
   ) {
     id
     start_time
     end_time
     shift_type
     job_position
     is_working
     location_id
     location {
       id
       name
     }
   }
 }
`

// Leave requests
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

// Employee CRUD - Updated to handle optional email and telephone
export const CREATE_EMPLOYEE = gql`
 mutation CreateEmployee(
   $username: String!
   $email: String!
   $nom: String!
   $prenom: String!
   $telephone: String
   $job_title: String!
   $salaire: Float
   $role: String
   $location_id: ID
   $price_h: Float
 ) {
   createEmployee(
     username: $username
     email: $email
     nom: $nom
     prenom: $prenom
     telephone: $telephone
     job_title: $job_title
     salaire: $salaire
     role: $role
     location_id: $location_id
     price_h: $price_h
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
   $avance: Float
   $infractions: Int
   $absence: Int
   $retard: Int
   $tenu_de_travail: Int
   $status: String
   $price_h: Float
 ) {
   updateEmployee(
     id: $id
     salaire: $salaire
     prime: $prime
     avance: $avance
     infractions: $infractions
     absence: $absence
     retard: $retard
     tenu_de_travail: $tenu_de_travail
     status: $status
     price_h: $price_h
   ) {
     id
     salaire
     prime
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

// Admin approvals
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
`

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
`

export const APPROVE_SCHEDULE_CHANGE = gql`
 mutation ApproveScheduleChange($approval_id: ID!) {
   approveScheduleChange(approval_id: $approval_id)
 }
`

export const REJECT_SCHEDULE_CHANGE = gql`
 mutation RejectScheduleChange($approval_id: ID!, $comment: String) {
   rejectScheduleChange(approval_id: $approval_id, comment: $comment)
 }
`

// Payroll payments
export const GET_PAYROLL_PAYMENTS = gql`
 query GetPayrollPayments($period: String!) {
   payrollPayments(period: $period) {
     id
     employee_id
     period
     paid
     paid_at
     amount
     hours_worked
   }
 }
`

export const GET_PAYROLL_PAYMENT = gql`
 query GetPayrollPayment($employee_id: ID!, $period: String!) {
   payrollPayment(employee_id: $employee_id, period: $period) {
     id
     employee_id
     period
     paid
     paid_at
     amount
     hours_worked
   }
 }
`

export const PAY_SALARY = gql`
 mutation PaySalary($employee_id: ID!, $period: String!) {
   paySalary(employee_id: $employee_id, period: $period) {
     id
     employee_id
     period
     paid
     paid_at
     amount
     hours_worked
   }
 }
`

// Notifications (from earlier feature)
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($user_id: ID!, $role: String, $only_unseen: Boolean) {
    notifications(user_id: $user_id, role: $role, only_unseen: $only_unseen) {
      id
      user_id
      role
      title
      message
      type
      reference_id
      seen
      created_at
    }
  }
`
export const MARK_NOTIFICATION_SEEN = gql`
  mutation MarkNotificationSeen($id: ID!) { markNotificationSeen(id: $id) }
`
export const MARK_ALL_NOTIFICATIONS_SEEN = gql`
  mutation MarkAllNotificationsSeen($user_id: ID!) { markAllNotificationsSeen(user_id: $user_id) }
`

// New: notify employee that monthly planning is available
export const NOTIFY_PLANNING_FOR_EMPLOYEE = gql`
  mutation NotifyPlanningForEmployee($employee_id: ID!, $month: String!) {
    notifyPlanningForEmployee(employee_id: $employee_id, month: $month)
  }
`

// New: Update Employee Profile
export const UPDATE_EMPLOYEE_PROFILE = gql`
  mutation UpdateEmployeeProfile(
    $id: ID!
    $nom: String
    $prenom: String
    $email: String
    $telephone: String
    $job_title: String
    $location_id: Int
  ) {
    updateEmployeeProfile(
      id: $id
      nom: $nom
      prenom: $prenom
      email: $email
      telephone: $telephone
      job_title: $job_title
      location_id: $location_id
    ) {
      id
      nom
      prenom
      email
      telephone
      job_title
      location_id
    }
  }
`

// New: Update User Password
export const UPDATE_USER_PASSWORD = gql`
  mutation UpdateUserPassword(
    $employee_id: ID!
    $currentPassword: String!
    $newPassword: String!
  ) {
    updateUserPassword(
      employee_id: $employee_id
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      id
      username
    }
  }
`

// New: Update User Info
export const UPDATE_USER_INFO = gql`
  mutation UpdateUserInfo(
    $employee_id: ID!
    $username: String
    $hire_date: String
  ) {
    updateUserInfo(
      employee_id: $employee_id
      username: $username
      hire_date: $hire_date
    ) {
      id
      username
      employee_id
    }
  }
`

// New: Disciplinary System Queries and Mutations
export const GET_EMPLOYEE_DISCIPLINARY_DATA = gql`
  query GetEmployeeDisciplinaryData($employee_id: ID!) {
    infractions(employee_id: $employee_id) {
      id
      name
      description
      price
      created_date
    }
    absences(employee_id: $employee_id) {
      id
      name
      description
      price
      created_date
    }
    retards(employee_id: $employee_id) {
      id
      name
      description
      price
      created_date
    }
    tenuesTravail(employee_id: $employee_id) {
      id
      name
      description
      price
      created_date
    }
  }
`

export const CREATE_INFRACTION = gql`
  mutation CreateInfraction(
    $employee_id: ID!
    $name: String!
    $description: String
    $price: Float!
  ) {
    createInfraction(
      employee_id: $employee_id
      name: $name
      description: $description
      price: $price
    ) {
      id
      name
      description
      price
      created_date
    }
  }
`

export const CREATE_ABSENCE = gql`
  mutation CreateAbsence(
    $employee_id: ID!
    $name: String!
    $description: String
    $price: Float!
  ) {
    createAbsence(
      employee_id: $employee_id
      name: $name
      description: $description
      price: $price
    ) {
      id
      name
      description
      price
      created_date
    }
  }
`

export const CREATE_RETARD = gql`
  mutation CreateRetard(
    $employee_id: ID!
    $name: String!
    $description: String
    $price: Float!
  ) {
    createRetard(
      employee_id: $employee_id
      name: $name
      description: $description
      price: $price
    ) {
      id
      name
      description
      price
      created_date
    }
  }
`

export const CREATE_TENUE_TRAVAIL = gql`
  mutation CreateTenueTravail(
    $employee_id: ID!
    $name: String!
    $description: String
    $price: Float!
  ) {
    createTenueTravail(
      employee_id: $employee_id
      name: $name
      description: $description
      price: $price
    ) {
      id
      name
      description
      price
      created_date
    }
  }
`
