const db = require('../config/db');

class User {
    static async create(userData) {
        const { email, password, first_name, last_name, role_id } = userData;
        const query = `
        INSERT INTO users (email, password, first_name, last_name, role_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, role_id, is_active, created_at
        `;
        const result = await db.query(query, [email, password, first_name, last_name, role_id]);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = `
        SELECT u.*, r.name as role_name, r.permissions
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1
        `;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, 
             u.email_verified, u.last_login, u.created_at,
             r.name as role_name, r.permissions
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async updateLastLogin(userId) {
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
        await db.query(query, [userId]);
    }

    static async update(userId, updateData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updateData).forEach(key => {
            fields.push(`${key} = $${paramCount}`);
            values.push(updateData[key]);
            paramCount++;
        });

        values.push(userId);
        const query = `
        UPDATE users 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, first_name, last_name, role_id, is_active
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(userId) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }

    static async getAll(limit = 50, offset = 0) {
        const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
             u.last_login, u.created_at, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
        LIMIT $1 OFFSET $2
        `;
        const result = await db.query(query, [limit, offset]);
        return result.rows;
    }
}

module.exports = User;