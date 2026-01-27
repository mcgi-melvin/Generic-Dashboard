
-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'Administrator with full access', '["read", "write", "delete", "manage_users", "manage_roles"]'),
    ('manager', 'Manager with moderate access', '["read", "write", "manage_users"]'),
    ('user', 'Standard user with basic access', '["read", "write"]'),
    ('viewer', 'Read-only access', '["read"]')
ON CONFLICT (name) DO NOTHING;