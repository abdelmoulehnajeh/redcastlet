-- Create database schema for the restaurant management system
CREATE DATABASE IF NOT EXISTS restaurant_db;

-- Use the database
\c restaurant_db;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    employee_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS tenue_uploads (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    tenue_number VARCHAR(10) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_location ON employees(location_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_employee ON work_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_date ON work_schedules(date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_contracts_employee ON contracts(employee_id);

-- Insert sample locations
INSERT INTO locations (name, address, created_at) VALUES
('Red Castle Centre-Ville', '123 Rue de la République, 75001 Paris', CURRENT_TIMESTAMP),
('Red Castle Bastille', '45 Boulevard Beaumarchais, 75011 Paris', CURRENT_TIMESTAMP),
('Red Castle Montparnasse', '78 Avenue du Maine, 75014 Paris', CURRENT_TIMESTAMP);

-- Insert sample employees
INSERT INTO employees (nom, prenom, email, telephone, salaire, job_title, location_id, status, created_at) VALUES
('System', 'Admin', 'admin@redcastle.fr', '+33 6 12 34 56 78', 3000.00, 'Administrator', 1, 'active', CURRENT_TIMESTAMP),
('Durand', 'Pierre', 'manager1@redcastle.fr', '+33 6 23 45 67 89', 2800.00, 'Manager', 1, 'active', CURRENT_TIMESTAMP),
('Leroy', 'Sophie', 'manager2@redcastle.fr', '+33 6 34 56 78 90', 2800.00, 'Manager', 2, 'active', CURRENT_TIMESTAMP),
('Dupont', 'Jean', 'jean.dupont@redcastle.fr', '+33 6 45 67 89 01', 2000.00, 'Server', 1, 'active', CURRENT_TIMESTAMP),
('Martin', 'Marie', 'marie.martin@redcastle.fr', '+33 6 56 78 90 12', 2100.00, 'Chef', 1, 'active', CURRENT_TIMESTAMP),
('Bernard', 'Pierre', 'pierre.bernard@redcastle.fr', '+33 6 67 89 01 23', 1950.00, 'Server', 2, 'active', CURRENT_TIMESTAMP),
('Dubois', 'Sophie', 'sophie.dubois@redcastle.fr', '+33 6 78 90 12 34', 2150.00, 'Bartender', 2, 'active', CURRENT_TIMESTAMP),
('Moreau', 'Lucas', 'lucas.moreau@redcastle.fr', '+33 6 89 01 23 45', 1900.00, 'Server', 3, 'active', CURRENT_TIMESTAMP);

-- Insert sample users (linking to employees)
INSERT INTO users (username, password, role, employee_id, created_at) VALUES
('admin', '$2b$10$hash_for_password123', 'admin', 1, CURRENT_TIMESTAMP),
('manager1', '$2b$10$hash_for_password123', 'manager', 2, CURRENT_TIMESTAMP),
('manager2', '$2b$10$hash_for_password123', 'manager', 3, CURRENT_TIMESTAMP),
('jean.dupont', '$2b$10$hash_for_password123', 'employee', 4, CURRENT_TIMESTAMP),
('marie.martin', '$2b$10$hash_for_password123', 'employee', 5, CURRENT_TIMESTAMP),
('pierre.bernard', '$2b$10$hash_for_password123', 'employee', 6, CURRENT_TIMESTAMP),
('sophie.dubois', '$2b$10$hash_for_password123', 'employee', 7, CURRENT_TIMESTAMP),
('lucas.moreau', '$2b$10$hash_for_password123', 'employee', 8, CURRENT_TIMESTAMP);

-- Insert sample work schedules (next 7 days)
INSERT INTO work_schedules (employee_id, date, shift_type, job_position, is_working, start_time, end_time, created_at) VALUES
(4, CURRENT_DATE + INTERVAL '1 day', 'Matin', 'Server', true, '09:00:00', '17:00:00', CURRENT_TIMESTAMP),
(5, CURRENT_DATE + INTERVAL '1 day', 'Soirée', 'Chef', true, '10:00:00', '18:00:00', CURRENT_TIMESTAMP),
(6, CURRENT_DATE + INTERVAL '1 day', 'Matin', 'Server', true, '11:00:00', '19:00:00', CURRENT_TIMESTAMP),
(7, CURRENT_DATE + INTERVAL '1 day', 'Soirée', 'Bartender', true, '12:00:00', '20:00:00', CURRENT_TIMESTAMP),
(8, CURRENT_DATE + INTERVAL '1 day', 'Soirée', 'Server', true, '14:00:00', '22:00:00', CURRENT_TIMESTAMP);

-- Insert sample leave requests
INSERT INTO leave_requests (employee_id, type, start_date, end_date, days_count, reason, status, created_at) VALUES
(4, 'annual', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '15 days', 6, 'Vacances familiales', 'pending', CURRENT_TIMESTAMP),
(5, 'sick', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day', 2, 'Grippe', 'manager_approved', CURRENT_TIMESTAMP),
(6, 'annual', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '25 days', 6, 'Congés été', 'pending', CURRENT_TIMESTAMP);

-- Insert sample contracts
INSERT INTO contracts (employee_id, contract_type, start_date, end_date, salary, tenu_count, status, created_at) VALUES
(4, 'CDI', '2023-03-01', NULL, 2000.00, 2, 'active', CURRENT_TIMESTAMP),
(5, 'CDI', '2023-03-15', NULL, 2100.00, 2, 'active', CURRENT_TIMESTAMP),
(6, 'CDD', '2023-04-01', '2024-04-01', 1950.00, 1, 'active', CURRENT_TIMESTAMP),
(7, 'CDI', '2023-04-15', NULL, 2150.00, 2, 'active', CURRENT_TIMESTAMP),
(8, 'CDD', '2023-05-01', '2024-05-01', 1900.00, 1, 'active', CURRENT_TIMESTAMP);

-- Insert sample tenue uploads
INSERT INTO tenue_uploads (employee_id, photo_url, tenue_number, upload_date) VALUES
(4, 'http://example.com/tenue/emp1.jpg', 'T001', CURRENT_TIMESTAMP),
(5, 'http://example.com/tenue/emp2.jpg', 'T002', CURRENT_TIMESTAMP),
(6, 'http://example.com/tenue/emp3.jpg', 'T003', CURRENT_TIMESTAMP),
(7, 'http://example.com/tenue/emp4.jpg', 'T004', CURRENT_TIMESTAMP),
(8, 'http://example.com/tenue/emp5.jpg', 'T005', CURRENT_TIMESTAMP);