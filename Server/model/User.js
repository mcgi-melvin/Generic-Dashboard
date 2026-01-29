const db = require('../config/db');

class User {
    static async create(userData) {
        const { email, password, first_name, last_name, role_id } = userData;
        const query = `
            INSERT INTO users (email, password, first_name, last_name, role_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await db.query(query, [email, password, first_name, last_name, role_id]);

        // Fetch the created user
        const { rows } = await db.query(
            'SELECT id, email, first_name, last_name, role_id, is_active, created_at FROM users WHERE id = ?',
            [result?.rows?.insertId]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const query = `
            SELECT u.*, r.name as role_name, r.permissions
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = ?
        `;
        const { rows } = await db.query(query, [email]);
        return rows[0];
    }

    static async findById(id) {
        const query = `
            SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
                   u.email_verified, u.last_login, u.created_at,
                   r.name as role_name, r.permissions
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        `;
        const {rows} = await db.query(query, [id]);
        return rows[0];
    }

    static async updateLastLogin(userId) {
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
        await db.query(query, [userId]);
    }

    static async update(userId, updateData) {
        const fields = [];
        const values = [];

        Object.keys(updateData).forEach(key => {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        });

        values.push(userId);
        const query = `
            UPDATE users
            SET ${fields.join(', ')}
            WHERE id = ?
        `;

        await db.query(query, values);

        // Fetch the updated user
        const {rows} = await db.query(
            'SELECT id, email, first_name, last_name, role_id, is_active FROM users WHERE id = ?',
            [userId]
        );
        return rows[0];
    }

    static async delete(userId) {
        // Fetch user before deleting
        const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
        const user = rows[0];

        if (user) {
            await db.query('DELETE FROM users WHERE id = ?', [userId]);
        }

        return user[0];
    }

    static async getAll(limit = 50, offset = 0) {
        const query = `
            SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
                   u.last_login, u.created_at, r.name as role_name
            FROM users u
                     JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
                LIMIT ? OFFSET ?
        `;
        const {rows} = await db.query(query, [limit, offset]);
        return rows[0];
    }
}

module.exports = User;