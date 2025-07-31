-- Table: public.time_entries

CREATE TABLE IF NOT EXISTS public.time_entries (
    id serial PRIMARY KEY,
    employee_id integer REFERENCES employees(id),
    location_id integer REFERENCES locations(id),
    clock_in timestamp,
    clock_out timestamp,
    break_duration integer DEFAULT 0,
    total_hours numeric(6,2) DEFAULT 0,
    date date NOT NULL,
    status character varying(50) DEFAULT 'active',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_location ON time_entries(location_id);
