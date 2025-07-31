-- Additional tables for manager actions tracking
CREATE TABLE IF NOT EXISTS salary_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    manager_id UUID REFERENCES employees(id),
    old_salary DECIMAL(10,2),
    new_salary DECIMAL(10,2),
    amount DECIMAL(10,2),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    admin_comment TEXT,
    admin_approved_by UUID REFERENCES employees(id),
    admin_approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    manager_id UUID REFERENCES employees(id),
    amount DECIMAL(10,2),
    reason TEXT,
    period VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    admin_comment TEXT,
    admin_approved_by UUID REFERENCES employees(id),
    admin_approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add admin approval fields to time_entries for penalty tracking
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT false;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS admin_comment TEXT;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS admin_approved_by UUID REFERENCES employees(id);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP;

-- Add admin approval fields to leave_requests
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS admin_comment TEXT;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS admin_approved_by UUID REFERENCES employees(id);
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP;

-- Update contracts table to include payment tracking
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS salary_paid_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS prime DECIMAL(10,2) DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS avance DECIMAL(10,2) DEFAULT 0;
