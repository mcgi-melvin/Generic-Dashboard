const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const generateAccessToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
        algorithm: jwtConfig.algorithm
    });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.refreshExpiresIn,
        algorithm: jwtConfig.algorithm
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
};