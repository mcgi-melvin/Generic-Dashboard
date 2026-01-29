-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
                                     id INT AUTO_INCREMENT PRIMARY KEY,
                                     name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON DEFAULT ('[]'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Add foreign key constraint to users table
ALTER TABLE users
    ADD CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
            ON DELETE RESTRICT;

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'Administrator with full access', '["read", "write", "delete", "manage_users", "manage_roles"]'),
    ('manager', 'Manager with moderate access', '["read", "write", "manage_users"]'),
    ('user', 'Standard user with basic access', '["read", "write"]'),
    ('viewer', 'Read-only access', '["read"]')
ON DUPLICATE KEY UPDATE name = name;