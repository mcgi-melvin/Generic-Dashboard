const User = require('../../model/User');
const Session = require('../../model/Session');
const { hashPassword, comparePassword } = require('../../util/hashPassword');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../../util/generateToken');

const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, role_id = 3 } = req.body;

        const existingUser = await User.findByEmail(email);
        if (existingUser?.length) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            email,
            password: hashedPassword,
            first_name,
            last_name,
            role_id
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Account not registered'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is disabled'
            });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role_name
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await Session.create({
            user_id: user.id,
            token: accessToken,
            refresh_token: refreshToken,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            expires_at: expiresAt
        });

        await User.updateLastLogin(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role_name,
                    permissions: user.permissions
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

const logout = async (req, res) => {
    try {
        await Session.invalidateSession(req.token);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        const session = await Session.findByRefreshToken(token);
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Session not found'
            });
        }

        const user = await User.findById(decoded.userId);
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role_name
        };

        const newAccessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        await Session.invalidateSession(session.token);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await Session.create({
            user_id: user.id,
            token: newAccessToken,
            refresh_token: newRefreshToken,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            expires_at: expiresAt
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = req.user;

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role_name,
                permissions: user.permissions,
                is_active: user.is_active,
                email_verified: user.email_verified,
                last_login: user.last_login,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

const getSessions = async (req, res) => {
    try {
        const sessions = await Session.getUserActiveSessions(req.user.id);

        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sessions'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    getProfile,
    getSessions
};