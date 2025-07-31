-- FINAL DATABASE STRUCTURE FOR RED CASTLE PLATFORM
-- This structure supports all features in your Next.js + GraphQL app

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    employee_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOCATIONS
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    salaire DECIMAL(10,2) DEFAULT 0,
    prime DECIMAL(10,2) DEFAULT 0,
    infractions INTEGER DEFAULT 0,
    absence INTEGER DEFAULT 0,
    retard INTEGER DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    avance DECIMAL(10,2) DEFAULT 0,
    tenu_de_travail INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    job_title VARCHAR(255),
    location_id INTEGER REFERENCES locations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WORK SCHEDULES
CREATE TABLE IF NOT EXISTS work_schedules (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    date DATE NOT NULL,
    shift_type VARCHAR(50) NOT NULL CHECK (shift_type IN ('Matin', 'Soirée', 'Doublage', 'Repos')),
    job_position VARCHAR(255),
    is_working BOOLEAN DEFAULT false,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('annual', 'sick', 'maternity', 'paternity', 'personal')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'manager_approved', 'manager_rejected', 'admin_approved', 'admin_rejected')),
    manager_comment TEXT,
    admin_comment TEXT,
    admin_approved_by INTEGER REFERENCES employees(id),
    admin_approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONTRACTS
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('CDI', 'CDD', 'Stage', 'Freelance')),
    start_date DATE NOT NULL,
    end_date DATE,
    salary DECIMAL(10,2) NOT NULL,
    prime DECIMAL(10,2) DEFAULT 0,
    avance DECIMAL(10,2) DEFAULT 0,
    documents TEXT[] DEFAULT '{}',
    tenu_count INTEGER DEFAULT 0,
    salary_paid_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TIME ENTRIES
CREATE TABLE IF NOT EXISTS time_entries (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    location_id INTEGER REFERENCES locations(id),
    clock_in TIMESTAMP,
    clock_out TIMESTAMP,
    break_duration INTEGER,
    total_hours DECIMAL(5,2),
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    admin_approved BOOLEAN DEFAULT false,
    admin_comment TEXT,
    admin_approved_by INTEGER REFERENCES employees(id),
    admin_approved_at TIMESTAMP
);

-- SALARY ADJUSTMENTS
CREATE TABLE IF NOT EXISTS salary_adjustments (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    manager_id INTEGER REFERENCES employees(id),
    old_salary DECIMAL(10,2),
    new_salary DECIMAL(10,2),
    amount DECIMAL(10,2),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    admin_comment TEXT,
    admin_approved_by INTEGER REFERENCES employees(id),
    admin_approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BONUSES
CREATE TABLE IF NOT EXISTS bonuses (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    manager_id INTEGER REFERENCES employees(id),
    amount DECIMAL(10,2),
    reason TEXT,
    period VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    admin_comment TEXT,
    admin_approved_by INTEGER REFERENCES employees(id),
    admin_approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TENUE UPLOADS
CREATE TABLE IF NOT EXISTS tenue_uploads (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    tenue_number VARCHAR(10) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_employees_location ON employees(location_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_employee ON work_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_date ON work_schedules(date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_contracts_employee ON contracts(employee_id);
