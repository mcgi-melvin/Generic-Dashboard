const db = require('../config/db');

class Session {
    static async create(sessionData) {
        const { user_id, token, refresh_token, ip_address, user_agent, expires_at } = sessionData;
        const query = `
        INSERT INTO sessions (user_id, token, refresh_token, ip_address, user_agent, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, token, expires_at, created_at
        `;
        const result = await db.query(query, [user_id, token, refresh_token, ip_address, user_agent, expires_at]);
        return result.rows[0];
    }

    static async findByToken(token) {
        const query = `
        SELECT * FROM sessions 
        WHERE token = $1 AND is_valid = true AND expires_at > CURRENT_TIMESTAMP
        `;
        const result = await db.query(query, [token]);
        return result.rows[0];
    }

    static async findByRefreshToken(refreshToken) {
        const query = `
        SELECT * FROM sessions 
        WHERE refresh_token = $1 AND is_valid = true
        `;
        const result = await db.query(query, [refreshToken]);
        return result.rows[0];
    }

    static async invalidateSession(token) {
        const query = 'UPDATE sessions SET is_valid = false WHERE token = $1';
        await db.query(query, [token]);
    }

    static async invalidateAllUserSessions(userId) {
        const query = 'UPDATE sessions SET is_valid = false WHERE user_id = $1';
        await db.query(query, [userId]);
    }

    static async getUserActiveSessions(userId) {
        const query = `
        SELECT id, ip_address, user_agent, created_at, last_activity
        FROM sessions 
        WHERE user_id = $1 AND is_valid = true AND expires_at > CURRENT_TIMESTAMP
        ORDER BY last_activity DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    static async cleanupExpiredSessions() {
        const query = 'DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP';
        const result = await db.query(query);
        return result.rowCount;
    }

    static async updateActivity(token) {
        const query = 'UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE token = $1';
        await db.query(query, [token]);
    }
}

module.exports = Session;