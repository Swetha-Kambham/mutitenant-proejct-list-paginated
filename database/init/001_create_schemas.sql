-- Create schemas for multi-tenant architecture
-- Each tenant gets its own schema for data isolation

CREATE SCHEMA IF NOT EXISTS tenant_t1;
CREATE SCHEMA IF NOT EXISTS tenant_t2;

-- Grant necessary permissions to the database user
GRANT ALL PRIVILEGES ON SCHEMA tenant_t1 TO psa_admin;
GRANT ALL PRIVILEGES ON SCHEMA tenant_t2 TO psa_admin;

-- Set search path to include both schemas
ALTER DATABASE psa_multitenant SET search_path TO tenant_t1, tenant_t2, public;

-- Display confirmation
DO $$
BEGIN
    RAISE NOTICE 'Schemas created successfully: tenant_t1, tenant_t2';
END $$;
