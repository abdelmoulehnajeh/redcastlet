-- Create database schema for the restaurant management system

-- Create database
CREATE DATABASE IF NOT EXISTS restaurant_db;

-- Use the database
\c restaurant_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    employee_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations/Restaurants table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
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

-- Work schedules table
CREATE TABLE IF NOT EXISTS work_schedules (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    date DATE NOT NULL,
    shift_type VARCHAR(50) NOT NULL CHECK (shift_type IN ('Matin', 'Soirée', 'Doublage')),
    job_position VARCHAR(255),
    is_working BOOLEAN DEFAULT false,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- Leave requests table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('CDI', 'CDD', 'Stage', 'Freelance')),
    start_date DATE NOT NULL,
    end_date DATE,
    salary DECIMAL(10,2) NOT NULL,
    documents TEXT[] DEFAULT '{}',
    tenu_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin approvals table for manager actions
CREATE TABLE IF NOT EXISTS admin_approvals (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('schedule_change', 'contract_update', 'leave_request')),
    reference_id INTEGER NOT NULL, -- ID of the related record
    manager_id INTEGER REFERENCES users(id),
    data TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    admin_comment TEXT
);

-- Tenue/Uniform uploads table
CREATE TABLE tenue_uploads (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    tenue_number VARCHAR(10) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data

-- Insert locations
INSERT INTO locations (name, address) VALUES
('Restaurant Central', '123 Main Street, City Center'),
('Restaurant Nord', '456 North Avenue, North District'),
('Restaurant Sud', '789 South Boulevard, South District');

-- Insert default admin user
INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'admin'),
('manager', 'manager', 'manager');

-- Insert sample employees
INSERT INTO employees (nom, prenom, email, telephone, salaire, job_title, location_id) VALUES
('Doe', 'John', 'john.doe@restaurant.com', '123-456-7890', 2500.00, 'server', 1),
('Smith', 'Jane', 'jane.smith@restaurant.com', '123-456-7891', 2800.00, 'chef', 1),
('Johnson', 'Mike', 'mike.johnson@restaurant.com', '123-456-7892', 2300.00, 'server', 2),
('Brown', 'Sarah', 'sarah.brown@restaurant.com', '123-456-7893', 2600.00, 'manager', 2),
('Davis', 'Tom', 'tom.davis@restaurant.com', '123-456-7894', 2400.00, 'server', 3);

-- Link users to employees
UPDATE users SET employee_id = 1 WHERE username = 'admin';
UPDATE users SET employee_id = 4 WHERE username = 'manager';

-- Insert sample work schedules for current week
INSERT INTO work_schedules (employee_id, date, shift_type, job_position, is_working) VALUES
(1, CURRENT_DATE, 'Matin', 'server', true),
(2, CURRENT_DATE, 'Soirée', 'chef', true),
(3, CURRENT_DATE, 'Doublage', 'server', false),
(4, CURRENT_DATE, 'Matin', 'manager', true),
(5, CURRENT_DATE, 'Soirée', 'server', true);

-- Insert sample contracts
INSERT INTO contracts (employee_id, contract_type, start_date, salary, tenu_count) VALUES
(1, 'CDI', '2024-01-01', 2500.00, 3),
(2, 'CDI', '2024-01-01', 2800.00, 2),
(3, 'CDD', '2024-06-01', 2300.00, 2),
(4, 'CDI', '2023-01-01', 2600.00, 3),
(5, 'CDD', '2024-03-01', 2400.00, 2);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_location ON employees(location_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_employee ON work_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_date ON work_schedules(date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_contracts_employee ON contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_status ON admin_approvals(status);
