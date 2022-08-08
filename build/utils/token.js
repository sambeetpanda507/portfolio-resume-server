"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccessTokenForGoogle = exports.createAccessToken = exports.createRefreshTokenForGoogle = exports.createRefreshToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const env_config_1 = require("../config/env.config");
const redis_1 = require("./redis");
const http_errors_1 = require("http-errors");
const createRefreshToken = async (res, user) => {
    const refreshToken = (0, jsonwebtoken_1.sign)({ userId: user.id }, env_config_1.envConfig.__JWT_REFRESH_SECRET__, {
        expiresIn: '5h'
    });
    try {
        await redis_1.redisClient.set(user.id, refreshToken, {
            EX: 5 * 60 * 60
        });
    }
    catch (e) {
        console.log(e.message);
        throw new http_errors_1.InternalServerError();
    }
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        sameSite: env_config_1.envConfig.__NODE_ENV__ === 'production' ? 'none' : 'strict',
        secure: env_config_1.envConfig.__NODE_ENV__ === 'production'
    });
};
exports.createRefreshToken = createRefreshToken;
const createRefreshTokenForGoogle = async (res, user) => {
    const refreshToken = (0, jsonwebtoken_1.sign)({ userId: user.id }, env_config_1.envConfig.__JWT_REFRESH_SECRET__, {
        expiresIn: '5h'
    });
    try {
        await redis_1.redisClient.set(user.id, refreshToken, {
            EX: 5 * 60 * 60
        });
    }
    catch (e) {
        console.log(e.message);
        throw new http_errors_1.InternalServerError();
    }
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        sameSite: env_config_1.envConfig.__NODE_ENV__ === 'production' ? 'none' : 'strict',
        secure: env_config_1.envConfig.__NODE_ENV__ === 'production'
    });
};
exports.createRefreshTokenForGoogle = createRefreshTokenForGoogle;
const createAccessToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user.id }, env_config_1.envConfig.__JWT_ACCESS_SECRET, {
        expiresIn: '1h'
    });
};
exports.createAccessToken = createAccessToken;
const createAccessTokenForGoogle = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user.id }, env_config_1.envConfig.__JWT_ACCESS_SECRET, {
        expiresIn: '1h'
    });
};
exports.createAccessTokenForGoogle = createAccessTokenForGoogle;
