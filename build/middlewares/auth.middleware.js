"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const env_config_1 = require("../config/env.config");
const http_errors_1 = require("http-errors");
const isAuthenticated = async (req, _, next) => {
    try {
        const accessToken = req.headers['authorization'];
        if (!accessToken)
            throw new http_errors_1.Unauthorized();
        const token = accessToken.split(' ')[1];
        if (!token)
            throw new http_errors_1.Unauthorized();
        const payload = (0, jsonwebtoken_1.verify)(token, env_config_1.envConfig.__JWT_ACCESS_SECRET);
        if (!payload)
            throw new http_errors_1.Unauthorized();
        req.userId = payload.userId;
        next();
    }
    catch (e) {
        console.error('[error] : ', e.message);
        next(new http_errors_1.Unauthorized());
    }
};
exports.isAuthenticated = isAuthenticated;
