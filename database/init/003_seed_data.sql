-- Seed data for tenant_t1
-- Note: In production, use bcrypt or similar for password hashing
-- For demo purposes, using MD5 (password: "password123")

-- Insert PM user for tenant_t1
INSERT INTO tenant_t1.users (username, password, role, tenant_slug) VALUES
('pm_t1', MD5('password123'), 'PM', 'tenant_t1');

-- Insert projects for tenant_t1
INSERT INTO tenant_t1.projects (name, description, status) VALUES
('Website Redesign', 'Complete overhaul of company website with modern UI/UX', 'Active'),
('Mobile App Development', 'Native iOS and Android app for customer portal', 'Active'),
('Database Migration', 'Migrate from MySQL to PostgreSQL', 'In Progress'),
('Security Audit', 'Comprehensive security review of all systems', 'Active'),
('Marketing Campaign Q1', 'Q1 2024 marketing initiatives and campaigns', 'Completed'),
('API Gateway Implementation', 'Implement API gateway for microservices', 'Active'),
('Customer Portal v2', 'Enhanced customer portal with self-service features', 'Planning'),
('Cloud Infrastructure Setup', 'Setup AWS infrastructure for production', 'Active'),
('Data Analytics Platform', 'Build internal analytics and reporting platform', 'In Progress'),
('Legacy System Decommission', 'Sunset old CRM system', 'Planning'),
('Employee Training Portal', 'Internal learning management system', 'Active'),
('Compliance Framework', 'GDPR and SOC2 compliance implementation', 'In Progress'),
('Payment Gateway Integration', 'Integrate Stripe and PayPal', 'Active'),
('Performance Optimization', 'Optimize application performance and load times', 'Active'),
('Disaster Recovery Plan', 'Implement DR and backup strategies', 'Planning');

-- Grant access to PM user for specific projects (row-level security)
-- PM user can access projects 1-10, but NOT 11-15
INSERT INTO tenant_t1.project_access (project_id, user_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(6, 1), (7, 1), (8, 1), (9, 1), (10, 1);

-- Seed data for tenant_t2
-- Insert PM user for tenant_t2
INSERT INTO tenant_t2.users (username, password, role, tenant_slug) VALUES
('pm_t2', MD5('password123'), 'PM', 'tenant_t2');

-- Insert projects for tenant_t2
INSERT INTO tenant_t2.projects (name, description, status) VALUES
('ERP System Upgrade', 'Upgrade to latest ERP version', 'Active'),
('Supply Chain Optimization', 'Optimize supply chain processes', 'In Progress'),
('Customer Feedback System', 'Build customer feedback collection system', 'Active'),
('Inventory Management', 'Implement real-time inventory tracking', 'Active'),
('HR Portal Development', 'Self-service HR portal for employees', 'Planning'),
('Financial Reporting Tool', 'Automated financial reporting dashboard', 'Active'),
('Quality Assurance Process', 'Implement QA automation framework', 'In Progress'),
('Vendor Management Platform', 'Platform for vendor relationship management', 'Active'),
('IoT Sensor Integration', 'Integrate IoT sensors for facility monitoring', 'Planning'),
('Document Management System', 'Enterprise document management solution', 'Active'),
('Business Intelligence Dashboard', 'Executive BI dashboard', 'Active'),
('Network Infrastructure Upgrade', 'Upgrade datacenter networking', 'In Progress'),
('Customer Success Platform', 'Build customer success tracking platform', 'Planning'),
('Email Marketing Automation', 'Implement email marketing automation', 'Active'),
('Social Media Integration', 'Integrate social media channels', 'Completed');

-- Grant access to PM user for specific projects (row-level security)
-- PM user can access projects 1-12, but NOT 13-15
INSERT INTO tenant_t2.project_access (project_id, user_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(6, 1), (7, 1), (8, 1), (9, 1), (10, 1),
(11, 1), (12, 1);

-- Display confirmation
DO $$
DECLARE
    t1_user_count INT;
    t1_project_count INT;
    t1_access_count INT;
    t2_user_count INT;
    t2_project_count INT;
    t2_access_count INT;
BEGIN
    SELECT COUNT(*) INTO t1_user_count FROM tenant_t1.users;
    SELECT COUNT(*) INTO t1_project_count FROM tenant_t1.projects;
    SELECT COUNT(*) INTO t1_access_count FROM tenant_t1.project_access;

    SELECT COUNT(*) INTO t2_user_count FROM tenant_t2.users;
    SELECT COUNT(*) INTO t2_project_count FROM tenant_t2.projects;
    SELECT COUNT(*) INTO t2_access_count FROM tenant_t2.project_access;

    RAISE NOTICE 'Seed data loaded successfully!';
    RAISE NOTICE 'Tenant T1: % users, % projects, % access grants', t1_user_count, t1_project_count, t1_access_count;
    RAISE NOTICE 'Tenant T2: % users, % projects, % access grants', t2_user_count, t2_project_count, t2_access_count;
END $$;
