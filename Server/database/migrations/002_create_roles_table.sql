-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Add foreign key constraint to users table
ALTER TABLE users
    ADD CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
            ON DELETE RESTRICT;

-- Create trigger for roles updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
   ('admin', 'Administrator with full access', '["read", "write", "delete", "manage_users", "manage_roles"]'),
   ('manager', 'Manager with moderate access', '["read", "write", "manage_users"]'),
   ('user', 'Standard user with basic access', '["read", "write"]'),
   ('viewer', 'Read-only access', '["read"]')
ON CONFLICT (name) DO NOTHING;