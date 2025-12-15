-- Create tables in tenant_t1 schema
CREATE TABLE IF NOT EXISTS tenant_t1.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    role VARCHAR(50) NOT NULL DEFAULT 'PM',
    tenant_slug VARCHAR(50) NOT NULL DEFAULT 'tenant_t1',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_t1.projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_t1.project_access (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES tenant_t1.projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES tenant_t1.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Create indexes for tenant_t1
CREATE INDEX IF NOT EXISTS idx_t1_users_username ON tenant_t1.users(username);
CREATE INDEX IF NOT EXISTS idx_t1_projects_name ON tenant_t1.projects(name);
CREATE INDEX IF NOT EXISTS idx_t1_projects_status ON tenant_t1.projects(status);
CREATE INDEX IF NOT EXISTS idx_t1_project_access_user ON tenant_t1.project_access(user_id);
CREATE INDEX IF NOT EXISTS idx_t1_project_access_project ON tenant_t1.project_access(project_id);

-- Create tables in tenant_t2 schema (identical structure)
CREATE TABLE IF NOT EXISTS tenant_t2.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'PM',
    tenant_slug VARCHAR(50) NOT NULL DEFAULT 'tenant_t2',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_t2.projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_t2.project_access (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES tenant_t2.projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES tenant_t2.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Create indexes for tenant_t2
CREATE INDEX IF NOT EXISTS idx_t2_users_username ON tenant_t2.users(username);
CREATE INDEX IF NOT EXISTS idx_t2_projects_name ON tenant_t2.projects(name);
CREATE INDEX IF NOT EXISTS idx_t2_projects_status ON tenant_t2.projects(status);
CREATE INDEX IF NOT EXISTS idx_t2_project_access_user ON tenant_t2.project_access(user_id);
CREATE INDEX IF NOT EXISTS idx_t2_project_access_project ON tenant_t2.project_access(project_id);

-- Display confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tables created successfully in both tenant schemas';
END $$;
