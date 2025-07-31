-- Temporary table for manager schedule proposals
CREATE TABLE IF NOT EXISTS manager_work_schedules (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    shift_type VARCHAR(32) NOT NULL,
    job_position VARCHAR(32) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    is_working BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Approval requests table (admin_approvals)
CREATE TABLE IF NOT EXISTS admin_approvals (
    id SERIAL PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    reference_id INTEGER NOT NULL,
    manager_id INTEGER NOT NULL REFERENCES employees(id),
    data JSONB NOT NULL,
    status VARCHAR(16) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP
);
